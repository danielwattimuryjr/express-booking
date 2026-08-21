import { logger } from '../../logger';
import { AppDataSource } from '../typeorm';
import { clearTablesData } from './clearTablesData';
import { seedPermissions } from './permissionSeeder';
import { seedRolePermissions } from './rolePermissionSeeder';
import { seedRoles } from './roleSeeder';

async function seed() {
    await AppDataSource.initialize();

    try {
        logger.debug('🌱 Seeding database...');

        await clearTablesData();

        await seedPermissions();
        await seedRoles();
        await seedRolePermissions();

        logger.debug('✅ Database seeded successfully');
    } catch (error) {
        logger.error('❌ Database seeding failed');
        logger.error(error);

        process.exitCode = 1;
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
