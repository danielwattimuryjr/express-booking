import z from 'zod';

export const loginSchema = z.object({
    email: z.email('Enter a valid email'),
    password: z.string('Password is required'),
});
