import {
    Component,
    Host,
    h,
    ComponentInterface,
} from '@stencil/core';
import { Logger } from './logger';

@Component({
    tag:    'app-example',
    shadow: true,
})
export class AppExample implements ComponentInterface {
    
    private _consumer!: HTMLConsumeExampleElement;
    
    private _textarea!: HTMLTextAreaElement;
    
    private _handleFlush = (): void => {
        this._consumer.getLogger().then((logger?: Logger): void => {
            this._textarea.value = logger?.emitted.join('\n') || '';
        });
    }

    public render(): any {
        return (
            <Host>
                <provide-example section={'AppExample'}>
                    <consume-example ref={(el) => (this._consumer = el as HTMLConsumeExampleElement)} />
                </provide-example>

                <div/>
                
                <button id="flush-app" type="button" onClick={this._handleFlush}>Flush</button>

                <div/>

                <textarea id="textarea-app" rows={10} cols={50} ref={(el) => (this._textarea = el as HTMLTextAreaElement)} />
            </Host>
        );
    }
}
