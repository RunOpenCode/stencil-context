import { provide }       from './context/provide';
import { initialize }    from './context/decorator/initializer';
import { createContext } from '@lit/context';

export default function (): void {

    initialize();

    (globalThis as any).provideContext = provide;
    (globalThis as any).createContext  = createContext;
}