import {
    ComponentInterface,
    getElement,
}                           from '@stencil/core';
import { ContextConsumer }  from '../controllers/context-consumer';
import {
    Context,
    createContext,
}                           from '@lit/context';
import { ConsumeDecorator } from './types';

/**
 * A property decorator that adds a ContextConsumer controller to the component
 * which will try and retrieve a value for the property via the Context API.
 *
 * @param {Context|string} context A Context identifier value created via `createContext`, or string as service identifier.
 * @param {boolean} subscribe An optional boolean which when true allows the value to be updated multiple times.
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
 *   @Consume(context: loggerContext)
 *   logger?: Logger;
 *
 *   componentDidLoad() {
 *     this.logger?.log('element loaded');
 *   }
 * }
 * ```
 */
export function Consume<ValueType>(context: Context<unknown, ValueType> | string, subscribe: boolean = true): ConsumeDecorator<ValueType> {
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
                    context:   'string' === typeof context ? createContext(context) : context,
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
