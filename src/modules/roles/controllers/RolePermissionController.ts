import { Controller, Get, Path, Put, Route, Security, Tags } from 'tsoa';
import { Authorize } from '../../../common/decorators/authorize';
import { PermissionEnum } from '../../../common/enum';
import { RolePermissionService } from '../services/RolePermissionService';
import { StatusCodes } from 'http-status-codes';
import {
    GetRolePermissionResponse,
    PutRolePermissionRequest,
    PutRolePermissionResponse,
} from '../../../common/types';
import { Body, ValidateBody } from '../../../common/decorators';
import { updateRolePermissionSchema } from '../schemas/RolePermissionSchema';

@Route('roles/{roleId}/permissions')
@Tags('Roles & Permissions')
@Security('bearerAuth')
export class RolePermissionController extends Controller {
    @Get()
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.ROLE_READ],
    })
    public async getRoleWithAllPermissions(
        @Path() roleId: number,
    ): Promise<GetRolePermissionResponse> {
        const data = await RolePermissionService.listPermissions(roleId);

        return {
            code: StatusCodes.OK,
            message: 'Permission fetched successfully',
            data,
        };
    }

    @Put()
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.ROLE_UPDATE],
    })
    @ValidateBody(updateRolePermissionSchema)
    public async putRoleWithPermissions(
        @Path() roleId: number,
        @Body() body: PutRolePermissionRequest,
    ): Promise<PutRolePermissionResponse> {
        const data = await RolePermissionService.syncPermissions(roleId, body.permissions);

        return {
            code: StatusCodes.OK,
            message: 'Permission has beed synced successfully',
            data,
        };
    }
}
