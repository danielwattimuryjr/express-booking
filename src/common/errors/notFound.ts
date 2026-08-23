import { StatusCodes } from 'http-status-codes';

export class NotFoundError extends Error {
    static readonly errorName = 'NotFoundError';
    static readonly code = StatusCodes.NOT_FOUND;

    name = NotFoundError.errorName;
    code: StatusCodes;
    url: string | undefined;

    constructor(message?: string, url?: string) {
        super(message ?? 'Resource not found');
        this.code = NotFoundError.code;
        this.url = url;
    }

    static isError(err: unknown): err is NotFoundError {
        if (err && err instanceof Error) {
            return err.name === NotFoundError.errorName;
        }
        return false;
    }
}
