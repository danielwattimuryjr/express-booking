import { Repository } from 'typeorm';
import { Role } from '../entities/Role';
import { AppDataSource } from '../../../infrastructure/database/data-source';

class RoleRepositoryClass extends Repository<Role> {
    constructor() {
        super(Role, AppDataSource.manager);
    }

    async findPaginated(page: number, limit: number, name?: string) {
        const query = this.createQueryBuilder('role')
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

    async findById(id: number) {
        return await this.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });
    }

    async deleteById(id: number) {
        return await this.delete({ id });
    }
}

export const RoleRepository = new RoleRepositoryClass();
