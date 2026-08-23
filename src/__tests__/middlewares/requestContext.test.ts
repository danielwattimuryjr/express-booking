import {
    requestContextMiddleware,
    requestContextStorage,
    getRequestId,
    setContextUser,
    getContextUser,
    getRequestStartTime,
} from '../../common/middleware/requestContext';
import { Request, Response, NextFunction } from 'express';

describe('RequestContext Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = {
            headers: {},
            ip: '127.0.0.1',
        };
        mockRes = {
            setHeader: jest.fn(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('requestContextMiddleware', () => {
        it('should generate a new requestId if not provided', (done) => {
            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                const requestId = getRequestId();

                if (!requestId) {
                    throw new Error('Expected requestId to be defined');
                }

                expect(typeof requestId).toBe('string');
                expect(requestId.length).toBeGreaterThan(0);
                done();
            });
        });

        it('should reuse existing X-Request-Id from headers', (done) => {
            const providedId = 'custom-request-id-123';
            mockReq.headers = { 'x-request-id': providedId };

            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                const requestId = getRequestId();
                expect(requestId).toBe(providedId);
                done();
            });
        });

        it('should trim whitespace from X-Request-Id', (done) => {
            const providedId = '  custom-request-id-123  ';
            mockReq.headers = { 'x-request-id': providedId };

            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                const requestId = getRequestId();
                expect(requestId).toBe('custom-request-id-123');
                done();
            });
        });

        it('should generate a new requestId when X-Request-Id is only whitespace', (done) => {
            const providedId = '   ';
            mockReq.headers = { 'x-request-id': providedId };

            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                const requestId = getRequestId();
                expect(requestId).not.toBe(providedId);
                expect(requestId?.trim().length).toBeGreaterThan(0);
                done();
            });
        });

        it('should set X-Request-Id header in response', (done) => {
            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-Id', expect.any(String));
                done();
            });
        });

        it('should capture request IP address', (done) => {
            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                const store = requestContextStorage.getStore();
                expect(store?.ip).toBe('127.0.0.1');
                done();
            });
        });

        it('should capture request start time', (done) => {
            const beforeTime = Date.now();
            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                const startTime = getRequestStartTime();
                const afterTime = Date.now();
                expect(startTime).toBeGreaterThanOrEqual(beforeTime);
                expect(startTime).toBeLessThanOrEqual(afterTime);
                done();
            });
        });

        it('should call next function', (done) => {
            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                expect(mockNext).not.toHaveBeenCalled();
                done();
            });
        });
    });

    describe('setContextUser and getContextUser', () => {
        it('should set and retrieve user ID in context', (done) => {
            const userId = 'user-123';

            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                setContextUser(userId);
                const contextUser = getContextUser();
                expect(contextUser).toBe(userId);
                done();
            });
        });

        it('should return undefined if user not set', (done) => {
            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                const contextUser = getContextUser();
                expect(contextUser).toBeUndefined();
                done();
            });
        });

        it('should return undefined when called outside of async context', () => {
            const contextUser = getContextUser();
            expect(contextUser).toBeUndefined();
        });
    });

    describe('getRequestId', () => {
        it('should return undefined when called outside of async context', () => {
            const requestId = getRequestId();
            expect(requestId).toBeUndefined();
        });
    });

    describe('getRequestStartTime', () => {
        it('should return undefined when called outside of async context', () => {
            const startTime = getRequestStartTime();
            expect(startTime).toBeUndefined();
        });
    });

    describe('Multiple requests', () => {
        it('should maintain separate context for each request', (done) => {
            const id1 = 'request-1';
            const id2 = 'request-2';

            mockReq.headers = { 'x-request-id': id1 };
            requestContextMiddleware(mockReq as Request, mockRes as Response, () => {
                expect(getRequestId()).toBe(id1);
                setContextUser('user-1');

                const mockReq2: Partial<Request> = {
                    headers: { 'x-request-id': id2 },
                    ip: '127.0.0.1',
                };
                const mockRes2: Partial<Response> = { setHeader: jest.fn() };

                requestContextMiddleware(mockReq2 as Request, mockRes2 as Response, () => {
                    expect(getRequestId()).toBe(id2);
                    expect(getContextUser()).toBeUndefined();
                    done();
                });
            });
        });
    });
});
