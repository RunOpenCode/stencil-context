import {
    describe,
    it,
    vi,
    expect,
    beforeEach,
}                         from 'vitest';
import {
    afterEach,
    render,
}                         from '@stencil/vitest';
import { h }              from '@stencil/core';
import { createContext }  from '../../context/context';
import { provideContext } from '../../context/functions/provide-context';
import {
    LOGGER,
    Logger,
}                         from './logger';

describe('Consumer waits on missing context.', (): void => {

    beforeEach((): void => {
        vi.stubGlobal('UNPROVIDED_BEHAVIOR', 'wait');
    });

    afterEach((): void => {
        vi.unstubAllGlobals();
    });

    it('It will wait on context from provider.', async (): Promise<void> => {
        let {root, unmount} = await render(
            <provide-example />,
        );

        root.append(document.createElement('consume-example'));
        
        let consumer: HTMLConsumeExampleElement = root.querySelector('consume-example') as HTMLConsumeExampleElement;
        let logger: Logger | undefined          = await consumer.getLogger();

        expect(logger).toBeDefined();
        expect(logger?.emitted).toStrictEqual([
            '[LOG][Unspecified] Component connected!',
            '[LOG][Unspecified] Component will load!',
            '[LOG][Unspecified] Component rendered!',
        ]);

        expect(root).toEqualHtml(`
<provide-example class="hydrated">
  <mock:shadow-root>
    <slot></slot>
  </mock:shadow-root>
  <consume-example class="hydrated">
    <mock:shadow-root>
      <button type="button">
        Click to log.
      </button>
      <slot></slot>
    </mock:shadow-root>
  </consume-example>
</provide-example>
        `);

        unmount();
    });

    it('It will wait on context from provider, with the help of context root.', async (): Promise<void> => {
        let {root, unmount} = await render(
            <div id="context-root">
                <div id="provider">
                    <consume-example />
                </div>
            </div>,
            {
                waitForReady: false,
            }
        );

        createContext(root.querySelector('#context-root') as HTMLDivElement);

        let provider: HTMLDivElement = root.querySelector('#provider') as HTMLDivElement;

        provideContext(LOGGER, new Logger('Foo'), provider);
        
        await Promise.resolve();

        let consumer: HTMLConsumeExampleElement = root.querySelector('consume-example') as HTMLConsumeExampleElement;
        let logger: Logger | undefined          = await consumer.getLogger();

        expect(logger).toBeDefined();
        expect(logger?.emitted).toStrictEqual([
            '[LOG][Foo] Component connected!',
            '[LOG][Foo] Component will load!',
            '[LOG][Foo] Component rendered!',
        ]);

        unmount();
    });

});