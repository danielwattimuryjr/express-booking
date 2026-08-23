import { PermissionEnum } from '../../../common/enum';
import { AppDataSource } from '../data-source';
import { Permission } from '../../../modules/roles/entities/Permission';
import { seedEnum } from './core/seedEnum';

export async function seedPermissions() {
    const repository = AppDataSource.getRepository(Permission);

    await seedEnum({
        repository,
        values: PermissionEnum,
        map: (name) => ({
            name,
            description: null,
        }),
    });
}
