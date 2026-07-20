import { ContextEvent }  from '@lit/context';
import { ValueNotifier } from './value-notifier';
import type {
    Context,
    ContextType,
}                        from '@lit/context';

export class ContextProviderEvent<C extends Context<unknown, unknown>> extends Event {

    /**
     * @param context the context which this provider can provide
     * @param contextTarget the original context target of the provider
     */
    public constructor(
        public readonly context: C,
        public readonly contextTarget: Element,
    ) {
        super('context-provider', {
            bubbles:  true,
            composed: true,
        });
    }
}

export interface ContextProviderOptions<C extends Context<unknown, unknown>> {
    context: C;
    initialValue?: ContextType<C>;
}

/**
 * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-provider.ts
 */
export class ContextProvider<T extends Context<unknown, unknown>> extends ValueNotifier<ContextType<T>> {

    protected readonly _host: HTMLElement;

    private readonly _context: T;

    private _unsubscribeOnDisconnect: (() => void) | null = null;

    public constructor(host: HTMLElement, options: ContextProviderOptions<T>) {
        super(options.initialValue);

        this._host    = host;
        this._context = options.context;

        this.attachListeners();
    }

    /**
     * Attach the provider to the DOM. This should be called when the host element is connected.
     */
    public hostConnected(): void {
        this._host.dispatchEvent(new ContextProviderEvent(this._context, this._host));
    }

    /**
     * Detach the provider from the DOM. This should be called when the host element is disconnected.
     */
    public hostDisconnected(): void {
        if (!this._unsubscribeOnDisconnect) {
            return;
        }

        this._unsubscribeOnDisconnect();
        this._unsubscribeOnDisconnect = null;
    }

    /**
     * Set the value for this context provider
     */
    public setValue(value: ContextType<T>, force = false): void {
        super.setValue(value, force);
    }

    private _onContextRequest = (event: ContextEvent<Context<unknown, unknown>>): void => {
        // Only call the callback if the context matches.
        if (event.context !== this._context) {
            return;
        }

        // Also, in case an element is a consumer AND a provider
        // of the same context, we want to avoid the element to self-register.
        let consumerHost: Element = event.contextTarget ?? (event.composedPath()[0] as Element);

        if (consumerHost === this._host) {
            return;
        }

        event.stopPropagation();

        this.addCallback(event.callback, consumerHost, event.subscribe);
    };
    
    private _onProviderRequest = (event: ContextProviderEvent<Context<unknown, unknown>>,): void => {
        // Ignore events when the context doesn't match.
        if (event.context !== this._context) {
            return;
        }
        
        // Also, in case an element is a consumer AND a provider
        // of the same context it shouldn't provide to itself.
        let childProviderHost: Element = event.contextTarget ?? (event.composedPath()[0] as Element);
        
        if (childProviderHost === this._host) {
            return;
        }
        
        // Re-parent all of our subscriptions in case this new child provider
        // should take them over.
        let seen: Set<unknown> = new Set<unknown>();
        
        for (let [callback, {consumerHost}] of this.subscriptions) {
            // Prevent infinite loops in the case where a one host element
            // is providing the same context multiple times.
            if (seen.has(callback)) {
                continue;
            }
            
            seen.add(callback);
            
            consumerHost.dispatchEvent(
                new ContextEvent(this._context, consumerHost, callback, true),
            );
        }

        event.stopPropagation();
    };

    private attachListeners() {
        this._host.addEventListener('context-request', this._onContextRequest);
        this._host.addEventListener('context-provider', this._onProviderRequest);
    }
}
