import { Repository } from 'typeorm';
import { Permission } from '../entities';
import { AppDataSource } from '../config/database';

class PermissionRepositoryClass extends Repository<Permission> {
    constructor() {
        super(Permission, AppDataSource.manager);
    }

    async findByRoleId(id: number) {
        return await this.find({
            where: { roles: { id } },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });
    }
}

export const PermissionRepository = new PermissionRepositoryClass();
