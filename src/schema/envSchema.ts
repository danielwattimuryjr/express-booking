import z from 'zod';

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z
        .string()
        .default('3000')
        .transform((val) => Number(val))
        .pipe(z.number().int().min(1).max(65535)),

    POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
    POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),
    POSTGRES_HOST: z.string().min(1, 'POSTGRES_HOST is required'),
    POSTGRES_PORT: z
        .string()
        .min(1, 'POSTGRES_PORT is required')
        .transform((val) => Number(val))
        .pipe(z.number().int().min(1).max(65535)),
    POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),

    LOG_LEVEL: z.string().optional(),
    LOG_DIR: z.string().optional(),

    REDIS_PASSWORD: z.string().min(1, 'REDIS_PASSWORD is required'),
    REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
    REDIS_PORT: z
        .string()
        .min(1, 'REDIS_PORT is required')
        .transform((val) => Number(val))
        .pipe(z.number().int().min(1).max(65535)),

    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_ACCESS_EXPIRATION_MINUTES: z
        .string()
        .default('30')
        .transform((val) => Number(val))
        .pipe(z.number().int().min(1)),
    JWT_REFRESH_EXPIRATION_DAYS: z
        .string()
        .default('7')
        .transform((val) => Number(val))
        .pipe(z.number().int().min(1)),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z
        .string()
        .default('30')
        .transform((val) => Number(val))
        .pipe(z.number().int().min(1)),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z
        .string()
        .default('30')
        .transform((val) => Number(val))
        .pipe(z.number().int().min(1)),
});
