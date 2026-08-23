import { StatusCodes } from 'http-status-codes';
import type { z } from 'zod';

export interface ValidationErrorData {
    field: string;
    message: string;
}

export class ValidationError extends Error {
    static readonly errorName = 'ValidationError';
    static readonly code = StatusCodes.UNPROCESSABLE_ENTITY;

    name = ValidationError.errorName;
    code = ValidationError.code;
    data: ValidationErrorData[];

    constructor(message = 'Validation failed', issues: z.core.$ZodIssue[] = []) {
        super(message);

        this.data = issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));

        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    static fromTsoa(fields: Record<string, { message?: string }>) {
        const issues: z.core.$ZodIssue[] = Object.entries(fields).map(([field, entry]) => ({
            code: 'custom',
            path: [field],
            message: entry?.message ?? 'Invalid value',
        }));

        return new ValidationError('Request validation failed', issues);
    }

    static isError(error: unknown): error is ValidationError {
        return error instanceof Error && error.name === ValidationError.errorName;
    }
}
