import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../../common/utils/constants';
import { NotFoundError } from '../../../common/errors';
import { Role } from '../entities/Role';
import { RoleRepository } from '../repositories/RoleRepository';
import { GetAllRoleQuery, PatchRoleRequest, PostRoleRequest } from '../../../common/types';

export class RoleService {
    private static toRoleResponse(role: Role) {
        return {
            id: role.id,
            name: role.name,
            description: role.description,
        };
    }

    static async listRoles({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, name }: GetAllRoleQuery) {
        const normalizedPage = Math.max(1, page);
        const normalizedLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

        const [roles, total] = await RoleRepository.findPaginated(
            normalizedPage,
            normalizedLimit,
            name,
        );
        const totalPages = Math.ceil(total / normalizedLimit);

        return {
            data: roles,
            pagination: {
                page: normalizedPage,
                limit: normalizedLimit,
                total,
                totalPages,
            },
        };
    }

    static async getRole(roleId: number) {
        const role = await RoleRepository.findById(roleId);
        if (!role) throw new NotFoundError('Role not found');

        return this.toRoleResponse(role);
    }

    static async createRole(body: PostRoleRequest) {
        const role = RoleRepository.create({
            name: body.name,
            description: body.description,
        });
        await RoleRepository.save(role);

        return this.toRoleResponse(role);
    }

    static async updateRole({ name, description }: PatchRoleRequest, roleId: number) {
        const role = await this.getRole(roleId);
        role.name = name;
        role.description = description ?? null;
        await RoleRepository.save(role);

        return role;
    }

    static async deleteRole(roleId: number) {
        const role = await this.getRole(roleId);

        return await RoleRepository.deleteById(role.id);
    }
}
