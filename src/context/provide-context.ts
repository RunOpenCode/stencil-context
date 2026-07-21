import {
    Context,
    createContext,
}                          from '@lit/context';
import { ContextProvider } from './controllers/context-provider';

type ElementProvidersMap = Map<Context<unknown, unknown>, ContextProvider<Context<unknown, unknown>>>;

// Registry of all providers for given HTML element.
let providers: WeakMap<HTMLElement, ElementProvidersMap> = new WeakMap<HTMLElement, ElementProvidersMap>();

/**
 * Provide context to the HTML element.
 *
 * Use this function to provide a context value to a specific HTML element. The context value
 * will be available to any child elements that consume the same context.
 *
 * This is useful for providing globally accessible services to all subnodes without
 * flickering that occurs when rendering slotted content.
 *
 * @param {Context|string} context A Context identifier value created via `createContext`, or string as service identifier.
 * @param {any} value Context value.
 * @param {HTMLElement|string|null} element The HTML element or selector to provide the context to. If not provided, context will be attached to the `body` element.
 */
export function provideContext<ValueType>(
    context: Context<unknown, ValueType> | string,
    value: ValueType,
    element: HTMLElement | string | null = null,
): void {
    context               = 'string' === typeof context ? createContext(context) : context;
    let elem: HTMLElement = getElement(element);

    if (!elem.isConnected) {
        throw new Error(`Element ${elem} is not connected to the DOM. Please ensure the element is connected before providing a context.`);
    }

    if (!providers.has(elem)) {
        providers.set(elem, new Map());
    }

    let elemProviders: ElementProvidersMap = providers.get(elem) as ElementProvidersMap;
    let triggerConnected: boolean          = false;

    if (!elemProviders.has(context as Context<unknown, ValueType>)) {
        elemProviders.set(context, new ContextProvider(elem, {
            context:      context,
            initialValue: value,
        }));

        triggerConnected = true;
    }

    let provider: ContextProvider<Context<unknown, ValueType>> = elemProviders.get(context as Context<unknown, ValueType>) as ContextProvider<Context<unknown, ValueType>>;

    if (provider.value !== value) {
        provider.setValue(value, true);
    }

    if (triggerConnected) {
        provider.hostConnected();
    }
}

function getElement(element: HTMLElement | string | null = null): HTMLElement {
    if (element instanceof HTMLElement) {
        return element;
    }

    if (null === element) {
        return globalThis.document.body;
    }

    return globalThis.document.querySelector(element) as HTMLElement;
}