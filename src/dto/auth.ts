import z from 'zod';
import { loginSchema, registerSchema } from '../schema';
import { HttpResponse, UserResponse } from '.';

type AuthResponse = {
    accessToken: string;
    refreshToken: string;
};

export type PostLoginRequest = z.infer<typeof loginSchema>;
export type PostLoginResponse = HttpResponse<AuthResponse>;

export type PostRefreshResponse = HttpResponse<AuthResponse>;

export type PostRegisterRequest = z.infer<typeof registerSchema>;
export type PostRegisterResponse = HttpResponse<UserResponse>;

export type PostLogoutResponse = HttpResponse<undefined>;
