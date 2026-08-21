import z from 'zod';

export const loginSchema = z.object({
    email: z.email('Enter a valid email'),
    password: z.string('Password is required'),
});

export const registerSchema = z
    .object({
        email: z.email('Enter a valid email'),
        firstName: z.string('First name is required'),
        lastName: z.string().optional(),
        username: z.string('Username is required'),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters long' })
            .max(32, { message: 'Password cannot exceed 32 characters' })
            .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
            .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
            .regex(/[0-9]/, { message: 'Must contain at least one number' })
            .regex(/[^A-Za-z0-9]/, { message: 'Must contain at least one special character' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
