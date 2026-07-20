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
    protected readonly subscriptions = new Map<
        ContextCallback<T>,
        CallbackInfo
    >();
    private _value!: T;
    get value(): T {
        return this._value;
    }

    set value(v: T) {
        this.setValue(v);
    }

    setValue(v: T, force = false) {
        const update = force || !Object.is(v, this._value);
        this._value  = v;
        if (update) {
            this.updateObservers();
        }
    }

    constructor(defaultValue?: T) {
        if (defaultValue !== undefined) {
            this.value = defaultValue;
        }
    }

    updateObservers = (): void => {
        for (const [callback, {disposer}] of this.subscriptions) {
            callback(this._value, disposer);
        }
    };

    addCallback(
        callback: ContextCallback<T>,
        consumerHost: Element,
        subscribe?: boolean,
    ): void {
        if (!subscribe) {
            // just call the callback once and we're done
            callback(this.value);
            return;
        }
        if (!this.subscriptions.has(callback)) {
            this.subscriptions.set(callback, {
                disposer: () => {
                    this.subscriptions.delete(callback);
                },
                consumerHost,
            });
        }
        const {disposer} = this.subscriptions.get(callback)!;
        callback(this.value, disposer);
    }

    clearCallbacks(): void {
        this.subscriptions.clear();
    }
}
