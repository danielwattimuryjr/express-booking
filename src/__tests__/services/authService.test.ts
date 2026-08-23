import { UserRepository } from '../../modules/users/repositories/UserRepository';
import { RefreshTokenRepository } from '../../modules/auth/repositories/RefreshTokenRepository';
import { RoleRepository } from '../../modules/roles/repositories/RoleRepository';
import { AppDataSource } from '../../infrastructure/database/data-source';
import { NotFoundError, UnauthorizedError } from '../../common/errors';
import bcrypt from 'bcrypt';
import { AuthService } from '../../modules/auth/services/AuthService';
import { JwtService } from '../../modules/auth/services/JwtService';
import { EntityManager } from 'typeorm';

jest.mock('../../modules/auth/services/JwtService');
jest.mock('../../modules/users/repositories/UserRepository');
jest.mock('../../modules/roles/repositories/RoleRepository');
jest.mock('../../modules/auth/repositories/RefreshTokenRepository');
jest.mock('../../infrastructure/database/data-source');
jest.mock('bcrypt');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should successfully login user with valid credentials', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
            };

            const loginRequest = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockRefreshTokenRepository = {
                create: jest.fn().mockReturnValue({}),
                save: jest.fn().mockResolvedValue({}),
            };

            (UserRepository.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (JwtService.generateAccessToken as jest.Mock).mockReturnValue('accessToken');
            (JwtService.generateRefreshToken as jest.Mock).mockReturnValue('refreshToken');
            (JwtService.getRefreshTokenExpiration as jest.Mock).mockReturnValue(new Date());

            (AppDataSource as unknown as { manager: EntityManager }).manager = {
                getRepository: jest.fn().mockReturnValue(mockRefreshTokenRepository),
            } as unknown as EntityManager;

            const result = await AuthService.login(loginRequest);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(UserRepository.findOneByEmail).toHaveBeenCalledWith(loginRequest.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginRequest.password, mockUser.password);
        });

        it('should throw NotFoundError when user does not exist', async () => {
            const loginRequest = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            (UserRepository.findOneByEmail as jest.Mock).mockResolvedValue(null);

            await expect(AuthService.login(loginRequest)).rejects.toThrow(NotFoundError);
            expect(UserRepository.findOneByEmail).toHaveBeenCalledWith(loginRequest.email);
        });

        it('should throw UnauthorizedError when password is invalid', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
            };

            const loginRequest = {
                email: 'test@example.com',
                password: 'wrongPassword',
            };

            (UserRepository.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(AuthService.login(loginRequest)).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('refresh', () => {
        it('should successfully refresh token with valid refresh token', async () => {
            const mockRefreshToken = {
                jti: 'token-id',
                revokedAt: null,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };

            const refreshTokenString = 'validRefreshToken';

            (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue({
                jti: 'token-id',
                sub: '1',
            });

            (RefreshTokenRepository.findByJtiAndUser as jest.Mock).mockResolvedValue(
                mockRefreshToken,
            );
            (AppDataSource.transaction as jest.Mock).mockImplementation((callback) =>
                callback({
                    getRepository: jest.fn().mockReturnValue({
                        update: jest.fn().mockResolvedValue({}),
                    }),
                }),
            );

            (JwtService.generateAccessToken as jest.Mock).mockReturnValue('newAccessToken');
            (JwtService.generateRefreshToken as jest.Mock).mockReturnValue('newRefreshToken');
            (JwtService.getRefreshTokenExpiration as jest.Mock).mockReturnValue(new Date());

            const result = await AuthService.refresh(refreshTokenString);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(JwtService.verifyRefreshToken).toHaveBeenCalledWith(refreshTokenString);
        });

        it('should throw UnauthorizedError when refresh token does not exist', async () => {
            (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue({
                jti: 'token-id',
                sub: '1',
            });
            (RefreshTokenRepository.findByJtiAndUser as jest.Mock).mockResolvedValue(null);

            await expect(AuthService.refresh('invalidToken')).rejects.toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError when refresh token is revoked', async () => {
            const mockRefreshToken = {
                jti: 'token-id',
                revokedAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };

            (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue({
                jti: 'token-id',
                sub: '1',
            });
            (RefreshTokenRepository.findByJtiAndUser as jest.Mock).mockResolvedValue(
                mockRefreshToken,
            );

            await expect(AuthService.refresh('revokedToken')).rejects.toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError when refresh token is expired', async () => {
            const mockRefreshToken = {
                jti: 'token-id',
                revokedAt: null,
                expiresAt: new Date(Date.now() - 1000),
            };

            (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue({
                jti: 'token-id',
                sub: '1',
            });
            (RefreshTokenRepository.findByJtiAndUser as jest.Mock).mockResolvedValue(
                mockRefreshToken,
            );

            await expect(AuthService.refresh('expiredToken')).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('logout', () => {
        it('should successfully logout user', async () => {
            const mockRefreshToken = {
                jti: 'token-id',
                revokedAt: null,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };

            (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue({
                jti: 'token-id',
                sub: '1',
            });
            (RefreshTokenRepository.findByJtiAndUser as jest.Mock).mockResolvedValue(
                mockRefreshToken,
            );
            (RefreshTokenRepository.update as jest.Mock).mockResolvedValue({});

            await AuthService.logout('validRefreshToken');

            expect(RefreshTokenRepository.update).toHaveBeenCalled();
        });

        it('should throw UnauthorizedError when refresh token does not exist', async () => {
            (JwtService.verifyRefreshToken as jest.Mock).mockReturnValue({
                jti: 'token-id',
                sub: '1',
            });
            (RefreshTokenRepository.findByJtiAndUser as jest.Mock).mockResolvedValue(null);

            await expect(AuthService.logout('invalidToken')).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            const mockRole = { id: 1, name: 'ROLE_USER' };
            const registerRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
            };

            const mockUser = {
                id: 1,
                ...registerRequest,
            };

            (RoleRepository.findOneBy as jest.Mock).mockResolvedValue(mockRole);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserRepository.create as jest.Mock).mockReturnValue(mockUser);
            (UserRepository.save as jest.Mock).mockResolvedValue(mockUser);

            const result = await AuthService.register(registerRequest);

            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                username: mockUser.username,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(registerRequest.password, 12);
        });

        it('should throw NotFoundError when ROLE_USER does not exist', async () => {
            const registerRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
            };

            (RoleRepository.findOneBy as jest.Mock).mockResolvedValue(null);

            await expect(AuthService.register(registerRequest)).rejects.toThrow(NotFoundError);
        });
    });
});
