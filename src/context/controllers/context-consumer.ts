import {
    ContextCallback,
    ContextEvent,
    Context,
    ContextType,
} from '@lit/context';

export interface ContextConsumerOptions<C extends Context<unknown, unknown>> {
    context: C;
    callback?: (value: ContextType<C>, dispose?: () => void) => void;
    subscribe?: boolean;
}

export type CallbackFn<C extends Context<unknown, unknown>> = (value: ContextType<C>, dispose?: () => void) => void;

/**
 * @internal
 *
 * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-consumer.ts
 */
export class ContextConsumer<C extends Context<unknown, unknown>> {

    public value?: ContextType<C> = undefined;

    private readonly _host: HTMLElement;

    private readonly _context: C;

    private readonly _callback: CallbackFn<C> | null;

    private readonly _subscribe: boolean = false;

    private _provided: boolean = false;

    private _unsubscribe: (() => void) | null = null;

    public constructor(host: HTMLElement, options: ContextConsumerOptions<C>) {
        this._host      = host;
        this._context   = options.context;
        this._callback  = options.callback ?? null;
        this._subscribe = options.subscribe ?? false;
    }

    /**
     * Call this method when consumer is connected to the DOM.
     *
     * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-consumer.ts#L81
     */
    public hostConnected(): void {
        this._host.dispatchEvent(
            new ContextEvent(
                this._context,
                this._host,
                this._provide,
                this._subscribe,
            ),
        );
    }

    /**
     * Call this method when consumer is disconnected from the DOM.
     *
     * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-consumer.ts#L85
     */
    public hostDisconnected(): void {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        this._unsubscribe = null;
    }

    /**
     * This function will be called by context provider when the context value is available.
     *
     * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/controllers/context-consumer.ts#L85
     */
    private _provide: ContextCallback<ContextType<C>> = (value: ContextType<C>, unsubscribe?: () => void): void => {
        if (this._unsubscribe) {
            if (this._unsubscribe !== unsubscribe) {
                this._provided = false;
                this._unsubscribe();
            }
            
            if (!this._subscribe) {
                this._unsubscribe();
            }
        }
        
        this.value = value;
        
        if (!this._provided || this._subscribe) {
            this._provided = true;
            
            if (this._callback) {
                this._callback(value, unsubscribe);
            }
        }

        this._unsubscribe = unsubscribe ?? null;
    };
}
