import { StatusCodes } from 'http-status-codes';
import { UserController } from '../../../modules/users/controllers/UserController';
import { UserService } from '../../../modules/users/services/UserService';
import { NotFoundError } from '../../../common/errors';

jest.mock('../../../modules/users/services/UserService', () => ({
    UserService: {
        getUsers: jest.fn(),
        getOne: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
    },
}));

jest.mock('../../../common/decorators', () => ({
    ValidateBody: (): MethodDecorator => (_target, _propertyKey, descriptor) => descriptor,
    Body: (): ParameterDecorator => (_target, _propertyKey, _parameterIndex) => {},
}));

describe('UserController', () => {
    let controller: UserController;

    beforeEach(() => {
        controller = new UserController();
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return paginated users with the supplied filters', async () => {
            const mockResult = {
                data: [{ id: 1, email: 'jane@example.com', username: 'jane' }],
                pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
            };
            (UserService.getUsers as jest.Mock).mockResolvedValue(mockResult);

            const result = await controller.getAllUsers(2, 10, 'Jane', 'jane');

            expect(result).toEqual({
                code: StatusCodes.OK,
                message: 'Users fetched successfully',
                ...mockResult,
            });
            expect(UserService.getUsers).toHaveBeenCalledWith({
                page: 2,
                limit: 10,
                name: 'Jane',
                username: 'jane',
            });
        });

        it('should use default pagination values', async () => {
            (UserService.getUsers as jest.Mock).mockResolvedValue({
                data: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            });

            await controller.getAllUsers();

            expect(UserService.getUsers).toHaveBeenCalledWith({
                page: 1,
                limit: 20,
                name: undefined,
                username: undefined,
            });
        });
    });

    describe('getUser', () => {
        it('should return a user for a valid user id', async () => {
            const mockUser = {
                id: 1,
                email: 'jane@example.com',
                username: 'jane',
                firstName: 'Jane',
                lastName: null,
            };
            (UserService.getOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await controller.getUser(1);

            expect(result).toEqual({
                code: StatusCodes.OK,
                message: 'User retrieved successfully',
                data: mockUser,
            });
            expect(UserService.getOne).toHaveBeenCalledWith(1);
        });

        it('should propagate a user not found error', async () => {
            (UserService.getOne as jest.Mock).mockRejectedValue(
                new NotFoundError('User not found'),
            );

            await expect(controller.getUser(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('createUser', () => {
        it('should create a user and return a created response', async () => {
            const request = {
                email: 'jane@example.com',
                password: 'Password123!',
                username: 'jane',
                firstName: 'Jane',
                lastName: 'Doe',
            };
            const mockUser = { id: 1, ...request };
            (UserService.createUser as jest.Mock).mockResolvedValue(mockUser);

            const result = await controller.createUser(request);

            expect(result).toEqual({
                code: StatusCodes.CREATED,
                message: 'User created successfully',
                data: mockUser,
            });
            expect(UserService.createUser).toHaveBeenCalledWith(request);
        });

        it('should propagate user creation errors', async () => {
            const request = {
                email: 'jane@example.com',
                password: 'Password123!',
                username: 'jane',
                firstName: 'Jane',
            };
            (UserService.createUser as jest.Mock).mockRejectedValue(
                new Error('User creation failed'),
            );

            await expect(controller.createUser(request)).rejects.toThrow('User creation failed');
        });
    });

    describe('updateUser', () => {
        it('should update a user and return the updated data', async () => {
            const request = {
                email: 'jane.doe@example.com',
                username: 'janedoe',
                firstName: 'Jane',
                lastName: 'Doe',
            };
            const mockUser = { id: 1, ...request };
            (UserService.updateUser as jest.Mock).mockResolvedValue(mockUser);

            const result = await controller.updateUser(1, request);

            expect(result).toEqual({
                code: StatusCodes.OK,
                message: 'User data updated successfully',
                data: mockUser,
            });
            expect(UserService.updateUser).toHaveBeenCalledWith(request, 1);
        });

        it('should propagate user update errors', async () => {
            const request = {
                email: 'jane@example.com',
                username: 'jane',
                firstName: 'Jane',
            };
            (UserService.updateUser as jest.Mock).mockRejectedValue(
                new NotFoundError('User not found'),
            );

            await expect(controller.updateUser(999, request)).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user and return a success response', async () => {
            (UserService.deleteUser as jest.Mock).mockResolvedValue({ affected: 1 });

            const result = await controller.deleteUser(1);

            expect(result).toEqual({
                code: StatusCodes.OK,
                message: 'User data deleted successfully',
            });
            expect(UserService.deleteUser).toHaveBeenCalledWith(1);
        });

        it('should propagate user deletion errors', async () => {
            (UserService.deleteUser as jest.Mock).mockRejectedValue(
                new NotFoundError('User not found'),
            );

            await expect(controller.deleteUser(999)).rejects.toThrow(NotFoundError);
        });
    });
});
