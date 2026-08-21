import { Controller, Header, Post, Route } from 'tsoa';
import { Body, ValidateBody } from '../../decorator';
import { HttpResponse } from '../../common/types/http';
import { LoginRequest, AuthResponse, RegisterRequest, RegisterResponse } from '../../dto';
import { StatusCodes } from 'http-status-codes';
import { AuthSerializer } from '../../serializer';
import { AuthService } from '../../services';
import { loginSchema, registerSchema } from '../../schema';
import { extractBearerToken } from '../../common/utils';

@Route('auth')
export class AuthController extends Controller {
    @Post('login')
    @ValidateBody(loginSchema)
    public async login(@Body() body: LoginRequest): Promise<HttpResponse<AuthResponse>> {
        const data = await AuthService.login(body);

        return {
            code: StatusCodes.OK,
            message: 'Login successfull',
            data: AuthSerializer.serialize(data),
        };
    }

    @Post('refresh')
    public async refresh(
        @Header('X-Refresh-Token') refreshToken: string,
    ): Promise<HttpResponse<AuthResponse>> {
        const token = extractBearerToken(refreshToken);
        const data = await AuthService.refresh(token);

        return {
            code: StatusCodes.OK,
            message: 'Token refreshed',
            data: AuthSerializer.serialize(data),
        };
    }

    @Post('logout')
    public async logout(
        @Header('X-Refresh-Token') refreshToken: string,
    ): Promise<HttpResponse<undefined>> {
        const token = extractBearerToken(refreshToken);
        await AuthService.logout(token);

        return {
            code: StatusCodes.OK,
            message: 'Logout successfull',
        };
    }

    @Post('register')
    @ValidateBody(registerSchema)
    public async register(@Body() body: RegisterRequest): Promise<HttpResponse<RegisterResponse>> {
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
