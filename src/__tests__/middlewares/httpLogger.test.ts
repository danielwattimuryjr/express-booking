import { Request, Response, NextFunction } from 'express';

jest.mock('../../middleware/requestContext');
jest.mock('../../config/logger/config', () => ({
    log: jest.fn(),
    http: jest.fn(),
}));
jest.mock('morgan', () => {
    const morganMock = jest.fn(
        () => (_req: Request, _res: Response, next: NextFunction) => next(),
    ) as jest.Mock & { token: jest.Mock; format: jest.Mock };

    morganMock.token = jest.fn();
    morganMock.format = jest.fn();

    return morganMock;
});

describe('HttpLogger Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    // Import EVERY mocked dependency together with httpLogger, from the same
    // fresh module registry, so assertions reference the exact instances
    // httpLogger.ts actually calls internally.
    async function loadHttpLogger() {
        const morganModule = await import('morgan');
        const requestContextModule = await import('../../middleware/requestContext');
        const loggerModule = await import('../../config/logger/config');
        const { httpLogger } = await import('../../middleware/httpLogger');

        const morganMock = morganModule.default as unknown as jest.Mock & {
            token: jest.Mock;
            format: jest.Mock;
        };
        const getRequestId = requestContextModule.getRequestId as jest.Mock;
        const logger = loggerModule.default as unknown as { log: jest.Mock; http: jest.Mock };

        return { httpLogger, morganMock, getRequestId, logger };
    }

    it('should export httpLogger as a middleware', async () => {
        const { httpLogger } = await loadHttpLogger();
        expect(typeof httpLogger).toBe('function');
    });

    describe('id token', () => {
        it('should return the current request id', async () => {
            const { morganMock, getRequestId } = await loadHttpLogger();
            getRequestId.mockReturnValue('req-123');

            const idTokenCallback = morganMock.token.mock.calls.find(
                (call) => call[0] === 'id',
            )?.[1];

            expect(idTokenCallback()).toBe('req-123');
        });

        it('should fallback to "-" when no request id', async () => {
            const { morganMock, getRequestId } = await loadHttpLogger();
            getRequestId.mockReturnValue(undefined);

            const idTokenCallback = morganMock.token.mock.calls.find(
                (call) => call[0] === 'id',
            )?.[1];

            expect(idTokenCallback()).toBe('-');
        });
    });

    describe('userId token', () => {
        it('should return user id when present on request', async () => {
            const { morganMock } = await loadHttpLogger();

            const userIdTokenCallback = morganMock.token.mock.calls.find(
                (call) => call[0] === 'userId',
            )?.[1];

            const req = { user: { id: 'user-42' } } as Request & { user: { id: string } };
            expect(userIdTokenCallback(req)).toBe('user-42');
        });

        it('should fallback to "-" when no user on request', async () => {
            const { morganMock } = await loadHttpLogger();

            const userIdTokenCallback = morganMock.token.mock.calls.find(
                (call) => call[0] === 'userId',
            )?.[1];

            expect(userIdTokenCallback({} as Request)).toBe('-');
        });
    });

    describe('skip function', () => {
        it('should skip /health', async () => {
            const { morganMock } = await loadHttpLogger();

            const options = morganMock.mock.calls[0][1];
            expect(options.skip({ url: '/health' } as Request)).toBe(true);
        });

        it('should skip /favicon.ico', async () => {
            const { morganMock } = await loadHttpLogger();

            const options = morganMock.mock.calls[0][1];
            expect(options.skip({ url: '/favicon.ico' } as Request)).toBe(true);
        });

        it('should not skip other routes', async () => {
            const { morganMock } = await loadHttpLogger();

            const options = morganMock.mock.calls[0][1];
            expect(options.skip({ url: '/api/users' } as Request)).toBe(false);
        });
    });

    describe('stream.write in development', () => {
        it('should log raw trimmed message via logger.http', async () => {
            jest.doMock('../../config/config', () => ({ NODE_ENV: 'development' }));
            const { morganMock, logger } = await loadHttpLogger();

            const options = morganMock.mock.calls[0][1];
            options.stream.write('GET /foo 200  \n');

            expect(logger.http).toHaveBeenCalledWith('GET /foo 200');
        });
    });

    describe('stream.write in production', () => {
        it('should parse JSON and log with correct level for 5xx', async () => {
            jest.doMock('../../config/config', () => ({ NODE_ENV: 'production' }));
            const { morganMock, logger } = await loadHttpLogger();

            const options = morganMock.mock.calls[0][1];
            const payload = JSON.stringify({ method: 'GET', url: '/foo', status: 500 });

            options.stream.write(payload);

            expect(logger.log).toHaveBeenCalledWith(
                'error',
                'GET /foo 500',
                expect.objectContaining({ status: 500 }),
            );
        });

        it('should fallback to raw logging when JSON.parse fails', async () => {
            jest.doMock('../../config/config', () => ({ NODE_ENV: 'production' }));
            const { morganMock, logger } = await loadHttpLogger();

            const options = morganMock.mock.calls[0][1];
            options.stream.write('not valid json');

            expect(logger.http).toHaveBeenCalledWith('not valid json');
        });
    });
});
