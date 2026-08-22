import { RoleEnum } from '../../../common/enum';
import { AppDataSource } from '../typeorm';
import { Role } from '../../../entities';
import { seedEnum } from './core/seedEnum';

export async function seedRoles() {
    const repository = AppDataSource.getRepository(Role);

    await seedEnum({
        repository,
        values: RoleEnum,
        map: (name) => ({
            name,
            description: null,
        }),
    });
}
