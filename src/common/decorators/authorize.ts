import { Middlewares } from 'tsoa';
import { AuthorizationPolicy, checkUserPermissionMiddleware } from '../middleware';

export function Authorize(policy: AuthorizationPolicy) {
    return Middlewares(checkUserPermissionMiddleware(policy));
}
