import { AppDataSource } from '../data-source';
import { Permission } from '../../../modules/roles/entities/Permission';
import { Role } from '../../../modules/roles/entities/Role';
import { User } from '../../../modules/users/entities/User';

export async function clearTablesData() {
    await AppDataSource.createQueryBuilder().delete().from('role_permissions').execute();
    await AppDataSource.createQueryBuilder().delete().from(Permission).execute();
    await AppDataSource.createQueryBuilder().delete().from(Role).execute();
    await AppDataSource.createQueryBuilder().delete().from('user_roles').execute();
    await AppDataSource.createQueryBuilder()
        .delete()
        .from(User)
        .where('email = :email', {
            email: 'admin@app.com',
        })
        .execute();
}
