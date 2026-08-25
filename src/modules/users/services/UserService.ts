import { NotFoundError } from '../../../common/errors';
import { UserRepository } from '../repositories/UserRepository';
import { RoleRepository } from '../../roles/repositories/RoleRepository';
import bcrypt from 'bcrypt';
import { RoleEnum } from '../../../common/enum';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../../common/utils/constants';
import { User } from '../entities/User';
import { GetAllUserQuery, PutUserRequest, PostUserRequest } from '../../../common/types';

export class UserService {
    private static async getUserByIdOrFail(userId: number) {
        const user = await UserRepository.findOneById(userId);
        if (!user) throw new NotFoundError('User not found');
        return user;
    }

    private static toUserResponse(user: User) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName ?? null,
        };
    }

    static async getUsers({
        page = DEFAULT_PAGE,
        limit = DEFAULT_LIMIT,
        name,
        username,
    }: GetAllUserQuery) {
        const normalizedPage = Math.max(1, page);
        const normalizedLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

        const [users, total] = await UserRepository.findPaginated(
            normalizedPage,
            normalizedLimit,
            name,
            username,
        );
        const totalPages = Math.ceil(total / normalizedLimit);

        return {
            data: users,
            pagination: {
                page: normalizedPage,
                limit: normalizedLimit,
                total,
                totalPages,
            },
        };
    }

    static async getOne(userId: number) {
        const user = await this.getUserByIdOrFail(userId);

        return this.toUserResponse(user);
    }

    static async createUser(request: PostUserRequest) {
        const role = await RoleRepository.findOneByName(RoleEnum.USER);
        if (!role) throw new NotFoundError('role with name ROLE_USER not found');
        const hashedPassword = await bcrypt.hash(request.password, 12);

        const user = await UserRepository.save({
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            password: hashedPassword,
            username: request.username,
            roles: [role],
        });

        return user;
    }

    static async updateUser(request: PutUserRequest, userId: number) {
        const user = await this.getUserByIdOrFail(userId);

        user.email = request.email;
        user.firstName = request.firstName;
        user.lastName = request.lastName ?? null;
        user.username = request.username;
        const updatedUser = await UserRepository.save(user);

        return updatedUser;
    }

    static async deleteUser(userId: number) {
        const user = await this.getUserByIdOrFail(userId);

        return await UserRepository.deleteById(user.id);
    }
}
