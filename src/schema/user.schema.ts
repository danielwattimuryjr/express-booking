import z from 'zod';

export const userSchema = z.object({
    firstName: z.string().min(1, 'Name is required'),
    lastName: z.string().optional(),
    email: z.email().min(1, 'Email is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});
