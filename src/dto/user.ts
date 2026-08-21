import { Expose } from 'class-transformer';
import z from 'zod';
import { createUserSchema, updateUserSchema } from '../schema/user.schema';

export class UserResponse {
    @Expose()
    id: number;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    email: string;

    @Expose()
    username: string;
}

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export type GetAllUserResponse = UserResponse[];
