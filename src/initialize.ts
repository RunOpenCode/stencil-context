import { provideContext } from './context/provide-context';
import {
    ContextRoot,
    createContext,
}                         from '@lit/context';

let root: ContextRoot | null = null;

/**
 * Global initializer.
 * 
 * Ensures context root is available because StencilJS triggers
 * connected callback from child to parents.
 * 
 * Exposes `provideContext` and `createContext` functions to be
 * globally accessible.
 */
export default function (): void {
    if (null !== root) {
        return;
    }

    root = new ContextRoot();
    root.attach(document.body);

    (globalThis as any).provideContext = provideContext;
    (globalThis as any).createContext  = createContext;
}
