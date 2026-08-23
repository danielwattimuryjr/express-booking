import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { ForbiddenError, UnauthorizedError } from '../../common/errors';
import { RoleEnum, PermissionEnum } from '../../common/enum';
import { AuthorizationPolicy, checkUserPermissionMiddleware } from '../../common/middleware';

jest.mock('passport');

describe('checkUserPermissionMiddleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            user: undefined,
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('when policy is false', () => {
        it('should call next without authentication', async () => {
            const middleware = checkUserPermissionMiddleware(false);
            await middleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('when policy is authenticated', () => {
        it('should authenticate user and call next', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                roles: [RoleEnum.USER],
                permissions: [],
            };

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, mockUser, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = { type: 'authenticated' };
            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });

        it('should call next with UnauthorizedError if user is not authenticated', async () => {
            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, false, { message: 'Unauthorized' });
                    };
                },
            );

            const policy: AuthorizationPolicy = { type: 'authenticated' };
            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });
    });

    describe('when policy is role-based', () => {
        it('should allow access if user has required role (any mode)', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                roles: [RoleEnum.USER],
                permissions: [],
            };

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, mockUser, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = {
                type: 'role',
                values: [RoleEnum.USER, RoleEnum.ADMIN],
                mode: 'any',
            };

            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });

        it('should deny access if user does not have required role', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                roles: [RoleEnum.USER],
                permissions: [],
            };

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, mockUser, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = {
                type: 'role',
                values: [RoleEnum.ADMIN],
                mode: 'any',
            };

            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
        });

        it('should allow access if user has all required roles (all mode)', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                roles: [RoleEnum.USER, RoleEnum.ADMIN],
                permissions: [],
            };

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, mockUser, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = {
                type: 'role',
                values: [RoleEnum.USER, RoleEnum.ADMIN],
                mode: 'all',
            };

            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('when policy is permission-based', () => {
        it('should allow access if user has required permission (any mode)', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                roles: [RoleEnum.USER],
                permissions: [PermissionEnum.USER_READ],
            };

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, mockUser, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = {
                type: 'permission',
                values: [PermissionEnum.USER_READ, PermissionEnum.USER_CREATE],
                mode: 'any',
            };

            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalledWith();
        });

        it('should deny access if user does not have required permission', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                roles: [RoleEnum.USER],
                permissions: [PermissionEnum.USER_READ],
            };

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, mockUser, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = {
                type: 'permission',
                values: [PermissionEnum.USER_DELETE],
                mode: 'any',
            };

            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
        });

        it('should allow access if user has all required permissions (all mode)', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                roles: [RoleEnum.USER],
                permissions: [PermissionEnum.USER_READ, PermissionEnum.USER_CREATE],
            };

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(null, mockUser, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = {
                type: 'permission',
                values: [PermissionEnum.USER_READ, PermissionEnum.USER_CREATE],
                mode: 'all',
            };

            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith();
        });
    });

    describe('error handling', () => {
        it('should call next with error when authentication fails', async () => {
            const mockError = new Error('Authentication error');

            (passport.authenticate as jest.Mock).mockImplementation(
                (_strategy, _options, callback) => {
                    return (_req: Request, _res: Response, _next: NextFunction) => {
                        callback(mockError, false, null);
                    };
                },
            );

            const policy: AuthorizationPolicy = { type: 'authenticated' };
            const middleware = checkUserPermissionMiddleware(policy);
            await middleware(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(mockError);
        });
    });
});
