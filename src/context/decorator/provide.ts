import { Context }         from '@lit/context';
import {
    ComponentInterface,
    getElement,
}                          from '@stencil/core';
import { ContextProvider } from '../controllers/context-provider';
import { initialize }      from './initializer';

initialize();

/**
 * A property decorator that adds a ContextProvider controller to the component
 * making it respond to any `context-request` events from its children consumer.
 *
 * @param context A Context identifier value created via `createContext`
 *
 * @example
 *
 * ```ts
 * import {Provide} from '@runopencode/stencil-context';
 * import {Logger} from 'my-logging-library';
 * import {loggerContext} from './logger-context.js';
 *
 * @Component({
 *   tag: 'my-app',
 * })
 * export class MyApp {
 *   @Provide({context: loggerContext})
 *   logger = new Logger();
 * }
 * ```
 * @category Decorator
 */
export function Provide<ValueType>(context: Context<unknown, ValueType>): ProvideDecorator<ValueType> {
    return ((cmp: ComponentInterface, property: string): void => {
        let connectedCallback: (() => unknown) | undefined                                      = cmp.connectedCallback;
        let disconnectedCallback: (() => unknown) | undefined                                   = cmp.disconnectedCallback;
        let provider: WeakMap<ComponentInterface, ContextProvider<Context<unknown, ValueType>>> = new WeakMap();

        cmp.connectedCallback = function (): void {
            if (connectedCallback) {
                connectedCallback();
            }

            if (!provider.has(this)) {
                provider.set(this, new ContextProvider(getElement(this), {
                    context:      context,
                    initialValue: this[property],
                }));
            }

            provider.get(this)?.hostConnected();
        }

        cmp.disconnectedCallback = function (): void {
            if (disconnectedCallback) {
                disconnectedCallback();
            }

            provider.get(this)?.hostDisconnected();
        }

    }) as ProvideDecorator<ValueType>;
}

type Interface<T> = {
    [K in keyof T]: T[K];
};

type ProvideDecorator<ContextType> = {
    // legacy
    <
        K extends PropertyKey,
        Proto extends Interface<ComponentInterface>,
    >(
        protoOrDescriptor: Proto,
        name?: K,
    ): FieldMustMatchContextType<Proto, K, ContextType>;

    // standard
    <
        C extends Interface<ComponentInterface>,
        V extends ContextType,
    >(
        value: ClassAccessorDecoratorTarget<C, V>,
        context: ClassAccessorDecoratorContext<C, V>,
    ): void;
};

// Note TypeScript requires the return type of a decorator to be `void | any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DecoratorReturn = void | any;

type FieldMustMatchContextType<Obj, Key extends PropertyKey, ContextType> =
// First we check whether the object has the property as a required field
    Obj extends Record<Key, infer ProvidingType>
        ? // Ok, it does, just check whether it's ok to assign the
        // provided type to the consuming field
        [ProvidingType] extends [ContextType]
            ? DecoratorReturn
            : {
                message: 'providing field not assignable to context';
                context: ContextType;
                provided: ProvidingType;
            }
        : // Next we check whether the object has the property as an optional field
        Obj extends Partial<Record<Key, infer Providing>>
            ? // Check assignability again. Note that we have to include undefined
            // here on the providing type because it's optional.
            [Providing | undefined] extends [ContextType]
                ? DecoratorReturn
                : {
                    message: 'providing field not assignable to context';
                    context: ContextType;
                    consuming: Providing | undefined;
                }
            : // Ok, the field isn't present, so either someone's using provide
            // manually, i.e. not as a decorator (maybe don't do that! but if you do,
            // you're on your own for your type checking, sorry), or the field is
            // private, in which case we can't check it.
            DecoratorReturn;