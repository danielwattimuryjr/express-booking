import * as express from 'express';

export function expressAuthentication(
    _request: express.Request,
    _securityName: string,
    _scopes?: string[],
) {
    /*
     * This just tells TSOA to add auth specs to openapi.
     * Actual authentication is handled by a custom middleware.
     */
    return new Promise<void>((resolve) => resolve());
}
