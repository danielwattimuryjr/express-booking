import { Controller, Header, Post, Route, Tags } from 'tsoa';
import { Body, ValidateBody } from '../../../common/decorators';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/AuthService';
import { loginSchema, registerSchema } from '../schemas/LoginSchema';
import {
    PostLoginRequest,
    PostLoginResponse,
    PostLogoutResponse,
    PostRefreshResponse,
    PostRegisterRequest,
    PostRegisterResponse,
} from '../../../common/types';
import { UnauthorizedError } from '../../../common/errors';

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
    private extractBearerToken(authorization: string): string {
        const [scheme, token] = authorization.split(' ');

        if (scheme !== 'Bearer' || !token) {
            throw new UnauthorizedError();
        }

        return token;
    }

    @Post('login')
    @ValidateBody(loginSchema)
    public async login(@Body() body: PostLoginRequest): Promise<PostLoginResponse> {
        const data = await AuthService.login(body);

        return {
            code: StatusCodes.OK,
            message: 'Login successfull',
            data,
        };
    }

    @Post('refresh')
    public async refresh(
        @Header('X-Refresh-Token') refreshToken: string,
    ): Promise<PostRefreshResponse> {
        const token = this.extractBearerToken(refreshToken);
        const data = await AuthService.refresh(token);

        return {
            code: StatusCodes.OK,
            message: 'Token refreshed',
            data,
        };
    }

    @Post('logout')
    public async logout(
        @Header('X-Refresh-Token') refreshToken: string,
    ): Promise<PostLogoutResponse> {
        const token = this.extractBearerToken(refreshToken);
        await AuthService.logout(token);

        return {
            code: StatusCodes.OK,
            message: 'Logout successfull',
        };
    }

    @Post('register')
    @ValidateBody(registerSchema)
    public async register(@Body() body: PostRegisterRequest): Promise<PostRegisterResponse> {
        const user = await AuthService.register(body);

        this.setStatus(StatusCodes.CREATED);
        return {
            code: StatusCodes.CREATED,
            message: 'User has been registered successfully',
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
            },
        };
    }
}
