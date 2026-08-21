import { Logger as TypeOrmLogger } from 'typeorm';
import logger from './config';
import config from '../config';

export class TypeOrmWinstonLogger implements TypeOrmLogger {
    isProduction = config.NODE_ENV === 'production';

    logQuery(query: string, parameters?: unknown[]) {
        logger.debug('TypeORM query', {
            query,
            parameters: this.isProduction ? undefined : parameters,
        });
    }

    logQueryError(error: string | Error, query: string, parameters?: unknown[]) {
        logger.error('TypeORM query error', {
            error,
            query,
            parameters: this.isProduction ? undefined : parameters,
        });
    }

    logQuerySlow(time: number, query: string, parameters?: unknown[]) {
        logger.warn('TypeORM slow query', {
            executionTime: time,
            query,
            parameters: this.isProduction ? undefined : parameters,
        });
    }

    logSchemaBuild(message: string) {
        logger.info('TypeORM schema build', {
            message,
        });
    }

    logMigration(message: string) {
        logger.info('TypeORM migration', {
            message,
        });
    }

    log(level: 'log' | 'info' | 'warn', message: unknown) {
        logger.log(level === 'log' ? 'info' : level, String(message));
    }
}
