import {
    Component,
    Host,
    h,
    ComponentInterface,
    Prop,
}                  from '@stencil/core';
import { Provide } from '../../';
import {
    Logger,
    LOGGER,
}                  from './logger';

@Component({
    tag:    'provide-example',
    shadow: true,
})
export class ProvideExample implements ComponentInterface {

    @Prop()
    public get section(): string {
        return this.logger.section;
    }

    public set section(value: string) {
        this.logger.section = value;
    }

    @Provide(LOGGER)
    @Prop()
    public readonly logger: Logger = new Logger();

    public render(): any {
        return (
            <Host>
                <slot />
            </Host>
        )
    }
}
