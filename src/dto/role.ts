import z from 'zod';
import { roleRequestSchema } from '../schema';

export type RoleRequest = z.infer<typeof roleRequestSchema>;
export type RoleResponse = { id: number; name: string; description: string | null };

export type SearchRoleQuery = {
    name?: string;
};
