import z from 'zod';
import { HttpResponse, UserResponse } from '.';
import { updateUserSchema } from '../schema';

export type GetCurrentUserResponse = HttpResponse<UserResponse>;

export type PatchCurrentUserRequest = z.infer<typeof updateUserSchema>;
export type PatchCurrentUserResponse = HttpResponse<UserResponse>;
