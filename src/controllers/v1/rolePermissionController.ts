import { Body, Controller, Get, Path, Put, Route, Security, Tags } from 'tsoa';
import { Authorize } from '../../decorator/authorize';
import { PermissionEnum } from '../../common/enum';
import { HttpResponse } from '../../common/types/http';
import { RolePermissionRequest, RolePermissionResponse } from '../../dto';
import { RolePermissionService } from '../../services';
import { StatusCodes } from 'http-status-codes';

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
    ): Promise<HttpResponse<RolePermissionResponse[]>> {
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
    public async putRoleWithPermissions(
        @Path() roleId: number,
        @Body() body: RolePermissionRequest,
    ): Promise<HttpResponse<RolePermissionResponse[]>> {
        const data = await RolePermissionService.syncPermissions(roleId, body.permissions);

        return {
            code: StatusCodes.OK,
            message: 'Permission has beed synced successfully',
            data,
        };
    }
}
