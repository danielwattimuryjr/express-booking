import { Expose } from 'class-transformer';
import z from 'zod';
import { userSchema } from '../schema/user.schema';

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

export type UserRequest = z.infer<typeof userSchema>;
