import { Body, Controller, Get, Patch, RequestProp, Route, Security, Tags } from 'tsoa';
import { Authorize } from '../../decorator/authorize';
import type { AuthenticatedUser, HttpResponse } from '../../common/types/http';
import { UpdateUserRequest, UserResponse } from '../../dto';
import { UserService } from '../../services';
import { StatusCodes } from 'http-status-codes';
import { ValidateBody } from '../../decorator';
import { updateUserSchema } from '../../schema';

@Route('me')
@Tags('Current User')
@Security('bearerAuth')
@Authorize({
    type: 'authenticated',
})
export class MeController extends Controller {
    @Get()
    public async getCurrentUser(
        @RequestProp('user') currentLoggedInUser: AuthenticatedUser,
    ): Promise<HttpResponse<UserResponse>> {
        const data = await UserService.getOne(Number(currentLoggedInUser.id));

        return {
            code: StatusCodes.OK,
            message: 'User data fetched successfully',
            data,
        };
    }

    @Patch()
    @ValidateBody(updateUserSchema)
    public async updateCurrentUser(
        @RequestProp('user') currentLoggedInUser: AuthenticatedUser,
        @Body() body: UpdateUserRequest,
    ): Promise<HttpResponse<UserResponse>> {
        const data = await UserService.updateUser(body, Number(currentLoggedInUser.id));

        return {
            code: StatusCodes.OK,
            message: 'User data updated successfully',
            data,
        };
    }
}
