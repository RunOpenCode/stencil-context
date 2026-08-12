import {
    describe,
    it,
    vi,
    expect,
    beforeEach,
}                 from 'vitest';
import {
    afterEach,
    render,
}                 from '@stencil/vitest';
import { h }      from '@stencil/core';
import { Logger } from './logger';

describe('Consumer subscribes on provider value change.', (): void => {

    beforeEach((): void => {
        vi.stubGlobal('UNPROVIDED_BEHAVIOR', 'wait');
        vi.stubGlobal('SUBSCRIBE_BEHAVIOR', true);
    });

    afterEach((): void => {
        vi.unstubAllGlobals();
    });

    it('It will subscribe to provider value changes.', async (): Promise<void> => {
        const {root, unmount} = await render(
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

        (root as HTMLProvideExampleElement).logger = new Logger('Foo');
        
        logger = await consumer.getLogger();

        expect(logger).toBeDefined();
        expect(logger?.emitted).toStrictEqual([]);
        
        consumer.shadowRoot?.querySelector('button')?.click();

        expect(logger?.emitted).toStrictEqual([
            '[LOG][Foo] Button clicked',
        ]);
        
        unmount();
    });

});