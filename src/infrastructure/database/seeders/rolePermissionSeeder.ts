import { RoleEnum, PermissionEnum } from '../../../common/enum';
import { AppDataSource } from '../data-source';
import { Permission } from '../../../modules/roles/entities/Permission';
import { Role } from '../../../modules/roles/entities/Role';

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

function isRoleEnum(value: string): value is RoleEnum {
    return Object.values(RoleEnum).includes(value as RoleEnum);
}

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
        if (!isRoleEnum(role.name)) {
            throw new Error(`Invalid role: ${role.name}`);
        }

        const permissionNames = rolePermissions[role.name] ?? [];

        role.permissions = permissionNames
            .map((name) => permissionMap.get(name))
            .filter((permission): permission is Permission => permission !== undefined);

        await roleRepository.save(role);
    }
}
