import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/RefreshToken';
import { AppDataSource } from '../../../infrastructure/database/data-source';

class RefreshTokenRepositoryClass extends Repository<RefreshToken> {
    constructor() {
        super(RefreshToken, AppDataSource.manager);
    }

    async findByJtiAndUser(jti: string, userId: number) {
        return this.findOne({
            where: { jti, user: { id: userId } },
            select: {
                id: true,
                tokenHash: true,
                jti: true,
                expiresAt: true,
                revokedAt: true,
            },
        });
    }
}

export const RefreshTokenRepository = new RefreshTokenRepositoryClass();
