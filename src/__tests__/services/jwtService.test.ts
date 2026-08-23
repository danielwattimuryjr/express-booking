import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../common/errors';
import config from '../../config/config';
import {
    JwtService,
    AccessTokenPayload,
    RefreshTokenPayload,
} from '../../modules/auth/services/JwtService';

jest.mock('jsonwebtoken');
jest.mock('../../config/config', () => ({
    JWT_SECRET: 'test-secret',
    JWT_ACCESS_EXPIRATION_MINUTES: 15,
    JWT_REFRESH_EXPIRATION_DAYS: 7,
}));

describe('JwtService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAccessToken', () => {
        it('should generate a valid access token', () => {
            const userId = '123';
            const mockToken = 'mockAccessToken';

            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            const token = JwtService.generateAccessToken(userId);

            expect(token).toBe(mockToken);
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    sub: userId,
                    type: 'access',
                },
                config.JWT_SECRET,
                {
                    algorithm: 'HS256',
                    expiresIn: '15m',
                },
            );
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a valid refresh token with jti', () => {
            const userId = '123';
            const tokenId = 'token-id-123';
            const mockToken = 'mockRefreshToken';

            (jwt.sign as jest.Mock).mockReturnValue(mockToken);

            const token = JwtService.generateRefreshToken(userId, tokenId);

            expect(token).toBe(mockToken);
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    sub: userId,
                    jti: tokenId,
                    type: 'refresh',
                },
                config.JWT_SECRET,
                {
                    algorithm: 'HS256',
                    expiresIn: '7d',
                },
            );
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify and return access token payload', () => {
            const mockPayload: AccessTokenPayload = {
                sub: '123',
                type: 'access',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 900,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            const result = JwtService.verifyAccessToken('validToken');

            expect(result).toEqual(mockPayload);
            expect(jwt.verify).toHaveBeenCalledWith('validToken', config.JWT_SECRET, {
                algorithms: ['HS256'],
            });
        });

        it('should throw UnauthorizedError for invalid access token', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => JwtService.verifyAccessToken('invalidToken')).toThrow();
        });

        it('should throw UnauthorizedError when token type is not access', () => {
            const mockPayload = {
                sub: '123',
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 900,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            expect(() => JwtService.verifyAccessToken('token')).toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError when payload is string', () => {
            (jwt.verify as jest.Mock).mockReturnValue('stringPayload');

            expect(() => JwtService.verifyAccessToken('token')).toThrow(UnauthorizedError);
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify and return refresh token payload', () => {
            const mockPayload: RefreshTokenPayload = {
                sub: '123',
                type: 'refresh',
                jti: 'token-id-123',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 604800,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            const result = JwtService.verifyRefreshToken('validToken');

            expect(result).toEqual(mockPayload);
            expect(jwt.verify).toHaveBeenCalledWith('validToken', config.JWT_SECRET, {
                algorithms: ['HS256'],
            });
        });

        it('should throw UnauthorizedError for invalid refresh token', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            expect(() => JwtService.verifyRefreshToken('invalidToken')).toThrow();
        });

        it('should throw UnauthorizedError when token type is not refresh', () => {
            const mockPayload = {
                sub: '123',
                type: 'access',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 900,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            expect(() => JwtService.verifyRefreshToken('token')).toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError when jti is missing', () => {
            const mockPayload = {
                sub: '123',
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 604800,
            };

            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

            expect(() => JwtService.verifyRefreshToken('token')).toThrow(UnauthorizedError);
        });
    });

    describe('getAccessTokenExpiration', () => {
        it('should return a date in the future', () => {
            const now = Date.now();
            const expiration = JwtService.getAccessTokenExpiration();

            expect(expiration.getTime()).toBeGreaterThan(now);
        });
    });

    describe('getRefreshTokenExpiration', () => {
        it('should return a date in the future', () => {
            const now = Date.now();
            const expiration = JwtService.getRefreshTokenExpiration();

            expect(expiration.getTime()).toBeGreaterThan(now);
        });
    });
});
