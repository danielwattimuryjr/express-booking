import { Expose } from 'class-transformer';
import z from 'zod';
import { loginSchema, registerSchema } from '../schema';
import { UserResponse } from './user';

export class AuthResponse {
    @Expose()
    accessToken: string;

    @Expose()
    refreshToken: string;
}

export type LoginRequest = z.infer<typeof loginSchema>;

export type RegisterRequest = z.infer<typeof registerSchema>;
export type RegisterResponse = UserResponse;
