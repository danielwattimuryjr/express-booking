import type { RequestHandler } from 'express';
import { NotFoundError } from '../error';

// @ts-ignore
export const notFoundHandler: RequestHandler = (req, res, next) => {
    next(new NotFoundError('URL not found', req.originalUrl));
};
