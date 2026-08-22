import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

interface RequestContext {
    requestId: string;
    userId?: string;
    ip?: string;
    startTime: number;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Must be registered BEFORE any route/middleware that logs, and before
 * morgan's httpLogger. Reuses an inbound X-Request-Id if the caller (e.g.
 * an upstream gateway or test harness) already set one, so traces stay
 * consistent across services.
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-request-id'];
    const trimmed = typeof incoming === 'string' ? incoming.trim() : '';
    const requestId = trimmed ? trimmed : randomUUID();

    res.setHeader('X-Request-Id', requestId);

    const context: RequestContext = {
        requestId,
        ip: req.ip,
        startTime: Date.now(),
    };

    requestContextStorage.run(context, () => next());
}

export function getRequestId(): string | undefined {
    return requestContextStorage.getStore()?.requestId;
}

/** Call this once you know who the authenticated user is (e.g. in your auth middleware). */
export function setContextUser(userId: string): void {
    const store = requestContextStorage.getStore();
    if (store) store.userId = userId;
}

export function getContextUser(): string | undefined {
    return requestContextStorage.getStore()?.userId;
}

export function getRequestStartTime(): number | undefined {
    return requestContextStorage.getStore()?.startTime;
}
