import { beforeAll } from 'vitest';

beforeAll(async (): Promise<void> => {
    await import('./dist/stencil-context/stencil-context.esm');
});

export {};