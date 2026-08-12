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

describe('Consumer ignores missing context.', (): void => {

    beforeEach((): void => {
        vi.stubGlobal('UNPROVIDED_BEHAVIOR', 'ignore');
    });

    afterEach((): void => {
        vi.unstubAllGlobals();
    });

    it('It will ignore missing context.', async (): Promise<void> => {
        let {root, unmount} = await render(
            <consume-example />,
        );

        expect(root).toEqualHtml(`                                                                                                                                                                                                                                                                                                      
  <consume-example class="hydrated">
    <mock:shadow-root>
      <button type="button">
        Click to log.
      </button>
      <slot></slot>
    </mock:shadow-root>
  </consume-example>
`);

        unmount();
    });

});