import { Controller, Delete, Get, Patch, Path, Post, Query, Route, Security } from 'tsoa';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../../dto';
import { HttpPaginateResponse, HttpResponse } from '../../common/types/http';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../../services';
import { createUserSchema, updateUserSchema } from '../../schema/userSchema';
import { Body, ValidateBody } from '../../decorator';
import { PermissionEnum } from '../../common/enum';
import { Authorize } from '../../decorator/authorize';

@Route('users')
@Security('bearerAuth')
export class UserController extends Controller {
    @Get('')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.USER_READ],
    })
    public async getAllUsers(
        @Query() page: number = 1,
        @Query() limit: number = 20,
        @Query() name?: string,
        @Query() username?: string,
    ): Promise<HttpPaginateResponse<UserResponse[]>> {
        const result = await UserService.getUsers({
            limit,
            page,
            name,
            username,
        });

        return {
            code: StatusCodes.OK,
            message: 'Users fetched successfully',
            data: result.data,
            pagination: result.pagination,
        };
    }

    @Authorize({
        type: 'permission',
        values: [PermissionEnum.USER_READ],
    })
    @Get('{userId}')
    public async getUser(@Path() userId: number): Promise<HttpResponse<UserResponse>> {
        const data = await UserService.getOne(userId);

        return {
            message: 'User retrieved successfully',
            code: StatusCodes.OK,
            data,
        };
    }

    @Post('')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.USER_CREATE],
    })
    @ValidateBody(createUserSchema)
    public async createUser(
        @Body() request: CreateUserRequest,
    ): Promise<HttpResponse<UserResponse>> {
        const data = await UserService.createUser(request);

        this.setStatus(StatusCodes.CREATED);
        return {
            message: 'User created successfully',
            code: StatusCodes.CREATED,
            data,
        };
    }

    @Patch('{userId}')
    @ValidateBody(updateUserSchema)
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.USER_UPDATE],
    })
    public async updateUser(
        @Path() userId: number,
        @Body() body: UpdateUserRequest,
    ): Promise<HttpResponse<UserResponse>> {
        const data = await UserService.updateUser(body, userId);

        return {
            code: StatusCodes.OK,
            message: 'User data updated successfully',
            data,
        };
    }

    @Delete('{userId}')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.USER_DELETE],
    })
    public async deleteUser(@Path() userId: number): Promise<HttpResponse<undefined>> {
        await UserService.deleteUser(userId);

        return {
            code: StatusCodes.OK,
            message: 'User data deleted successfully',
        };
    }
}
