export interface Logger {
    log(log: string | object): void;
    logAsync(log: string | object): Promise<void>;
    error(log: string | object): void;
    errorAsync(log: string | object): Promise<void>;
}

export interface LogExtensionFunc {
    (log: object, data?: any): object;
}

export class LoggerOptions {
    readonly useConsoleLogger: boolean;
    readonly logExtensionFunc : LogExtensionFunc;

    constructor(useConsoleLogger?: boolean, logExtensionFunc?: LogExtensionFunc) {
        this.useConsoleLogger = useConsoleLogger || false;
        this.logExtensionFunc = logExtensionFunc ||  ((log, data) => log);
    }
}

export interface LogManager {
    init(loggerOptions: LoggerOptions): void;
    createLogger(data?: any): Logger;
}

class NullLogger implements Logger {
    log(log: string | object): void {
        
    }

    logAsync(log: string | object): Promise<void> {
        return Promise.resolve();
    }

    error(log: string | object): void {
    
    }

    errorAsync(log: string | object): Promise<void> {
        return Promise.resolve();
    }
}

class ConsoleLogger implements Logger {
    private readonly logger: Logger;
    private readonly logExtensionFunc: LogExtensionFunc;
    private readonly data?: any;

    constructor(logger: Logger, logExtensionFunc: LogExtensionFunc, data?: any) {
        this.logger = logger;
        this.logExtensionFunc = logExtensionFunc;
        this.data = data;
    }

    private serializeLog(log: string | object) {
        const rawLog = typeof log === "string" ? {log} : log;
        const extendedLog = this.logExtensionFunc(rawLog, this.data);
        const serializedLog = JSON.stringify(extendedLog);
        
        return serializedLog;
    }

    log(log: string | object): void {
        this.logger.log(log);
        console.log(this.serializeLog(log));
    }

    async logAsync(log: string | object): Promise<void> {
        await this.logger.log(log);
        this.log(log);
        return Promise.resolve();
    }

    error(log: string | object): void {
        this.logger.error(log);
        console.error(this.serializeLog(log));
    }

    async errorAsync(log: string | object): Promise<void> {
        await this.logger.error(log);
        this.error(log);
        return Promise.resolve();
    }
}

let loggerOptions: LoggerOptions;

export default {
    init: (options: LoggerOptions) => {
        loggerOptions = options;
    },
    createLogger: (data?: any): Logger => {
        const nullLogger = new NullLogger();
        const consoleLogger = loggerOptions.useConsoleLogger
            ? new ConsoleLogger(nullLogger, loggerOptions.logExtensionFunc, data)
            : nullLogger;

        return consoleLogger;
    }
} as LogManager;
