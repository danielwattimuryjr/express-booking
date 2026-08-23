import 'reflect-metadata';

import app from './app';
import config from './config/config';
import { pool } from './infrastructure/database/PostgresPool';
import { AppDataSource } from './infrastructure/database/data-source';
import { logger } from './infrastructure/logger/Logger';

async function main() {
    try {
        await pool.query('SELECT 1');

        await AppDataSource.initialize();

        app.listen(config.PORT, config.HOST, () => {
            logger.info(`App is running on http://${config.HOST}:${config.PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
}

void main();
