import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import config from './config';
import { UserRepository } from '../repositories';
import { AccessTokenPayload } from '../services/jwtService';

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

        return done(null, user);
    },
);
