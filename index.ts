import * as path from "path";
import * as fs from "graceful-fs";
import { setTimeout } from "timers";

export interface LogManager {
    configure(loggerOptions: LoggerOptions): void;
    createLogger(data?: any): Logger;
}

export class LoggerOptions {
    readonly logExtensionFunc: LogExtensionFunc;
    readonly consoleLoggerOptions: ConsoleLoggerOptions;
    readonly fileLoggerOptions: FileLoggerOptions;

    constructor(logExtensionFunc?: LogExtensionFunc, consoleLoggerOptions?: ConsoleLoggerOptions, fileLoggerOptions?: FileLoggerOptions) {
        this.logExtensionFunc = logExtensionFunc || ((log, data) => log);
        this.consoleLoggerOptions = consoleLoggerOptions || new ConsoleLoggerOptions();
        this.fileLoggerOptions = fileLoggerOptions || new FileLoggerOptions();
    }
}

export interface LogExtensionFunc {
    (log: object, data?: any): object;
}

export class ConsoleLoggerOptions {
    readonly useConsoleLogger: boolean;

    constructor(useConsoleLogger?: boolean) {
        this.useConsoleLogger = useConsoleLogger || false;
    }
}

export class FileLoggerOptions {
    readonly useFileLogger: boolean;
    readonly logPath: string;

    constructor(useFileLogger?: boolean, logPath?: string) {
        this.useFileLogger = useFileLogger || false;
        this.logPath = logPath || "./";
    }
}

export interface Logger {
    log(log: string | object, severity: LogSeverity): void;
}

export enum LogSeverity {
    Debug,
    Info,
    Warn,
    Error
}

class FileLogger implements Logger {
    private readonly consoleLogger: ConsoleLogger;
    private readonly loggerOptions: LoggerOptions;
    private readonly data?: any;

    constructor(loggerOptions: LoggerOptions, data?: any) {
        this.consoleLogger = new ConsoleLogger(loggerOptions.consoleLoggerOptions);
        this.loggerOptions = loggerOptions;
        this.data = data;
    }

    log(log: string | object, severity: LogSeverity): void {
        const date = new Date();
        const toLog = this.serializeLog(log, severity, date);
        this.consoleLogger.log(toLog, severity);

        if (!this.loggerOptions.fileLoggerOptions.useFileLogger)
            return;

        fs.writeFile(this.getLogFileName(date), toLog + "\r\n", { flag: "a+" }, err => { });
    }

    serializeLog(log: string | object, severity: LogSeverity, date: Date): string {
        const logObj = typeof log === "string" ? { log } : log;

        (<any>logObj)["dateTime"] = date.toISOString();
        (<any>logObj)["severity"] = LogSeverity[severity];

        return JSON.stringify(this.loggerOptions.logExtensionFunc(logObj, this.data));
    }

    getLogFileName(date: Date): string {
        const dateStr = date.getFullYear().toString() + "_" + (date.getMonth() + 1) + "_" + date.getDate().toString() + "_" + date.getHours().toString();

        return path.join(this.loggerOptions.fileLoggerOptions.logPath, `${dateStr}.log`);
    }
}

class ConsoleLogger {
    private readonly consoleLoggerOptions: ConsoleLoggerOptions;

    constructor(consoleLoggerOptions: ConsoleLoggerOptions) {
        this.consoleLoggerOptions = consoleLoggerOptions;
    }

    log(log: string, severity: LogSeverity) {
        if (!this.consoleLoggerOptions.useConsoleLogger)
            return;

        if (severity === LogSeverity.Error)
            console.error(log);
        else
            console.log(log);
    }
}

let loggerOptions: LoggerOptions = new LoggerOptions();

export default {
    configure: (options: LoggerOptions) => { loggerOptions = options; },
    createLogger: (data?: any): Logger => new FileLogger(loggerOptions, data)
} as LogManager;
