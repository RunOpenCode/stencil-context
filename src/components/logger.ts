import {
    Context,
    createContext,
} from '@lit/context';

export class Logger {

    public section: string = 'Unspecified';

    public log(message: string): void {
        console.log(`[${this.section}] ${message}`);
    }
}

export class ErrorLogger {
    public error(message: string): void {
        console.log(`[ERROR] ${message}`);
    }
}

export const logger: Context<unknown, Logger> = createContext<Logger>(Symbol.for('logger'));