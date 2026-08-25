import { AppDataSource } from '../../../config/database';
import { Permission } from '../entities/Permission';

export class PermissionRepository {
    private static readonly repository = AppDataSource.getRepository(Permission);

    public static async findByRoleId(id: number) {
        return this.repository.find({
            where: { roles: { id } },
            select: {
                id: true,
                name: true,
                description: true,
            },
        });
    }
}
