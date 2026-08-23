import { In } from 'typeorm';
import { PermissionEnum } from '../../../common/enum';
import { NotFoundError } from '../../../common/errors';
import { AppDataSource } from '../../../infrastructure/database/data-source';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';
import { PermissionRepository } from '../repositories/PermissionRepository';

export class RolePermissionService {
    private static toPermissionResponse(permissions: Permission[]) {
        return permissions.map((permission) => ({
            id: permission.id,
            name: permission.name,
            description: permission.description ?? null,
        }));
    }

    static async listPermissions(roleId: number) {
        const permissions = await PermissionRepository.findByRoleId(roleId);

        return this.toPermissionResponse(permissions);
    }

    static async syncPermissions(id: number, permissions: PermissionEnum[]) {
        return await AppDataSource.transaction(async (manager) => {
            const roleRepository = manager.getRepository(Role);
            const permissionRepository = manager.getRepository(Permission);

            const role = await roleRepository.findOne({
                where: { id },
                relations: {
                    permissions: true,
                },
            });
            if (!role) {
                throw new NotFoundError(`Role with id ${id} not found`);
            }

            role.permissions = [];
            await roleRepository.save(role);

            const permissionEntities = permissions.length
                ? await permissionRepository.find({
                      where: { name: In(permissions) },
                  })
                : [];

            role.permissions = permissionEntities;
            const savedRole = await roleRepository.save(role);

            return this.toPermissionResponse(savedRole.permissions);
        });
    }
}
