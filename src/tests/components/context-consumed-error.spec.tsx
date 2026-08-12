import {
    describe,
    it,
    vi,
    expect,
    beforeEach,
}            from 'vitest';
import {
    afterEach,
    render,
}            from '@stencil/vitest';
import { h } from '@stencil/core';

describe('Consumer errors on missing context.', (): void => {

    beforeEach((): void => {
        vi.stubGlobal('UNPROVIDED_BEHAVIOR', 'error');
    });

    afterEach((): void => {
        vi.unstubAllGlobals();
    });

    it('It will error out for missing dependency.', async (): Promise<void> => {
        await expect(render(
            <consume-example />,
        )).rejects.toThrow('Context "Symbol(logger)" could not be found.');
    });

});