import { Body, Controller, Get, Patch, RequestProp, Route, Security } from 'tsoa';
import { Authorize } from '../../decorator/authorize';
import type { AuthenticatedUser, HttpResponse } from '../../common/types/http';
import { UpdateUserRequest, UserResponse } from '../../dto';
import { UserService } from '../../services';
import { StatusCodes } from 'http-status-codes';
import { ValidateBody } from '../../decorator';
import { updateUserSchema } from '../../schema';

@Route('me')
@Security('bearerAuth')
@Authorize({
    type: 'authenticated',
})
export class MeController extends Controller {
    @Get()
    public async getMe(
        @RequestProp('user') currentLoggedInUser: AuthenticatedUser,
    ): Promise<HttpResponse<UserResponse>> {
        const user = await UserService.getOne(Number(currentLoggedInUser.id));

        return {
            code: StatusCodes.OK,
            message: 'User data fetched successfully',
            data: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.id,
                username: user.username,
            },
        };
    }

    @Patch()
    @ValidateBody(updateUserSchema)
    public async updateMe(
        @RequestProp('user') currentLoggedInUser: AuthenticatedUser,
        @Body() body: UpdateUserRequest,
    ): Promise<HttpResponse<undefined>> {
        await UserService.updateUser(body, Number(currentLoggedInUser.id));

        return {
            code: StatusCodes.OK,
            message: 'User data updated successfully',
        };
    }
}
