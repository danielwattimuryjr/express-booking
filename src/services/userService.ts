import { NotFoundError } from '../common/error';
import { UserRepository } from '../repositories';
import bcrypt from 'bcrypt';
import { RoleEnum } from '../common/enum';
import { CreateUserRequest, UpdateUserRequest } from '../dto';
import { PaginationQuery } from '../common/types/http';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

type SearchUserQuery = {
    name?: string;
    username?: string;
};

export class UserService {
    static async getUsers({
        page = DEFAULT_PAGE,
        limit = DEFAULT_LIMIT,
        name,
        username,
    }: PaginationQuery & SearchUserQuery) {
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
        const user = await UserRepository.findById(userId);

        if (!user) throw new NotFoundError('User not found');

        return user;
    }

    static async createUser(request: CreateUserRequest) {
        const hashedPassword = await bcrypt.hash(request.password, 12);

        const user = UserRepository.create({
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            password: hashedPassword,
            username: request.username,
            roles: [
                {
                    name: RoleEnum.USER,
                },
            ],
        });
        await UserRepository.save(user);

        return user;
    }

    static async updateUser(request: UpdateUserRequest, userId: number) {
        await UserRepository.update({ id: userId }, request);
    }

    static async deleteUser(userId: number) {
        await UserRepository.delete({ id: userId });
    }
}
