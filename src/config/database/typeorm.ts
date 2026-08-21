import { DataSource } from 'typeorm';
import config from '../config';
import { Permission, RefreshToken, Role, User } from '../../entitites';
import { TypeOrmWinstonLogger } from '../logger';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    username: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    synchronize: false,
    logging: ['query', 'error', 'warn'],
    logger: new TypeOrmWinstonLogger(),
    entities: [User, Role, RefreshToken, Permission],
    subscribers: [],
    migrations: [],
    cache: {
        type: 'redis',
        options: {
            socket: {
                host: config.REDIS_HOST,
                port: 6379,
            },
            password: config.REDIS_PASSWORD,
        },
    },
});
