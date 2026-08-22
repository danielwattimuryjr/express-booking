import { Body, Controller, Delete, Get, Patch, Path, Post, Query, Route, Security } from 'tsoa';
import { Authorize } from '../../decorator/authorize';
import { PermissionEnum } from '../../common/enum';
import { HttpPaginateResponse, HttpResponse } from '../../common/types/http';
import { RoleRequest, RoleResponse } from '../../dto';
import { RoleService } from '../../services/roleService';
import { StatusCodes } from 'http-status-codes';
import { ValidateBody } from '../../decorator';
import { roleRequestSchema } from '../../schema';

@Route('roles')
@Security('bearerAuth')
export class RoleController extends Controller {
    @Get()
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.ROLE_READ],
    })
    public async getAll(
        @Query() page: number = 1,
        @Query() limit: number = 20,
        @Query() name?: string,
    ): Promise<HttpPaginateResponse<RoleResponse[]>> {
        const { data, pagination } = await RoleService.listRoles({
            limit,
            page,
            name,
        });

        return {
            code: StatusCodes.OK,
            message: 'Roles fetched successfully',
            data,
            pagination,
        };
    }

    @Get('{roleId}')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.ROLE_READ],
    })
    public async getOne(@Path() roleId: number): Promise<HttpResponse<RoleResponse>> {
        const data = await RoleService.getRole(roleId);

        return {
            code: StatusCodes.OK,
            message: 'Role fetched successfully',
            data,
        };
    }

    @Post()
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.ROLE_CREATE],
    })
    @ValidateBody(roleRequestSchema)
    public async post(@Body() body: RoleRequest): Promise<HttpResponse<RoleResponse>> {
        const data = await RoleService.createRole(body);

        return {
            code: StatusCodes.CREATED,
            message: 'Role created successfully',
            data,
        };
    }

    @Patch('{roleId}')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.ROLE_UPDATE],
    })
    @ValidateBody(roleRequestSchema)
    public async patch(
        @Path() roleId: number,
        @Body() body: RoleRequest,
    ): Promise<HttpResponse<RoleResponse>> {
        const data = await RoleService.updateRole(body, roleId);

        return {
            code: StatusCodes.OK,
            message: 'Role updated successfully',
            data,
        };
    }

    @Delete('{roleId}')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.ROLE_DELETE],
    })
    public async delete(@Path() roleId: number): Promise<HttpResponse<undefined>> {
        await RoleService.deleteRole(roleId);

        return {
            code: StatusCodes.OK,
            message: 'Role deleted successfully',
        };
    }
}
