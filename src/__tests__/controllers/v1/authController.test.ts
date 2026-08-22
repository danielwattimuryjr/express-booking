import { StatusCodes } from 'http-status-codes';
import { AuthController } from '../../../controllers/v1/authController';
import { AuthService } from '../../../services';
import { UnauthorizedError } from '../../../error';

jest.mock('../../../services');
jest.mock('../../../decorator', () => ({
    ValidateBody: (): MethodDecorator => (_target, _propertyKey, descriptor) => descriptor,
    Body: (): ParameterDecorator => (_target, _propertyKey, _parameterIndex) => {},
}));

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(() => {
        controller = new AuthController();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should successfully login user', async () => {
            const loginRequest = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockTokens = {
                accessToken: 'accessToken',
                refreshToken: 'refreshToken',
            };

            (AuthService.login as jest.Mock).mockResolvedValue(mockTokens);

            const result = await controller.login(loginRequest);

            expect(result.code).toBe(StatusCodes.OK);
            expect(result.message).toBe('Login successfull');
            expect(result.data).toEqual(mockTokens);
            expect(AuthService.login).toHaveBeenCalledWith(loginRequest);
        });

        it('should handle login error', async () => {
            const loginRequest = {
                email: 'test@example.com',
                password: 'wrongPassword',
            };

            (AuthService.login as jest.Mock).mockRejectedValue(new UnauthorizedError());

            await expect(controller.login(loginRequest)).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('refresh', () => {
        it('should successfully refresh token', async () => {
            const refreshToken = 'Bearer validRefreshToken';
            const mockTokens = {
                accessToken: 'newAccessToken',
                refreshToken: 'newRefreshToken',
            };

            (AuthService.refresh as jest.Mock).mockResolvedValue(mockTokens);

            const result = await controller.refresh(refreshToken);

            expect(result.code).toBe(StatusCodes.OK);
            expect(result.message).toBe('Token refreshed');
            expect(result.data).toEqual(mockTokens);
            expect(AuthService.refresh).toHaveBeenCalledWith('validRefreshToken');
        });

        it('should throw UnauthorizedError when Bearer token is missing', async () => {
            const invalidRefreshToken = 'InvalidToken';

            expect(() => controller['extractBearerToken'](invalidRefreshToken)).toThrow(
                UnauthorizedError,
            );
        });

        it('should throw UnauthorizedError when token is missing', async () => {
            const invalidRefreshToken = 'Bearer';

            expect(() => controller['extractBearerToken'](invalidRefreshToken)).toThrow(
                UnauthorizedError,
            );
        });
    });

    describe('logout', () => {
        it('should successfully logout user', async () => {
            const refreshToken = 'Bearer validRefreshToken';

            (AuthService.logout as jest.Mock).mockResolvedValue(undefined);

            const result = await controller.logout(refreshToken);

            expect(result.code).toBe(StatusCodes.OK);
            expect(result.message).toBe('Logout successfull');
            expect(AuthService.logout).toHaveBeenCalledWith('validRefreshToken');
        });

        it('should handle logout error', async () => {
            const refreshToken = 'Bearer invalidToken';

            (AuthService.logout as jest.Mock).mockRejectedValue(new UnauthorizedError());

            await expect(controller.logout(refreshToken)).rejects.toThrow(UnauthorizedError);
        });
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            const registerRequest = {
                email: 'newuser@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
            };

            const mockUser = {
                id: 1,
                email: registerRequest.email,
                firstName: registerRequest.firstName,
                lastName: registerRequest.lastName,
                username: registerRequest.username,
            };

            (AuthService.register as jest.Mock).mockResolvedValue(mockUser);

            const result = await controller.register(registerRequest);

            expect(result.code).toBe(StatusCodes.CREATED);
            expect(result.message).toBe('User has been registered successfully');
            expect(result.data).toEqual(mockUser);
            expect(AuthService.register).toHaveBeenCalledWith(registerRequest);
        });

        it('should handle registration error', async () => {
            const registerRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
            };

            (AuthService.register as jest.Mock).mockRejectedValue(new Error('Registration failed'));

            await expect(controller.register(registerRequest)).rejects.toThrow();
        });
    });

    describe('extractBearerToken', () => {
        it('should extract token from Bearer header', () => {
            const token = controller['extractBearerToken']('Bearer myToken');
            expect(token).toBe('myToken');
        });

        it('should throw UnauthorizedError for malformed Bearer token', () => {
            expect(() => controller['extractBearerToken']('InvalidBearer token')).toThrow(
                UnauthorizedError,
            );
        });
    });
});
