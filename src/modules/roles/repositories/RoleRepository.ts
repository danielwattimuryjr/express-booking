import { Role } from '../entities/Role';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { RoleEnum } from '../../../common/enum';
import { DeepPartial } from 'typeorm';

export class RoleRepository {
    private static readonly repository = AppDataSource.getRepository(Role);

    public static async findPaginated(page: number, limit: number, name?: string) {
        const query = this.repository
            .createQueryBuilder('role')
            .select(['role.id', 'role.name', 'role.description'])
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('role.name', 'ASC');

        if (name)
            query.andWhere(`role.name ILIKE :name`, {
                name: `%${name}%`,
            });

        return query.getManyAndCount();
    }

    public static async findOneById(id: number) {
        return await this.repository.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });
    }

    public static async findOneByName(name: RoleEnum) {
        return await this.repository.findOneBy({
            name,
        });
    }

    public static async deleteById(id: number) {
        return await this.repository.delete({ id });
    }

    public static async save(role: DeepPartial<Role>) {
        return await this.repository.save(role);
    }
}
