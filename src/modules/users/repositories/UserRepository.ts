import { DeepPartial } from 'typeorm';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { User } from '../entities/User';

export class UserRepository {
    private static readonly repository = AppDataSource.getRepository(User);

    public static async findOneById(id: number) {
        return this.repository.findOne({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
            },
        });
    }

    public static async findOneByIdWithAuthorization(id: number) {
        return this.repository.findOne({
            where: { id },

            relationLoadStrategy: 'query',

            relations: {
                roles: {
                    permissions: true,
                },
            },

            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,

                roles: {
                    id: true,
                    name: true,
                },
            },
        });
    }

    public static async findOneByEmail(email: string) {
        return this.repository.findOne({
            where: { email },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                password: true,
            },
        });
    }

    public static async findPaginated(
        page: number,
        limit: number,
        name?: string,
        username?: string,
    ) {
        const query = this.repository
            .createQueryBuilder('user')
            .select(['user.id', 'user.first_name', 'user.last_name', 'user.email', 'user.username'])
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('user.id', 'ASC');

        if (name)
            query.andWhere(`CONCAT(user.first_name, ' ', user.last_name) ILIKE :name`, {
                name: `%${name}%`,
            });

        if (username) query.orWhere(`user.username ILIKE :username`, { username: `%${username}%` });

        return query.getManyAndCount();
    }

    public static async deleteById(id: number) {
        return await this.repository.delete({ id });
    }

    public static async save(user: DeepPartial<User>) {
        const newUser = this.repository.create(user);
        return await this.repository.save(newUser);
    }
}
