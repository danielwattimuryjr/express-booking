import { serialize } from '.';
import { AuthResponse } from '../dto/auth';

export class AuthSerializer {
    static serialize(raw: { accessToken: string; refreshToken: string }): AuthResponse {
        return serialize(AuthResponse, raw);
    }
}
