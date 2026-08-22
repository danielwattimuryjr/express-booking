import z from 'zod';

export const roleRequestSchema = z.object({
    name: z.string('Name is required'),
    description: z.string().optional(),
});
