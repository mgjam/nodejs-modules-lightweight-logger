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

lib.default.configure(new lib.LoggerOptions(
    (log, data) => { 
        log["correlationId"] = data.correlationId; // extend log object with given field
        return log; 
    },
    new lib.ConsoleLoggerOptions(true), // Use console logger
    // Use file logger, write to given path (path must exist!)
    // New log file per hour is created automatically
    new lib.FileLoggerOptions(true, "C:/Log") 
));

const logger = lib.default.createLogger({correlationId: "xyz"});

for (let i = 0; i < 2; i++)
    logger.log(i.toString(), lib.LogSeverity.Info);

logger.log({message: "log message", data: {foo: "bar"}}, lib.LogSeverity.Error);

/*
 * Output: C:/Log/2018_6_9_10.log
 * 
 * {"log":"0","dateTime":"2018-06-09T10:17:10.749Z","severity":"Info","correlationId":"xyz"}
 * {"log":"1","dateTime":"2018-06-09T10:17:10.765Z","severity":"Info","correlationId":"xyz"}
 * {"message":"log message","data":{"foo":"bar"},"dateTime":"2018-06-09T10:17:10.765Z","severity":"Error","correlationId":"xyz"}
 */
```