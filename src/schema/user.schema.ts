import z from 'zod';

export const createUserSchema = z.object({
    password: z.string().min(1, 'Password is required'),
    firstName: z.string().min(1, 'Name is required'),
    lastName: z.string().optional(),
    email: z.email().min(1, 'Email is required'),
    username: z.string().min(1, 'Username is required'),
});

export const updateUserSchema = z.object({
    firstName: z.string().min(1, 'Name is required'),
    lastName: z.string().optional(),
    email: z.email().min(1, 'Email is required'),
    username: z.string().min(1, 'Username is required'),
});
