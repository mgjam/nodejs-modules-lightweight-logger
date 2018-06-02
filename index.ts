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
    readonly logExtensionFunc? : LogExtensionFunc;

    constructor(logExtensionFunc?: LogExtensionFunc) {
        this.logExtensionFunc = logExtensionFunc;
    }
}

export interface LogManager {
    init(loggerOptions: LoggerOptions): void;
    createLogger(data?: any): Logger;
}

class ConsoleLogger implements Logger {
    private readonly logExtensionFunc: LogExtensionFunc;
    private readonly data?: any;

    constructor(logExtensionFunc: LogExtensionFunc, data?: any) {
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
        console.log(this.serializeLog(log));
    }

    logAsync(log: string | object): Promise<void> {
        this.log(log);
        return Promise.resolve();
    }

    error(log: string | object): void {
        console.error(this.serializeLog(log));
    }

    errorAsync(log: string | object): Promise<void> {
        this.error(log);
        return Promise.resolve();
    }
}

let logExtensionFunc: LogExtensionFunc = (log, data) => log;

export default {
    init: (loggerOptions: LoggerOptions) => {
        if (loggerOptions && loggerOptions.logExtensionFunc)
            logExtensionFunc = loggerOptions.logExtensionFunc;
    },
    createLogger: (data?: any): Logger => new ConsoleLogger(logExtensionFunc, data)
} as LogManager;
