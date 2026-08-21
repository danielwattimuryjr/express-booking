import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getContextUser, getRequestId } from '../../middleware/requestContext';

const isProduction = process.env.NODE_ENV === 'production';
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const LOG_LEVEL = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

/**
 * Keys that must NEVER show up in logs, regardless of nesting depth.
 * Extend this list as your domain models grow.
 */
const SENSITIVE_KEYS = new Set([
    'password',
    'newpassword',
    'oldpassword',
    'confirmpassword',
    'token',
    'accesstoken',
    'refreshtoken',
    'authorization',
    'cookie',
    'secret',
    'apikey',
    'creditcard',
    'cardnumber',
    'cvv',
    'ssn',
]);

function redact(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value as object)) return '[Circular]';
    seen.add(value as object);

    if (Array.isArray(value)) return value.map((item) => redact(item, seen));

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : redact(val, seen);
    }
    return result;
}

/** Injects the correlation id + authenticated user (if any) from AsyncLocalStorage. */
const contextFormat = winston.format((info) => {
    const requestId = getRequestId();
    const userId = getContextUser();
    if (requestId) info.requestId = requestId;
    if (userId) info.userId = userId;
    return info;
});

const redactFormat = winston.format((info) => {
    const reservedKeys = new Set(['level', 'message', 'timestamp', 'stack', 'requestId', 'userId']);

    for (const key of Object.keys(info)) {
        if (!reservedKeys.has(key)) {
            info[key] = redact(info[key]);
        }
    }

    return info;
});

const devFormat = winston.format.combine(
    contextFormat(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    redactFormat(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, requestId, stack, ...meta }) => {
        const reqIdStr = requestId ? ` [${requestId}]` : '';
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}${reqIdStr}: ${stack || message}${metaStr}`;
    }),
);

const prodFormat = winston.format.combine(
    contextFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redactFormat(),
    winston.format.json(),
);

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: isProduction ? prodFormat : devFormat,
    }),
];

if (isProduction) {
    transports.push(
        new DailyRotateFile({
            dirname: LOG_DIR,
            filename: 'application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'info',
            format: prodFormat,
        }),
        new DailyRotateFile({
            dirname: LOG_DIR,
            filename: 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '90d',
            level: 'error',
            format: prodFormat,
        }),
    );
}

export const logger = winston.createLogger({
    level: LOG_LEVEL,
    levels: winston.config.npm.levels, // error, warn, info, http, verbose, debug, silly
    transports,
    exceptionHandlers: isProduction
        ? [
              new DailyRotateFile({
                  dirname: LOG_DIR,
                  filename: 'exceptions-%DATE%.log',
                  datePattern: 'YYYY-MM-DD',
                  zippedArchive: true,
                  format: prodFormat,
              }),
          ]
        : [new winston.transports.Console({ format: devFormat })],
    rejectionHandlers: isProduction
        ? [
              new DailyRotateFile({
                  dirname: LOG_DIR,
                  filename: 'rejections-%DATE%.log',
                  datePattern: 'YYYY-MM-DD',
                  zippedArchive: true,
                  format: prodFormat,
              }),
          ]
        : [new winston.transports.Console({ format: devFormat })],
    exitOnError: false,
});

export default logger;
