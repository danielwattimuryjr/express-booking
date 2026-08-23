import dotenv from 'dotenv';
import { envSchema } from './env';
import { logger } from '../infrastructure/logger/Logger';

dotenv.config();

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    logger.error('Environment validation failed:', {
        stack: JSON.stringify(parsedEnv.error.format(), null, 2),
    });
    process.exit(1);
}

const config = parsedEnv.data;

export default config;
