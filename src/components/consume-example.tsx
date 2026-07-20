import {
    Component,
    State,
    Host,
    h,
    ComponentInterface,
} from '@stencil/core';
import { Consume } from '../context/decorator/consume';
import {
    Logger,
    logger,
}                  from './logger';

@Component({
    tag:    'consume-example',
    shadow: true,
})
export class ConsumeExample implements ComponentInterface {

    @State()
    @Consume(logger)
    private logger!: Logger;
    
    private handleClick = (): void => {
        this.logger.log('Button clicked');
    }
    
    public render(): any {
        return (
            <Host>
                <button
                    onClick={this.handleClick}
                    type="button"
                >
                    Log using logger: {this.logger.section}
                </button>
                <slot/>
            </Host>
        );
    }
}
