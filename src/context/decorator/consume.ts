import {
    ComponentInterface,
    getElement,
}                          from '@stencil/core';
import { ContextConsumer } from '../controllers/context-consumer';
import { Context }         from '@lit/context';

/**
 * A property decorator that adds a ContextConsumer controller to the component
 * which will try and retrieve a value for the property via the Context API.
 *
 * @param context A Context identifier value created via `createContext`
 * @param subscribe An optional boolean which when true allows the value to be updated
 *   multiple times.
 *
 * @example
 *
 * ```ts
 * import {Consume} from '@runopencode/stencil-context';
 * import {loggerContext, Logger} from './logger-context.js';
 *
 * @Component({
 *   tag: 'my-element',
 * })
 * export class MyElement {
 *   @Consume({context: loggerContext})
 *   logger?: Logger;
 *
 *   componentDidLoad() {
 *     this.logger?.log('element loaded');
 *   }
 * }
 * ```
 * @category Decorator
 */
export function Consume<ValueType>(context: Context<unknown, ValueType>, subscribe: boolean = true): ConsumeDecorator<ValueType> {
    return ((cmp: ComponentInterface, property: string): void => {
        let connectedCallback: (() => unknown) | undefined                                      = cmp.connectedCallback;
        let disconnectedCallback: (() => unknown) | undefined                                   = cmp.disconnectedCallback;
        let consumer: WeakMap<ComponentInterface, ContextConsumer<Context<unknown, ValueType>>> = new WeakMap();

        cmp.connectedCallback = function (): void {
            if (connectedCallback) {
                connectedCallback.call(this);
            }

            if (!consumer.has(this)) {
                consumer.set(this, new ContextConsumer(getElement(this), {
                    context:   context as Context<unknown, ValueType>,
                    callback:  (value: ValueType): void => {
                        this[property] = value;
                    },
                    subscribe: subscribe,
                }));
            }

            consumer.get(this)?.hostConnected();
        }

        cmp.disconnectedCallback = function (): void {
            if (disconnectedCallback) {
                disconnectedCallback.call(this);
            }

            consumer.get(this)?.hostDisconnected();
        }
    }) as ConsumeDecorator<ValueType>;
}

type Interface<T> = {
    [K in keyof T]: T[K];
};

type DecoratorReturn = void | any;

type FieldMustMatchProvidedType<Obj, Key extends PropertyKey, ProvidedType> =
// First we check whether the object has the property as a required field
    Obj extends Record<Key, infer ConsumingType>
        ? // Ok, it does, just check whether it's ok to assign the
        // provided type to the consuming field
        [ProvidedType] extends [ConsumingType]
            ? DecoratorReturn
            : {
                message: 'provided type not assignable to consuming field';
                provided: ProvidedType;
                consuming: ConsumingType;
            }
        : // Next we check whether the object has the property as an optional field
        Obj extends Partial<Record<Key, infer ConsumingType>>
            ? // Check assignability again. Note that we have to include undefined
            // here on the consuming type because it's optional.
            [ProvidedType] extends [ConsumingType | undefined]
                ? DecoratorReturn
                : {
                    message: 'provided type not assignable to consuming field';
                    provided: ProvidedType;
                    consuming: ConsumingType | undefined;
                }
            : // Ok, the field isn't present, so either someone's using consume
            // manually, i.e. not as a decorator (maybe don't do that! but if you do,
            // you're on your own for your type checking, sorry), or the field is
            // private, in which case we can't check it.
            DecoratorReturn;

type ConsumeDecorator<ValueType> = {
    // legacy
    <
        K extends PropertyKey,
        Proto extends Interface<ComponentInterface>,
    >(
        protoOrDescriptor: Proto,
        name?: K,
    ): FieldMustMatchProvidedType<Proto, K, ValueType>;

    // standard
    <
        C extends Interface<ComponentInterface>,
        V extends ValueType,
    >(
        value: ClassAccessorDecoratorTarget<C, V>,
        context: ClassAccessorDecoratorContext<C, V>,
    ): void;
};
