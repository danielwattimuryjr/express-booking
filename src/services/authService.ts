import { NotFoundError, UnauthorizedError } from '../common/error';
import { UserRepository } from '../repositories';
import bcrypt from 'bcrypt';
import { JwtService } from './jwtService';
import { LoginRequest } from '../dto';
import { RefreshTokenRepository } from '../repositories/refreshTokenRepository';
import { AppDataSource } from '../config/database';
import { RefreshToken } from '../entitites';
import { EntityManager } from 'typeorm';

export class AuthService {
    private static async createTokenPair(
        userId: string,
        manager: EntityManager = AppDataSource.manager,
    ) {
        const jti = crypto.randomUUID();
        const accessToken = JwtService.generateAccessToken(userId);
        const refreshToken = JwtService.generateRefreshToken(userId, jti);
        const refreshTokenRepository = manager.getRepository(RefreshToken);

        const newRefreshToken = refreshTokenRepository.create({
            jti,
            tokenHash: refreshToken,
            user: {
                id: Number(userId),
            },
            expiresAt: JwtService.getRefreshTokenExpiration(),
        });
        await refreshTokenRepository.save(newRefreshToken);

        return {
            accessToken,
            refreshToken,
        };
    }

    static async login(body: LoginRequest) {
        const user = await UserRepository.findOneByEmail(body.email);
        if (!user) throw new NotFoundError('User not found');

        const isPasswordValid = await bcrypt.compare(body.password, user.password);
        if (!isPasswordValid) throw new UnauthorizedError();

        return this.createTokenPair(user.id.toString());
    }

    static async refresh(token: string) {
        const { jti, sub } = JwtService.verifyRefreshToken(token);
        const userId = Number(sub);
        const existingToken = await RefreshTokenRepository.findByJtiAndUser(jti, userId);

        if (!existingToken) throw new UnauthorizedError();
        if (existingToken.revokedAt) throw new UnauthorizedError();
        if (existingToken.expiresAt <= new Date()) throw new UnauthorizedError();

        return AppDataSource.transaction(async (manager) => {
            const refreshTokenRepository = manager.getRepository(RefreshToken);
            await refreshTokenRepository.update(
                { jti, user: { id: userId } },
                { revokedAt: new Date() },
            );

            return this.createTokenPair(userId.toString());
        });
    }
}
