import { NextFunction, Request, RequestHandler, Response } from 'express';
import passport from 'passport';
import { ForbiddenError, UnauthorizedError } from '../common/error';
import { RoleEnum } from '../common/enum';
import { PermissionEnum } from '../common/enum/PermissionEnum';

export type AuthorizationPolicy =
    | RoleAuthorizationPolicy
    | PermissionAuthorizationPolicy
    | {
          type: 'authenticated';
      }
    | false;

type RoleAuthorizationPolicy = {
    type: 'role';
    values: RoleEnum[];
    mode?: 'any' | 'all';
};

type PermissionAuthorizationPolicy = {
    type: 'permission';
    values: PermissionEnum[];
    mode?: 'any' | 'all';
};

const authenticateJwt = (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Express.User> => {
    return new Promise((resolve, reject) => {
        passport.authenticate(
            'jwt',
            { session: false },
            (err: Error | null, user: Express.User | false, info: any) => {
                if (err) return reject(err);
                if (!user) return reject(new UnauthorizedError(info?.message));
                resolve(user);
            },
        )(req, res, next);
    });
};

export const checkUserPermissionMiddleware = (policy: AuthorizationPolicy): RequestHandler => {
    return async (req, res, next) => {
        if (!policy) return next();

        try {
            const user = await authenticateJwt(req, res, next);
            req.user = user;

            if (policy.type === 'authenticated') {
                return next();
            }

            if (policy.type === 'role') {
                const userRoleNames = new Set(user.roles.map((role) => role.name));
                const hasRole =
                    policy.mode === 'all'
                        ? policy.values.every((roleId) => userRoleNames.has(roleId))
                        : policy.values.some((roleId) => userRoleNames.has(roleId));

                if (!hasRole) {
                    return next(new ForbiddenError());
                }
            }

            if (policy.type === 'permission') {
                const userPermissions = new Set(
                    user.roles.flatMap((role) =>
                        role.permissions.map((permission) => permission.name),
                    ),
                );
                const hasPermission =
                    policy.mode === 'all'
                        ? policy.values.every((permissionId) => userPermissions.has(permissionId))
                        : policy.values.some((permissionId) => userPermissions.has(permissionId));

                if (!hasPermission) {
                    return next(new ForbiddenError());
                }
            }

            return next();
        } catch (err) {
            return next(err);
        }
    };
};
