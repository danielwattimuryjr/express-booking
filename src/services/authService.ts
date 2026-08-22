import { NotFoundError, UnauthorizedError } from '../error';
import { RoleRepository, UserRepository } from '../repositories';
import bcrypt from 'bcrypt';
import { JwtService } from './jwtService';
import { RefreshTokenRepository } from '../repositories/refreshTokenRepository';
import { AppDataSource } from '../config/database';
import { RefreshToken } from '../entities';
import { EntityManager } from 'typeorm';
import { RoleEnum } from '../common/enum';
import { PostLoginRequest, PostRegisterRequest } from '../dto';

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

    static async login(body: PostLoginRequest) {
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

    static async logout(token: string) {
        const { jti, sub } = JwtService.verifyRefreshToken(token);
        const userId = Number(sub);
        const refreshToken = await RefreshTokenRepository.findByJtiAndUser(jti, userId);

        if (!refreshToken) throw new UnauthorizedError();
        if (refreshToken.revokedAt) throw new UnauthorizedError();
        if (refreshToken.expiresAt <= new Date()) throw new UnauthorizedError();

        await RefreshTokenRepository.update(
            { jti, user: { id: userId } },
            { revokedAt: new Date() },
        );
    }

    static async register(body: PostRegisterRequest) {
        const role = await RoleRepository.findOneBy({
            name: RoleEnum.USER,
        });
        if (!role) throw new NotFoundError('role with name ROLE_USER not found');

        const password = await bcrypt.hash(body.password, 12);

        const user = UserRepository.create({
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            username: body.username,
            password,
            roles: [role],
        });
        await UserRepository.save(user);

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName ?? null,
        };
    }
}
