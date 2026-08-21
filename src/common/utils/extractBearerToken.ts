import { UnauthorizedError } from '../error';

export function extractBearerToken(authorization: string): string {
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        throw new UnauthorizedError();
    }

    return token;
}
