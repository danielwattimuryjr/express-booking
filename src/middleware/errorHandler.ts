import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidateError as TsoaValidateError } from 'tsoa';
import type { HttpResponse } from '../common/types/http';
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../common/error';
import { logger } from '../config/logger';

export function errorHandler(err: Error, _req: Request, res: Response, next: NextFunction): void {
    const response: HttpResponse<unknown> = {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message,
        data: undefined,
    };

    if (ValidationError.isError(err)) {
        response.code = err.code;
        response.data = err.data;
    } else if (err instanceof TsoaValidateError) {
        response.code = StatusCodes.UNPROCESSABLE_ENTITY;
        response.message = 'Request validation failed';
        response.data = Object.entries(err.fields).map(([field, entry]) => ({
            field,
            message: entry?.message ?? 'Invalid value',
        }));
    } else if (NotFoundError.isError(err)) {
        response.code = err.code;
        response.data = err.url;
    } else if (UnauthorizedError.isError(err)) {
        response.code = err.code;
    } else if (ForbiddenError.isError(err)) {
        response.code = err.code;
    } else {
        response.message = 'Unknown error';
        logger.error(err.message, {
            stack: err.stack,
        });
    }

    if (!response.data) {
        delete response.data;
    }

    if (res.headersSent) {
        return next(err);
    }

    res.status(response.code).json(response);
}
