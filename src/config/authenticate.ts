import * as express from 'express';

export function expressAuthentication(
    // @ts-ignore
    request: express.Request,
    // @ts-ignore
    securityName: string,
    // @ts-ignore
    scopes?: string[],
): Promise<any> {
    /*
     * This just tells TSOA to add auth specs to openapi.
     * Actual authentication is handled by a custom middleware.
     */
    return new Promise<void>((resolve) => resolve());
}
