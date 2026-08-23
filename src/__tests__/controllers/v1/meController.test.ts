import { MeController } from './../../../modules/users/controllers/MeController';
import { UserService } from '../../../modules/users/services/UserService';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../../../common/errors';
import { AuthenticatedUserRequest } from '../../../common/types';

jest.mock('../../../modules/users/services/UserService');
jest.mock('../../../common/decorators', () => ({
    ValidateBody: (): MethodDecorator => (_target, _propertyKey, descriptor) => descriptor,
    Body: (): ParameterDecorator => (_target, _propertyKey, _parameterIndex) => {},
}));

describe('MeController', () => {
    let controller: MeController;

    beforeEach(() => {
        controller = new MeController();
        jest.clearAllMocks();
    });

    describe('getCurrentUser', () => {
        it('should return current logged in user data', async () => {
            const mockUserData = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
            };

            const currentLoggedInUser: AuthenticatedUserRequest = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                roles: ['USER'],
                permissions: [],
            };

            (UserService.getOne as jest.Mock).mockResolvedValue(mockUserData);

            const result = await controller.getCurrentUser(currentLoggedInUser);

            expect(result.code).toBe(StatusCodes.OK);
            expect(result.message).toBe('User data fetched successfully');
            expect(result.data).toEqual(mockUserData);
            expect(UserService.getOne).toHaveBeenCalledWith(1);
        });

        it('should handle user not found error', async () => {
            const currentLoggedInUser: AuthenticatedUserRequest = {
                id: '999',
                email: 'non.existent@app.com',
                username: 'nonexistent',
                firstName: 'Non',
                lastName: 'Existent',
                roles: ['USER'],
                permissions: [],
            };

            (UserService.getOne as jest.Mock).mockRejectedValue(
                new NotFoundError('User not found'),
            );

            await expect(controller.getCurrentUser(currentLoggedInUser)).rejects.toThrow(
                NotFoundError,
            );
        });

        it('should handle null lastName', async () => {
            const mockUserData = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: null,
            };

            const currentLoggedInUser: AuthenticatedUserRequest = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                roles: ['USER'],
                permissions: [],
            };

            (UserService.getOne as jest.Mock).mockResolvedValue(mockUserData);

            const result = await controller.getCurrentUser(currentLoggedInUser);

            expect(result.data.lastName).toBeNull();
        });
    });

    describe('updateCurrentUser', () => {
        it('should successfully update current user', async () => {
            const updateRequest = {
                email: 'newemail@example.com',
                username: 'newusername',
                firstName: 'New',
                lastName: 'Name',
            };

            const updatedUserData = {
                id: 1,
                email: updateRequest.email,
                username: updateRequest.username,
                firstName: updateRequest.firstName,
                lastName: updateRequest.lastName,
            };

            const currentLoggedInUser: AuthenticatedUserRequest = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                roles: ['USER'],
                permissions: [],
            };

            (UserService.updateUser as jest.Mock).mockResolvedValue(updatedUserData);

            const result = await controller.updateCurrentUser(currentLoggedInUser, updateRequest);

            expect(result.code).toBe(StatusCodes.OK);
            expect(result.message).toBe('User data updated successfully');
            expect(result.data).toEqual(updatedUserData);
            expect(UserService.updateUser).toHaveBeenCalledWith(updateRequest, 1);
        });

        it('should update without lastName', async () => {
            const updateRequest = {
                email: 'newemail@example.com',
                username: 'newusername',
                firstName: 'New',
            };

            const updatedUserData = {
                id: 1,
                email: updateRequest.email,
                username: updateRequest.username,
                firstName: updateRequest.firstName,
                lastName: null,
            };

            const currentLoggedInUser: AuthenticatedUserRequest = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                roles: ['USER'],
                permissions: [],
            };

            (UserService.updateUser as jest.Mock).mockResolvedValue(updatedUserData);

            const result = await controller.updateCurrentUser(currentLoggedInUser, updateRequest);

            expect(result.data.lastName).toBeNull();
            expect(UserService.updateUser).toHaveBeenCalledWith(updateRequest, 1);
        });

        it('should handle user not found error during update', async () => {
            const updateRequest = {
                email: 'newemail@example.com',
                username: 'newusername',
                firstName: 'New',
                lastName: 'Name',
            };

            const currentLoggedInUser: AuthenticatedUserRequest = {
                id: '999',
                email: 'non.existent@app.com',
                username: 'nonexistent',
                firstName: 'Non',
                lastName: 'Existent',
                roles: ['USER'],
                permissions: [],
            };

            (UserService.updateUser as jest.Mock).mockRejectedValue(
                new NotFoundError('User not found'),
            );

            await expect(
                controller.updateCurrentUser(currentLoggedInUser, updateRequest),
            ).rejects.toThrow(NotFoundError);
        });

        it('should handle validation errors during update', async () => {
            const updateRequest = {
                email: 'invalid-email',
                username: 'newusername',
                firstName: 'New',
                lastName: 'Name',
            };

            const currentLoggedInUser: AuthenticatedUserRequest = {
                id: '1',
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                roles: ['USER'],
                permissions: [],
            };

            (UserService.updateUser as jest.Mock).mockRejectedValue(new Error('Validation failed'));

            await expect(
                controller.updateCurrentUser(currentLoggedInUser, updateRequest),
            ).rejects.toThrow();
        });
    });
});
