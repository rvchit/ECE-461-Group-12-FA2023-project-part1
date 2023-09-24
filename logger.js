"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const LOG_LEVEL = process.env.LOG_LEVEL || '0';
const LOG_FILE = process.env.LOG_FILE;
let winstonLogLevel;
switch (LOG_LEVEL) {
    case '0':
        winstonLogLevel = 'silent';
        break;
    case '1':
        winstonLogLevel = 'info';
        break;
    case '2':
        winstonLogLevel = 'debug';
        break;
    default:
        winstonLogLevel = 'silent';
}
const createModuleLogger = (moduleName) => {
    // Determine the appropriate transport based on the environment.
    const selectedTransports = [];
    selectedTransports.push(new winston_1.transports.File({ filename: LOG_FILE }));
    return (0, winston_1.createLogger)({
        level: winstonLogLevel,
        format: winston_1.format.combine(winston_1.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }), winston_1.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} [${moduleName}]: ${message}`)),
        transports: selectedTransports,
    });
};
exports.default = createModuleLogger;
