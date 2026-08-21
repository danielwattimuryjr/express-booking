import 'reflect-metadata';

import app from './app';
import config from './config/config';
import { pool } from './config/database';
import { AppDataSource } from './config/database';
import { logger } from './config/logger';

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
