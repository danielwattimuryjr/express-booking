import z from 'zod';
import { HttpResponse, UserResponse } from '.';
import { updateUserSchema } from '../../modules/users/schemas/UserSchema';

export type GetCurrentUserResponse = HttpResponse<UserResponse>;

export type PutCurrentUserRequest = z.infer<typeof updateUserSchema>;
export type PutCurrentUserResponse = HttpResponse<UserResponse>;
