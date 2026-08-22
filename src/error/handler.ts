import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidateError as TsoaValidateError } from 'tsoa';
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '.';
import { logger } from '../config/logger';
import { HttpResponse } from '../dto';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    const response: HttpResponse<unknown> = {
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message,
        data: undefined,
    };

    if (ValidationError.isError(err)) {
        response.code = err.code;
        response.data = err.data;
        logger.warn('Validation error', { error: err, path: req.path });
    } else if (err instanceof TsoaValidateError) {
        response.code = StatusCodes.UNPROCESSABLE_ENTITY;
        response.message = 'Request validation failed';
        response.data = Object.entries(err.fields).map(([field, entry]) => ({
            field,
            message: entry?.message ?? 'Invalid value',
        }));
        logger.warn('Request validation failed', { error: err, path: req.path });
    } else if (NotFoundError.isError(err)) {
        response.code = err.code;
        response.data = err.url;
        logger.warn('Not found', { error: err, path: req.path });
    } else if (UnauthorizedError.isError(err)) {
        response.code = err.code;
        logger.warn('Unauthorized', { error: err, path: req.path });
    } else if (ForbiddenError.isError(err)) {
        response.code = err.code;
        logger.warn('Forbidden', { error: err, path: req.path });
    } else {
        response.message = 'Unknown error';
        logger.error('Unhandled error', { error: err, path: req.path });
    }

    if (!response.data) {
        delete response.data;
    }

    if (res.headersSent) {
        return next(err);
    }

    res.status(response.code).json(response);
}
