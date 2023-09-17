import { createLogger, format, transports} from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const LOG_LEVEL = process.env.LOG_LEVEL || '0';
const LOG_FILE = process.env.LOG_FILE || './combined.log';

let winstonLogLevel: 'error' | 'info' | 'debug';
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

const createModuleLogger = (moduleName: string) => {
    return createLogger({
        level: winstonLogLevel,
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.printf(({ timestamp, level, message }) => `${timestamp} ${level} [${moduleName}]: ${message}`),
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: LOG_FILE }),
        ],
    });
};

export default createModuleLogger;