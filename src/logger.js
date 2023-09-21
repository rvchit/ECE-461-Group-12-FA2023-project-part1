"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var dotenv = require("dotenv");
dotenv.config();
var LOG_LEVEL = process.env.LOG_LEVEL || '0';
var LOG_FILE = process.env.LOG_FILE || './combined.log';
var winstonLogLevel;
switch (LOG_LEVEL) {
    case '0':
        winstonLogLevel = 'error';
        break;
    case '1':
        winstonLogLevel = 'info';
        break;
    case '2':
        winstonLogLevel = 'debug';
        break;
    default:
        winstonLogLevel = 'error';
}
var createModuleLogger = function (moduleName) {
    return (0, winston_1.createLogger)({
        level: winstonLogLevel,
        format: winston_1.format.combine(winston_1.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }), winston_1.format.printf(function (_a) {
            var timestamp = _a.timestamp, level = _a.level, message = _a.message;
            return "".concat(timestamp, " ").concat(level, " [").concat(moduleName, "]: ").concat(message);
        })),
        transports: [
            new winston_1.transports.File({ filename: LOG_FILE }),
        ],
    });
};
exports.default = createModuleLogger;
