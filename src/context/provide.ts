import { Context }         from '@lit/context';
import { ContextProvider } from './controllers/context-provider';

type ElementProvidersMap = Map<Context<unknown, unknown>, ContextProvider<Context<unknown, unknown>>>;

// Registry of all providers for given HTML element.
let providers: WeakMap<HTMLElement, ElementProvidersMap> = new WeakMap<HTMLElement, ElementProvidersMap>();

export function provide<ValueType>(
    context: Context<unknown, ValueType>,
    value: ValueType,
    element: HTMLElement | string | null = null,
): void {
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
        elemProviders.set(context as Context<unknown, ValueType>, new ContextProvider(elem, {
            context:      context as Context<unknown, ValueType>,
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