import {
    Component,
    Host,
    h,
    ComponentInterface,
    Prop,
}                  from '@stencil/core';
import { Provide } from '../context/decorator/provide';
import {
    Logger,
    logger,
}                  from './logger';

@Component({
    tag:    'provide-example',
    shadow: true,
})
export class ProvideExample implements ComponentInterface {

    @Prop()
    public get section(): string {
        return this._logger.section;
    }

    public set section(value: string) {
        this._logger.section = value;
    }

    @Provide(logger)
    // @ts-ignore
    private readonly _logger: Logger = new Logger();

    public render(): any {
        return (
            <Host>
                <slot />
            </Host>
        )
    }
}
