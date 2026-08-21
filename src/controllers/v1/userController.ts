import { Controller, Delete, Get, Patch, Path, Post, Query, Route, Security } from 'tsoa';
import { CreateUserRequest, GetAllUserResponse, UpdateUserRequest, UserResponse } from '../../dto';
import { HttpPaginateResponse, HttpResponse } from '../../common/types/http';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../../services';
import { createUserSchema, updateUserSchema } from '../../schema/user.schema';
import { Body, ValidateBody } from '../../decorator';
import { RoleEnum } from '../../common/enum';
import { Authorize } from '../../decorator/authorize';

@Route('users')
@Security('bearerAuth')
@Authorize({
    type: 'role',
    values: [RoleEnum.ADMIN],
})
export class UserController extends Controller {
    @Get('')
    public async getAllUsers(
        @Query() page: number = 1,
        @Query() limit: number = 20,
        @Query() name?: string,
        @Query() username?: string,
    ): Promise<HttpPaginateResponse<GetAllUserResponse>> {
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

    @Get('{userId}')
    public async getUser(@Path() userId: number): Promise<HttpResponse<UserResponse>> {
        const user = await UserService.getOne(userId);

        return {
            message: 'User retrieved successfully',
            code: StatusCodes.OK,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.password,
            },
        };
    }

    @Post('')
    @ValidateBody(createUserSchema)
    public async createUser(
        @Body() request: CreateUserRequest,
    ): Promise<HttpResponse<UserResponse>> {
        const user = await UserService.createUser(request);

        this.setStatus(StatusCodes.CREATED);
        return {
            message: 'User created successfully',
            code: StatusCodes.CREATED,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.password,
            },
        };
    }

    @Patch('{userId}')
    @ValidateBody(updateUserSchema)
    public async updateUser(
        @Path() userId: number,
        @Body() body: UpdateUserRequest,
    ): Promise<HttpResponse<undefined>> {
        await UserService.updateUser(body, userId);

        return {
            code: StatusCodes.OK,
            message: 'User data updated successfully',
        };
    }

    @Delete('{userId}')
    @ValidateBody(updateUserSchema)
    public async deleteUser(@Path() userId: number): Promise<HttpResponse<undefined>> {
        await UserService.deleteUser(userId);

        return {
            code: StatusCodes.OK,
            message: 'User data deleted successfully',
        };
    }
}
