import {
    Context,
    createContext,
}                           from '../context';
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
        let connectedCallback: (() => unknown) | undefined                               = cmp.connectedCallback;
        let disconnectedCallback: (() => unknown) | undefined                            = cmp.disconnectedCallback;
        let provider: WeakMap<HTMLElement, ContextProvider<Context<unknown, ValueType>>> = new WeakMap();
        let initialize: (element: HTMLElement, value: ValueType) => void                 = function (element: HTMLElement, value: ValueType): void {
            if (provider.has(element)) {
                return;
            }

            provider.set(element, new ContextProvider(element, {
                context:      'string' === typeof context ? createContext(context) : context,
                initialValue: value,
            }));
        }

        cmp.connectedCallback = function (): void {
            let element: HTMLElement = getElement(this);

            initialize(element, this[property]);
            provider.get(element)!.hostConnected();

            if (connectedCallback) {
                connectedCallback.call(this);
            }
        }

        cmp.disconnectedCallback = function (): void {
            if (disconnectedCallback) {
                disconnectedCallback.call(this);
            }

            provider.get(getElement(this))!.hostDisconnected();
        }

        // proxy any existing setter for this property and use it to
        // notify the controller of an updated value
        let descriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(cmp, property);

        if (undefined === descriptor) {
            Object.defineProperty(cmp, property, {
                get(this: ComponentInterface): ValueType | undefined {
                    return provider.get(getElement(this))?.value;
                },
                set(this: ComponentInterface, value: ValueType): void {
                    let element: HTMLElement = getElement(this);
                    initialize(element, value);
                    provider.get(element)!.setValue(value);
                },
                configurable: true,
                enumerable:   true,
            });

            return;
        }

        let previous: ((value: ValueType) => void) | undefined = descriptor.set;

        Object.defineProperty(cmp, property, {
            ...descriptor,
            set(this: ComponentInterface, value: ValueType): void {
                let element: HTMLElement = getElement(this);
                initialize(element, value);
                provider.get(element)!.setValue(value);
                previous?.call(this, value);
            },
        });

    }) as ProvideDecorator<ValueType>;
}
