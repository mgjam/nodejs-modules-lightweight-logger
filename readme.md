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
const lib = require("lightweigh-logger");

lib.default.configure(new lib.LoggerOptions(
    (log, data) => { 
        log["correlationId"] = data.correlationId; // extend log object with given field
        return log; 
    },
    new lib.ConsoleLoggerOptions(true), // Use console logger
    new lib.FileLoggerOptions(true, "C:/Log") // Use file logger, write to given path (new log file per hour)
));

const logger = lib.default.createLogger({correlationId: "xyz"});

for (let i = 0; i < 10000; i++)
    setTimeout(() => logger.log(i.toString(), lib.LogSeverity.Info), i);