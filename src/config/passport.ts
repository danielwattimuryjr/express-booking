import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import config from './config';
import { UserRepository } from '../repositories';
import { AccessTokenPayload } from '../services';

export const jwtStrategy = new Strategy(
    {
        secretOrKey: config.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload: AccessTokenPayload, done: VerifiedCallback) => {
        if (payload.type !== 'access') {
            return done(null, false);
        }
        const user = await UserRepository.findByIdWithAuthorization(Number(payload.sub));
        if (!user) {
            return done(null, false);
        }

        const permissions = [
            ...new Set(
                user.roles.flatMap((role) => role.permissions.map((permission) => permission.name)),
            ),
        ];

        return done(null, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            roles: user.roles.map((role) => role.name),
            permissions,
        });
    },
);
