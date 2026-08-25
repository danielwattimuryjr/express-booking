import { Controller, Delete, Get, Path, Post, Put, Query, Route, Security, Tags } from 'tsoa';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../services/UserService';
import { createUserSchema, updateUserSchema } from '../schemas/UserSchema';
import { Body, ValidateBody } from '../../../common/decorators';
import { PermissionEnum } from '../../../common/enum';
import { Authorize } from '../../../common/decorators/authorize';
import {
    DeleteUserResponse,
    GetAllUserResponse,
    GetOneUserResponse,
    PutUserRequest,
    PutUserResponse,
    PostUserRequest,
    PostUserResponse,
} from '../../../common/types';

@Route('users')
@Tags('User Management')
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
    ): Promise<GetAllUserResponse> {
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
    public async getUser(@Path() userId: number): Promise<GetOneUserResponse> {
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
    public async createUser(@Body() request: PostUserRequest): Promise<PostUserResponse> {
        const data = await UserService.createUser(request);

        this.setStatus(StatusCodes.CREATED);
        return {
            message: 'User created successfully',
            code: StatusCodes.CREATED,
            data,
        };
    }

    @Put('{userId}')
    @ValidateBody(updateUserSchema)
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.USER_UPDATE],
    })
    public async updateUser(
        @Path() userId: number,
        @Body() body: PutUserRequest,
    ): Promise<PutUserResponse> {
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
    public async deleteUser(@Path() userId: number): Promise<DeleteUserResponse> {
        await UserService.deleteUser(userId);

        return {
            code: StatusCodes.OK,
            message: 'User data deleted successfully',
        };
    }
}
