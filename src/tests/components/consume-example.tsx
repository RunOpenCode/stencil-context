import {
    Component,
    State,
    Host,
    h,
    ComponentInterface,
    Method,
}                  from '@stencil/core';
import { Consume } from '../../';
import {
    Logger,
    LOGGER,
}                  from './logger';

@Component({
    tag:    'consume-example',
    shadow: true,
})
export class ConsumeExample implements ComponentInterface {

    @State()
    @Consume(LOGGER, {
        unprovided: (globalThis.window as any).UNPROVIDED_BEHAVIOR || 'ignore',
        subscribe:  (globalThis.window as any).SUBSCRIBE_BEHAVIOR || false,
    })
    private _logger?: Logger;

    @Method()
    public async getLogger(): Promise<Logger | undefined> {
        return this._logger;
    }

    public connectedCallback(): void {
        this._logger?.log('Component connected!');
    }

    public componentWillLoad(): Promise<void> | void {
        this._logger?.log('Component will load!');
    }

    private _handleClick = (): void => {
        this._logger?.log('Button clicked');
    }

    public render(): any {
        this._logger?.log('Component rendered!');
        return (
            <Host>
                <button
                    onClick={this._handleClick}
                    type='button'
                >
                    Click to log.
                </button>
                <slot />
            </Host>
        );
    }
}
