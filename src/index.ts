import {
    Context,
    ContextProviderEvent,
    ContextRequestEvent,
} from './context/context';

declare global {
    interface HTMLElementEventMap {
        'context-request': ContextRequestEvent<Context<unknown, unknown>>;
        'context-provider': ContextProviderEvent<Context<unknown, unknown>>;
    }
}

export * from './context/context';
export * from './context/controllers/context-consumer';
export * from './context/controllers/context-provider';
export * from './context/decorator/provide';
export * from './context/decorator/consume';
export * from './context/functions/provide-context';
export * from './context/functions/consume-context';
export * from './context/functions/context-root';
export * from './context/utils/context-root';
export * from './context/utils/deferred';
