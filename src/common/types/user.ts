import z from 'zod';
import { HttpPaginateResponse, HttpResponse, PaginationQuery, UserResponse } from '.';
import { createUserSchema, updateUserSchema } from '../../modules/users/schemas/UserSchema';

type SearchUserQuery = {
    name?: string;
    username?: string;
};

export type GetAllUserQuery = PaginationQuery & SearchUserQuery;
export type GetAllUserResponse = HttpPaginateResponse<UserResponse[]>;

export type GetOneUserResponse = HttpResponse<UserResponse>;

export type PostUserRequest = z.infer<typeof createUserSchema>;
export type PostUserResponse = HttpResponse<UserResponse>;

export type PatchUserRequest = z.infer<typeof updateUserSchema>;
export type PatchUserResponse = HttpResponse<UserResponse>;

export type DeleteUserResponse = HttpResponse<undefined>;
