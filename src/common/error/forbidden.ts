import { StatusCodes } from 'http-status-codes';

export class ForbiddenError extends Error {
    static readonly errorName = 'ForbiddenError';
    static readonly code = StatusCodes.FORBIDDEN;

    name = ForbiddenError.errorName;
    code: StatusCodes;

    constructor(message?: string) {
        super(message ?? 'Insufficient role');
        this.code = ForbiddenError.code;
    }

    static isError(err: unknown): err is ForbiddenError {
        if (err && err instanceof Error) {
            return err.name === ForbiddenError.errorName;
        }
        return false;
    }
}
