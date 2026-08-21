import { Expose } from 'class-transformer';
import z from 'zod';
import { loginSchema } from '../schema';

export class AuthResponse {
    @Expose()
    accessToken: string;

    @Expose()
    refreshToken: string;
}

export type LoginRequest = z.infer<typeof loginSchema>;
