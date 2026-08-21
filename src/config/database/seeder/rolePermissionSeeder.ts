import { RoleEnum, PermissionEnum } from '../../../common/enum';
import { AppDataSource } from '../typeorm';
import { Permission, Role } from '../../../entitites';

const rolePermissions: Record<RoleEnum, PermissionEnum[]> = {
    [RoleEnum.ADMIN]: Object.values(PermissionEnum),

    [RoleEnum.STAFF]: [
        PermissionEnum.BOOKING_READ,
        PermissionEnum.BOOKING_CREATE,
        PermissionEnum.BOOKING_UPDATE,
        PermissionEnum.BOOKING_CANCEL,
    ],

    [RoleEnum.USER]: [
        PermissionEnum.BOOKING_READ,
        PermissionEnum.BOOKING_CREATE,
        PermissionEnum.BOOKING_CANCEL,
    ],
};

export async function seedRolePermissions() {
    const roleRepository = AppDataSource.getRepository(Role);
    const permissionRepository = AppDataSource.getRepository(Permission);

    const permissions = await permissionRepository.find();

    const permissionMap = new Map(permissions.map((permission) => [permission.name, permission]));

    const roles = await roleRepository.find({
        relations: {
            permissions: true,
        },
    });

    for (const role of roles) {
        const permissionNames = rolePermissions[role.name] ?? [];

        role.permissions = permissionNames
            .map((name) => permissionMap.get(name))
            .filter((permission): permission is Permission => permission !== undefined);

        await roleRepository.save(role);
    }
}
