import z from 'zod';
import { updateRolePermissionSchema } from '../schema/rolePermissionSchema';

export type RolePermissionResponse = {
    id: number;
    name: string;
    description: string | null;
};
export type RolePermissionRequest = z.infer<typeof updateRolePermissionSchema>;
