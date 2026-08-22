import z from 'zod';
import { createUserSchema, updateUserSchema } from '../schema/userSchema';

export type UserResponse = {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string;
    username: string;
};

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export type SearchUserQuery = {
    name?: string;
    username?: string;
};
