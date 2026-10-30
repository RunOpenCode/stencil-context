import { Config } from '@stencil/core';

const isProd: boolean = 'production' === process.env.STENCIL_ENV;

export const config: Config = {
    tsconfig:          isProd ? './tsconfig.prod.json' : './tsconfig.json',
    namespace:         'stencil-context',
    outputTargets:     [
        {
            type:          'dist',
            esmLoaderPath: '../loader',
        },
        {
            type: 'dist-custom-elements',
        },
        {
            type:          'www',
            serviceWorker: null,
        },
    ],
    globalScript:      'src/global.ts',
    excludeComponents: ['consume-example', 'provide-example', 'app-example'],
    buildDist:         true,
};
