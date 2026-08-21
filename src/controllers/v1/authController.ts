import { Controller, Header, Post, Route } from 'tsoa';
import { Body, ValidateBody } from '../../decorator';
import { HttpResponse } from '../../common/types/http';
import { LoginRequest, AuthResponse } from '../../dto';
import { StatusCodes } from 'http-status-codes';
import { AuthSerializer } from '../../serializer';
import { AuthService } from '../../services';
import { loginSchema } from '../../schema';
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
}
