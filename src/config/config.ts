import dotenv from 'dotenv';
import { envSchema } from '../schema/env.schema';
import { logger } from './logger';

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
