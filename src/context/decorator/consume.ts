import {
    ComponentInterface,
    getElement,
}                           from '@stencil/core';
import { ContextConsumer }  from '../controllers/context-consumer';
import {
    Context,
    createContext,
}                           from '../context';
import { Deferred }         from '../utils/deferred';
import { ConsumeDecorator } from './types';

/**
 * Consume options.
 */
export type ConsumeOptions = {
    /**
     * Should property be updated as value of context provided changes? False by default.
     */
    subscribe?: boolean;
    /**
     * If context could not be provided at the `componentWillLoad()` lifecycle hook, what
     * action should be taken, possible options:
     *
     * - `ignore`: Default option, will allow for component to be initialized without context value. Useful when context value is optional.
     * - `wait`: Will wait on context value and block further lifecycle hooks until value is obtained. In order for this to work, it is advised for context root to be initialized.
     * - `error`: Will throw an error.
     */
    unprovided?: 'ignore' | 'wait' | 'error';
};

/**
 * A property decorator that adds a ContextConsumer controller to the component
 * which will try to retrieve a value for the property via the context protocol API.
 *
 * @param {Context|string} context A Context identifier value created via `createContext`, or string as service identifier.
 * @param {ConsumeOptions} options An optional object which allows for configuring the behavior of the decorator.
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
 *   @Consume(loggerContext)
 *   logger: Logger;
 *
 *   componentDidLoad() {
 *     this.logger.log('element loaded');
 *   }
 * }
 * ```
 */
export function Consume<ValueType>(context: Context<unknown, ValueType> | string, options: ConsumeOptions = {}): ConsumeDecorator<ValueType> {
    return ((cmp: ComponentInterface, property: string): void => {
        let connectedCallback: (() => unknown) | undefined                                      = cmp.connectedCallback;
        let disconnectedCallback: (() => unknown) | undefined                                   = cmp.disconnectedCallback;
        let componentWillLoad: (() => Promise<void> | void) | undefined                         = cmp.componentWillLoad;
        let deferred: Deferred<void>                                                            = new Deferred<void>();
        let consumer: WeakMap<HTMLElement, ContextConsumer<Context<unknown, ValueType>>> = new WeakMap();

        cmp.connectedCallback = function (): void {
            let element: HTMLElement = getElement(this);
            
            if (!consumer.has(element)) {
                consumer.set(element, new ContextConsumer(element, {
                    context:   'string' === typeof context ? createContext(context) : context,
                    callback:  (value: ValueType): void => {
                        this[property] = value;

                        if (deferred.pending) {
                            deferred.resolve();
                        }
                    },
                    subscribe: options.subscribe || false,
                }));
            }

            consumer.get(element)?.hostConnected();

            if (connectedCallback) {
                connectedCallback.call(this);
            }
        }

        cmp.disconnectedCallback = function (): void {
            if (disconnectedCallback) {
                disconnectedCallback.call(this);
            }

            consumer.get(getElement(this))?.hostDisconnected();
        }

        cmp.componentWillLoad = async function (): Promise<void> {
            if ('ignore' === (options.unprovided || 'ignore')) {
                return componentWillLoad ? componentWillLoad.call(this) : Promise.resolve();
            }

            // Wait for next tick.
            await Promise.resolve();

            if ('error' === options.unprovided && deferred.pending) {
                deferred.reject(new Error(`Context "${context.toString()}" could not be found.`));
            }

            await deferred.promise;

            return componentWillLoad ? componentWillLoad.call(this) : Promise.resolve();
        }
    }) as ConsumeDecorator<ValueType>;
}
