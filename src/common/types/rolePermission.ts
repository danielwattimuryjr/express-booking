import z from 'zod';
import { updateRolePermissionSchema } from '../../modules/roles/schemas/RolePermissionSchema';
import { HttpResponse } from '.';

type RolePermissionResponse = {
    id: number;
    name: string;
    description: string | null;
};

export type GetRolePermissionResponse = HttpResponse<RolePermissionResponse[]>;

export type PutRolePermissionRequest = z.infer<typeof updateRolePermissionSchema>;
export type PutRolePermissionResponse = HttpResponse<RolePermissionResponse[]>;
