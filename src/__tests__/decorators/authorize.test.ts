import { Middlewares } from 'tsoa';
import { PermissionEnum, RoleEnum } from '../../common/enum';
import { Authorize } from '../../common/decorators/authorize';
import { AuthorizationPolicy, checkUserPermissionMiddleware } from '../../common/middleware';

jest.mock('../../common/middleware');
jest.mock('tsoa');

describe('Authorize Decorator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call checkUserPermissionMiddleware with the given policy', () => {
        const policy = { type: 'authenticated' as const };

        Authorize(policy);

        expect(checkUserPermissionMiddleware).toHaveBeenCalledWith(policy);
        expect(checkUserPermissionMiddleware).toHaveBeenCalledTimes(1);
    });

    it('should pass the middleware result to tsoa Middlewares', () => {
        const policy = { type: 'authenticated' as const };
        const mockMiddlewareFn = jest.fn();
        (checkUserPermissionMiddleware as jest.Mock).mockReturnValue(mockMiddlewareFn);

        Authorize(policy);

        expect(Middlewares).toHaveBeenCalledWith(mockMiddlewareFn);
    });

    it('should return whatever tsoa Middlewares returns', () => {
        const policy = { type: 'authenticated' as const };
        const mockDecorator = jest.fn();
        (Middlewares as jest.Mock).mockReturnValue(mockDecorator);

        const result = Authorize(policy);

        expect(result).toBe(mockDecorator);
    });

    it('should work with role-based policy', () => {
        const policy: AuthorizationPolicy = { type: 'role', values: [RoleEnum.ADMIN] };
        Authorize(policy);
        expect(checkUserPermissionMiddleware).toHaveBeenCalledWith(policy);
    });

    it('should work with permission-based policy', () => {
        const policy: AuthorizationPolicy = {
            type: 'permission',
            values: [PermissionEnum.BOOKING_CANCEL],
        };
        Authorize(policy);
        expect(checkUserPermissionMiddleware).toHaveBeenCalledWith(policy);
    });

    it('should work with false policy (no authorization)', () => {
        Authorize(false);
        expect(checkUserPermissionMiddleware).toHaveBeenCalledWith(false);
    });
});
