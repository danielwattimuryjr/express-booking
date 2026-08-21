import { AppDataSource } from '../typeorm';
import { Permission, Role } from '../../../entitites';

export async function clearTablesData() {
    await AppDataSource.createQueryBuilder().delete().from('role_permissions').execute();
    await AppDataSource.createQueryBuilder().delete().from(Permission).execute();
    await AppDataSource.createQueryBuilder().delete().from(Role).execute();
}
