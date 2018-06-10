# lightweight-logger
Lightweight logger for nodejs application

## Features
Logs are serialized as JSON objects

Possibility to extend log object with custom properties via injection

## Installation
```sh
npm install lightweight-logger
```

## Usage [JS]
```js
const lib = require("lightweight-logger");

lib.configure({
    // extend log object with given field
    logExtensionFunc: (log, data) => {
        log["correlationId"] = data.correlationId;
        return log;
    },
    consoleLoggerOptions: {
        // Use console logger
        useConsoleLogger: true
    },
    fileLoggerOptions: {
        // Use file logger. New log file per hour is created automatically
        useFileLogger: true,
        // Write to given path (path must exist!)
        logPath: "C:/Log"
    }
});

const logger = lib.createLogger({correlationId: "xyz"});

for (let i = 0; i < 2; i++)
    logger.i(i.toString());

logger.e({message: "log message", data: {foo: "bar"}}, new Error("error message"));

/*
 * Output: C:/Log/2018_6_10_6.log
 * 
 * {"message":"0","timeStamp":"2018-06-10T06:30:45.548Z","severity":"Info","correlationId":"xyz"}
 * {"message":"1","timeStamp":"2018-06-10T06:30:45.548Z","severity":"Info","correlationId":"xyz"}
 * {"message":"log message","data":{"foo":"bar"},"timeStamp":"2018-06-10T06:30:45.548Z","severity":"Error","error":{"stack":"<intentionally removed>","message":"error message"},"correlationId":"xyz"}
 * /
```