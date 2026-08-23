import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getContextUser, getRequestId } from '../../common/middleware/requestContext';

const isProduction = process.env.NODE_ENV === 'production';
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const LOG_LEVEL = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

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

// Priority key order for the final log object, e.g. { timestamp, level, message, requestId, userId, ...rest }
const KEY_ORDER = ['timestamp', 'level', 'message', 'requestId', 'userId', 'stack'];

/**
 * Turns an Error instance into a plain, JSON-serializable object.
 * Without this, `JSON.stringify(someError)` produces `{}` because
 * `message` and `stack` are non-enumerable own properties on Error.
 */
function serializeError(err: Error, seen: WeakSet<object>): Record<string, unknown> {
    const { name, message, stack, ...rest } = err as unknown as Record<string, unknown> & Error;
    return {
        name,
        message,
        stack,
        // preserve any custom fields attached to the error (err.code, err.statusCode, etc.)
        ...(Object.keys(rest).length
            ? (serializeValue(rest, seen) as Record<string, unknown>)
            : {}),
    };
}

/**
 * Recursively walks a value, redacting sensitive keys and converting
 * Error instances into plain serializable objects. Handles circular refs.
 */
function serializeValue(value: unknown, seen: WeakSet<object> = new WeakSet()): unknown {
    if (value === null || value === undefined) return value;

    if (value instanceof Error) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
        return serializeError(value, seen);
    }

    if (typeof value !== 'object') return value;

    if (seen.has(value as object)) return '[Circular]';
    seen.add(value as object);

    if (Array.isArray(value)) return value.map((item) => serializeValue(item, seen));

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        result[key] = SENSITIVE_KEYS.has(key.toLowerCase())
            ? '[REDACTED]'
            : serializeValue(val, seen);
    }
    return result;
}

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
            info[key] = serializeValue(info[key]);
        }
    }

    return info;
});

// Rebuilds key insertion order so JSON output is always
// { timestamp, level, message, requestId?, userId?, stack?, ...rest }
// instead of whatever order fields happened to be attached in.
const orderFormat = winston.format((info) => {
    const rest = Object.keys(info).filter((key) => !KEY_ORDER.includes(key));
    for (const key of [...KEY_ORDER, ...rest]) {
        if (key in info) {
            const val = info[key];
            delete info[key];
            info[key] = val;
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
        // Pretty-print meta so nested objects (e.g. serialized errors) are actually readable
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} ${level}${reqIdStr}: ${stack || message}${metaStr}`;
    }),
);

const prodFormat = winston.format.combine(
    contextFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redactFormat(),
    orderFormat(),
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
