import { UserService } from '../../services/userService';
import { UserRepository, RoleRepository } from '../../repositories';
import { NotFoundError } from '../../error';
import bcrypt from 'bcrypt';
import { RoleEnum } from '../../common/enum';
import { DEFAULT_LIMIT } from '../../const';

jest.mock('../../repositories');
jest.mock('bcrypt');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getOne', () => {
        it('should return user data for valid userId', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
            };

            (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await UserService.getOne(1);

            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                username: mockUser.username,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
            });
            expect(UserRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should handle user with null lastName', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: null,
            };

            (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await UserService.getOne(1);

            expect(result.lastName).toBeNull();
        });

        it('should throw NotFoundError when user does not exist', async () => {
            (UserRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(UserService.getOne(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('getUsers', () => {
        it('should return paginated users with default pagination', async () => {
            const mockUsers = [
                {
                    id: 1,
                    email: 'test1@example.com',
                    username: 'testuser1',
                    firstName: 'Test',
                    lastName: 'User1',
                },
                {
                    id: 2,
                    email: 'test2@example.com',
                    username: 'testuser2',
                    firstName: 'Test',
                    lastName: 'User2',
                },
            ];

            (UserRepository.findPaginated as jest.Mock).mockResolvedValue([mockUsers, 2]);

            const result = await UserService.getUsers({});

            expect(result.data).toEqual(mockUsers);
            expect(result.pagination).toEqual({
                page: 1,
                limit: DEFAULT_LIMIT,
                total: 2,
                totalPages: 1,
            });
        });

        it('should return paginated users with custom pagination', async () => {
            const mockUsers = [
                {
                    id: 1,
                    email: 'test1@example.com',
                    username: 'testuser1',
                    firstName: 'Test',
                    lastName: 'User1',
                },
            ];

            (UserRepository.findPaginated as jest.Mock).mockResolvedValue([mockUsers, 50]);

            const result = await UserService.getUsers({
                page: 2,
                limit: 25,
            });

            expect(result.pagination).toEqual({
                page: 2,
                limit: 25,
                total: 50,
                totalPages: 2,
            });
            expect(UserRepository.findPaginated).toHaveBeenCalledWith(2, 25, undefined, undefined);
        });

        it('should normalize invalid page to 1', async () => {
            (UserRepository.findPaginated as jest.Mock).mockResolvedValue([[], 0]);

            await UserService.getUsers({ page: 0 });

            expect(UserRepository.findPaginated).toHaveBeenCalledWith(
                1,
                DEFAULT_LIMIT,
                undefined,
                undefined,
            );
        });

        it('should filter by name', async () => {
            (UserRepository.findPaginated as jest.Mock).mockResolvedValue([[], 0]);

            await UserService.getUsers({ name: 'John' });

            expect(UserRepository.findPaginated).toHaveBeenCalledWith(
                1,
                DEFAULT_LIMIT,
                'John',
                undefined,
            );
        });

        it('should filter by username', async () => {
            (UserRepository.findPaginated as jest.Mock).mockResolvedValue([[], 0]);

            await UserService.getUsers({ username: 'johndoe' });

            expect(UserRepository.findPaginated).toHaveBeenCalledWith(
                1,
                DEFAULT_LIMIT,
                undefined,
                'johndoe',
            );
        });
    });

    describe('createUser', () => {
        it('should successfully create a new user', async () => {
            const mockRole = { id: 1, name: RoleEnum.USER };
            const createRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
            };

            const mockUser = {
                id: 1,
                ...createRequest,
                password: 'hashedPassword',
                roles: [mockRole],
            };

            (RoleRepository.findOneBy as jest.Mock).mockResolvedValue(mockRole);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (UserRepository.create as jest.Mock).mockReturnValue(mockUser);
            (UserRepository.save as jest.Mock).mockResolvedValue(mockUser);

            const result = await UserService.createUser(createRequest);

            expect(result).toEqual(mockUser);
            expect(bcrypt.hash).toHaveBeenCalledWith(createRequest.password, 12);
            expect(UserRepository.create).toHaveBeenCalledWith({
                email: createRequest.email,
                firstName: createRequest.firstName,
                lastName: createRequest.lastName,
                password: 'hashedPassword',
                username: createRequest.username,
                roles: [mockRole],
            });
            expect(UserRepository.save).toHaveBeenCalledWith(mockUser);
        });

        it('should throw NotFoundError when ROLE_USER does not exist', async () => {
            const createRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
            };

            (RoleRepository.findOneBy as jest.Mock).mockResolvedValue(null);

            await expect(UserService.createUser(createRequest)).rejects.toThrow(NotFoundError);
        });
    });

    describe('updateUser', () => {
        it('should successfully update user', async () => {
            const mockUser = {
                id: 1,
                email: 'old@example.com',
                username: 'olduser',
                firstName: 'Old',
                lastName: 'Name',
            };

            const updateRequest = {
                email: 'new@example.com',
                username: 'newuser',
                firstName: 'New',
                lastName: 'Name',
            };

            (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
            (UserRepository.save as jest.Mock).mockResolvedValue({
                ...mockUser,
                ...updateRequest,
            });

            await UserService.updateUser(updateRequest, 1);

            expect(UserRepository.save).toHaveBeenCalled();
        });

        it('should set lastName to null when not provided', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
            };

            const updateRequest = {
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
            };

            (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
            (UserRepository.save as jest.Mock).mockResolvedValue({
                ...mockUser,
                lastName: null,
            });

            await UserService.updateUser(updateRequest, 1);

            expect(UserRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundError when user does not exist', async () => {
            const updateRequest = {
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
            };

            (UserRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(UserService.updateUser(updateRequest, 999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteUser', () => {
        it('should successfully delete user', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
            };

            (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);
            (UserRepository.deleteById as jest.Mock).mockResolvedValue({ affected: 1 });

            await UserService.deleteUser(1);

            expect(UserRepository.findById).toHaveBeenCalledWith(1);
            expect(UserRepository.deleteById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundError when user does not exist', async () => {
            (UserRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(UserService.deleteUser(999)).rejects.toThrow(NotFoundError);
        });
    });
});
