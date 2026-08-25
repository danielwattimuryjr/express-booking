import { DataSource } from 'typeorm';
import config from '../../config/config';
import { User } from '../../modules/users/entities/User';
import { RefreshToken } from '../../modules/auth/entities/RefreshToken';
import { Permission } from '../../modules/roles/entities/Permission';
import { Role } from '../../modules/roles/entities/Role';
import { TypeOrmWinstonLogger } from '../logger/TypeOrmLogger';
import { Hotel } from '../../modules/hotels/entities/Hotel';
import { HotelAddress } from '../../modules/hotels/entities/HotelAddress';
import { Amenity } from '../../modules/hotels/entities/Amenity';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    username: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    synchronize: config.NODE_ENV === 'production' ? false : true,
    logging: ['query', 'error', 'warn'],
    logger: new TypeOrmWinstonLogger(),
    entities: [User, Role, RefreshToken, Permission, Hotel, HotelAddress, Amenity],
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
