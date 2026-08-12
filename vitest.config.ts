import { defineVitestConfig } from '@stencil/vitest/config';

export default defineVitestConfig({
    stencilConfig: './stencil.config.ts',
    test:          {
        coverage: {
            provider: 'v8',
            include:  ['src/context/**/*.{ts,tsx}'],
        },
        projects: [
            {
                test: {
                    name:        'unit',
                    include:     ['src/tests/**/*.unit.{ts,tsx}'],
                    environment: 'node',
                },
            },
            {
                test: {
                    name:               'spec',
                    include:            ['src/tests/**/*.spec.{ts,tsx}'],
                    environment:        'stencil',
                    setupFiles:         ['./vitest-setup.ts'],
                    environmentOptions: {
                        stencil: {
                            domEnvironment: 'mock-doc',
                        },
                    },
                },
            },
        ],
    },
});