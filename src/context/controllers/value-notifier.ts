import { ContextCallback } from '@lit/context';

type Disposer = () => void;

interface CallbackInfo {
    disposer: Disposer;
    consumerHost: Element;
}

/**
 * @see https://github.com/lit/lit/blob/main/packages/context/src/lib/value-notifier.ts
 */
export class ValueNotifier<T> {

    get value(): T {
        return this._value;
    }

    set value(v: T) {
        this.setValue(v);
    }

    protected readonly subscriptions = new Map<
        ContextCallback<T>,
        CallbackInfo
    >();

    private _value!: T;

    public constructor(defaultValue?: T) {
        if (defaultValue !== undefined) {
            this.value = defaultValue;
        }
    }

    public setValue(v: T, force = false): void {
        let update: boolean = force || !Object.is(v, this._value);

        this._value = v;

        if (update) {
            this._updateObservers();
        }
    }

    public clearCallbacks(): void {
        this.subscriptions.clear();
    }

    protected addCallback(callback: ContextCallback<T>, consumerHost: Element, subscribe?: boolean): void {
        if (!subscribe) {
            callback(this.value);
            return;
        }

        if (!this.subscriptions.has(callback)) {
            this.subscriptions.set(callback, {
                disposer: (): void => {
                    this.subscriptions.delete(callback);
                },
                consumerHost,
            });
        }

        let {disposer} = this.subscriptions.get(callback)!;

        callback(this.value, disposer);
    }

    private _updateObservers = (): void => {
        for (const [callback, {disposer}] of this.subscriptions) {
            callback(this._value, disposer);
        }
    };
}
