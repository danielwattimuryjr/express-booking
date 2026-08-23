import z from 'zod';
import { PermissionEnum } from '../../../common/enum';

export const updateRolePermissionSchema = z.object({
    permissions: z.array(z.enum(PermissionEnum)).min(1, 'At least one permission is selected'),
});
