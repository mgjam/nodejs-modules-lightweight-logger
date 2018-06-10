import * as path from "path";
import * as fs from "graceful-fs";

export interface LogManager {
    configure(loggerOptions: LoggerOptions): void;
    createLogger(data?: any): Logger;
}

export interface LoggerOptions {
    readonly logExtensionFunc: LogExtensionFunc;
    readonly consoleLoggerOptions: ConsoleLoggerOptions;
    readonly fileLoggerOptions: FileLoggerOptions;
}

export interface LogExtensionFunc {
    (log: object, data?: any): object;
}

export interface ConsoleLoggerOptions {
    readonly useConsoleLogger: boolean;
}

export interface FileLoggerOptions {
    readonly useFileLogger: boolean;
    readonly logPath: string;
}

export interface Logger {
    d(log: string | object): void;
    i(log: string | object): void;
    w(log: string | object): void;
    e(log: string | object, err?: any): void;
}

enum LogSeverity {
    Debug,
    Info,
    Warning,
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

    d(log: string | object): void { this.log(log, LogSeverity.Debug); }
    i(log: string | object): void { this.log(log, LogSeverity.Info); }
    w(log: string | object): void { this.log(log, LogSeverity.Warning); }
    e(log: string | object, err?: any): void { this.log(log, LogSeverity.Error, err); }

    private log(log: string | object, severity: LogSeverity, err?: any): void {
        const date = new Date();
        const toLog = this.serializeLog(log, severity, date, err);

        this.consoleLogger.log(toLog, severity);

        if (!this.loggerOptions.fileLoggerOptions.useFileLogger)
            return;

        fs.writeFile(this.getLogFileName(date), toLog + "\r\n", { flag: "a+" }, err => { });
    }

    private serializeLog(log: string | object, severity: LogSeverity, date: Date, err?: any): string {
        const logObj = typeof log === "object" ? (log ? log : { message: "" }) : { "message": (log === undefined || log === null ? "" : log.toString()) };

        (<any>logObj)["timeStamp"] = date.toISOString();
        (<any>logObj)["severity"] = LogSeverity[severity];
        if (err) (<any>logObj)["error"] = typeof err == "object" ? this.copyObj(err) : err.toString();

        return JSON.stringify(this.loggerOptions.logExtensionFunc(logObj, this.data));
    }

    private getLogFileName(date: Date): string {
        const dateStr = date.getUTCFullYear().toString() + "_" + (date.getUTCMonth() + 1) + "_" + date.getUTCDate().toString() + "_" + date.getUTCHours().toString();

        return path.join(this.loggerOptions.fileLoggerOptions.logPath, `${dateStr}.log`);
    }

    private copyObj(obj: object): object {
        var alt = {};

        Object.getOwnPropertyNames(obj).forEach(function (key) {
            (<any>alt)[key] = (<any>obj)[key];
        }, this);

        return alt;
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

let loggerOptions: LoggerOptions = {
    logExtensionFunc: (log, data) => log,
    consoleLoggerOptions: {
        useConsoleLogger: false
    },
    fileLoggerOptions: {
        useFileLogger: false,
        logPath: "./"
    }
};

const configure = (options: LoggerOptions): void => { loggerOptions = options; }

const createLogger = (data?: any): Logger => new FileLogger(loggerOptions, data);

export {
    configure,
    createLogger
};
