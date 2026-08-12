import {
    Context,
    createContext,
} from '../../';

export class Logger {

    public section: string = 'Unspecified';

    public emitted: string[] = [];

    public constructor(section?: string) {
        this.section = section ?? this.section;
    }

    public log(message: string): void {
        message = `[LOG][${this.section}] ${message}`;
        this.emitted.push(message);
    }
}

export const LOGGER: Context<unknown, Logger> = createContext<Logger>(Symbol.for('logger'));