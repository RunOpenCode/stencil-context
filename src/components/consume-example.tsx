import { createContext } from '@lit/context';
import {
    Component,
    State,
    Host,
    h,
    ComponentInterface,
}                        from '@stencil/core';
import { Consume } from '../context/decorator/consume';
import {
    ErrorLogger,
    logger,
    Logger,
} from './logger';

@Component({
    tag:    'consume-example',
    shadow: true,
})
export class ConsumeExample implements ComponentInterface {

    @State()
    @Consume(createContext('error_logger'))
    private errorLogger!: ErrorLogger;
    
    @Consume(logger)
    private logger!: Logger

    private handleClick = (): void => {
        this.errorLogger.error('Button clicked');
        this.logger.log('Clicked');
    }

    public render(): any {
        return (
            <Host>
                <button
                    onClick={this.handleClick}
                    type='button'
                >
                    Log Error
                </button>
                <slot />
            </Host>
        );
    }
}
