import { Request } from 'express';
import morgan from 'morgan';
import { getRequestId } from './requestContext';
import logger from '../config/logger/config';
import config from '../config/config';

const isProduction = config.NODE_ENV === 'production';

morgan.token('id', () => getRequestId() || '-');
morgan.token(
    'userId',
    (req: Request) => (req as Request & { user?: { id?: string } }).user?.id || '-',
);

// Structured JSON access log for production log pipelines (ELK, Loki, CloudWatch, etc.)
morgan.format('json', (tokens, req, res) => {
    return JSON.stringify({
        requestId: tokens.id(req, res),
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTimeMs: Number(tokens['response-time'](req, res)),
        contentLength: tokens.res(req, res, 'content-length') ?? '0',
        userAgent: tokens['user-agent'](req, res),
        remoteAddr: tokens['remote-addr'](req, res),
        userId: tokens.userId(req, res),
    });
});

const devFormat = ':id :method :url :status :response-time ms - :res[content-length]b';

const stream = {
    write: (message: string): void => {
        if (isProduction) {
            try {
                const data = JSON.parse(message);
                const level = data.status >= 500 ? 'error' : data.status >= 400 ? 'warn' : 'http';
                logger.log(level, `${data.method} ${data.url} ${data.status}`, data);
                return;
            } catch {
                // fall through to raw logging if parsing ever fails
            }
        }
        logger.http(message.trim());
    },
};

/**
 * Register AFTER requestContextMiddleware so :id resolves correctly.
 * Health checks and static assets are skipped to keep production logs signal-heavy.
 */
export const httpLogger = morgan(isProduction ? 'json' : devFormat, {
    stream,
    skip: (req: Request) => req.url === '/health' || req.url === '/favicon.ico',
});
