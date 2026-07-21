import {
    Context,
    createContext,
}                           from '@lit/context';
import {
    ComponentInterface,
    getElement,
}                           from '@stencil/core';
import { ContextProvider }  from '../controllers/context-provider';
import { ProvideDecorator } from './types';

/**
 * A property decorator that adds a ContextProvider controller to the component
 * making it respond to any `context-request` events from its children consumer.
 *
 * @param {Context|string} context A Context identifier value created via `createContext`, or string as a service identifier.
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
 *   @Provide(loggerContext)
 *   logger = new Logger();
 * }
 * ```
 */
export function Provide<ValueType>(context: Context<unknown, ValueType> | string): ProvideDecorator<ValueType> {
    return ((cmp: ComponentInterface, property: string): void => {
        let connectedCallback: (() => unknown) | undefined                                      = cmp.connectedCallback;
        let disconnectedCallback: (() => unknown) | undefined                                   = cmp.disconnectedCallback;
        let provider: WeakMap<ComponentInterface, ContextProvider<Context<unknown, ValueType>>> = new WeakMap();

        cmp.connectedCallback = function (): void {
            if (connectedCallback) {
                connectedCallback.call(this);
            }

            if (!provider.has(this)) {
                provider.set(this, new ContextProvider(getElement(this), {
                    context:      'string' === typeof context ? createContext(context) : context,
                    initialValue: this[property],
                }));
            }

            provider.get(this)?.hostConnected();
        }

        cmp.disconnectedCallback = function (): void {
            if (disconnectedCallback) {
                disconnectedCallback.call(this);
            }

            provider.get(this)?.hostDisconnected();
        }

    }) as ProvideDecorator<ValueType>;
}
