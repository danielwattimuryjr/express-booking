import type { RequestHandler } from 'express';
import { NotFoundError } from '../error';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
    next(new NotFoundError('URL not found', req.originalUrl));
};
