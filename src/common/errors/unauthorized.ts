import { StatusCodes } from 'http-status-codes';

export class UnauthorizedError extends Error {
    static readonly errorName = 'HttpUnauthorizedError';
    static readonly code = StatusCodes.UNAUTHORIZED;

    name = UnauthorizedError.errorName;
    code: StatusCodes;

    constructor(message?: string) {
        super(message ?? 'Unauthorized');
        this.code = UnauthorizedError.code;
    }

    static isError(err: unknown): err is UnauthorizedError {
        if (err && err instanceof Error) {
            return err.name === UnauthorizedError.errorName;
        }
        return false;
    }
}
