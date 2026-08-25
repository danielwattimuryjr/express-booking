import { logger } from '../../logger/Logger';
import { AppDataSource } from '../data-source';
import { seedAdmin } from './adminSeeder';
import { seedAmenities } from './amenitySeeder';
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
        await seedAdmin();
        await seedAmenities();

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
