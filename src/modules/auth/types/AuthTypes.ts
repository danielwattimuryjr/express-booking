export interface TokenPayload {
    sub: string;
    type: 'access' | 'refresh';
    iat: number;
    exp: number;
}

export interface AccessTokenPayload extends TokenPayload {
    type: 'access';
}

export interface RefreshTokenPayload extends TokenPayload {
    type: 'refresh';
    jti: string;
}
