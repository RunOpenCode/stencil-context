import { ContextEvent }  from '@lit/context';
import { ValueNotifier } from './value-notifier';
import type {
    Context,
    ContextType,
}                        from '@lit/context';

/**
 * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-provider.ts#L25
 */
export class ContextProviderEvent<C extends Context<unknown, unknown>> extends Event {

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

/**
 * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-provider.ts#L43
 */
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

    public constructor(host: HTMLElement, options: ContextProviderOptions<T>) {
        super(options.initialValue);

        this._host    = host;
        this._context = options.context;
    }

    /**
     * Set the value for this context provider.
     */
    public setValue(value: ContextType<T>, force = false): void {
        super.setValue(value, force);
    }

    /**
     * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-provider.ts#L43
     */
    public hostConnected(): void {
        this._host.addEventListener('context-request', this._onContextRequest);
        this._host.addEventListener('context-provider', this._onProviderRequest);
        
        this._host.dispatchEvent(new ContextProviderEvent(this._context, this._host));
    }

    /**
     * Detach the provider from the DOM. This should be called when the host element is disconnected.
     */
    public hostDisconnected(): void {
        this._host.removeEventListener('context-request', this._onContextRequest);
        this._host.removeEventListener('context-provider', this._onProviderRequest);
        
        this.clearCallbacks();
    }

    /**
     * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-provider.ts#L96
     */
    private _onContextRequest = (event: ContextEvent<Context<unknown, unknown>>): void => {
        if (event.context !== this._context) {
            return;
        }

        let consumerHost: Element = event.contextTarget ?? (event.composedPath()[0] as Element);

        if (consumerHost === this._host) {
            return;
        }

        event.stopPropagation();

        this.addCallback(event.callback, consumerHost, event.subscribe);
    };

    /**
     * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-provider.ts#L119
     */
    private _onProviderRequest = (event: ContextProviderEvent<Context<unknown, unknown>>): void => {
        if (event.context !== this._context) {
            return;
        }

        let childProviderHost: Element = event.contextTarget ?? (event.composedPath()[0] as Element);

        if (childProviderHost === this._host) {
            return;
        }

        let seen: Set<unknown> = new Set<unknown>();

        for (let [callback, {consumerHost}] of this.subscriptions) {
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
}
