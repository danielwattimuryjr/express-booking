import { PermissionEnum } from '../../../common/enum';
import { AppDataSource } from '../typeorm';
import { Permission } from '../../../entities';
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
