import 'reflect-metadata';
import type { ZodType } from 'zod';
import { ValidationError } from '../error';

export function ValidateBody(validationSchema: ZodType) {
    return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        if (typeof originalMethod !== 'function') {
            throw new TypeError('@ValidateBody can only be used on methods');
        }

        descriptor.value = async function (...args: unknown[]) {
            const bodyCandidates: number[] =
                Reflect.getOwnMetadata('Body', target, propertyKey) ?? [];

            if (bodyCandidates.length === 0) {
                throw new ValidationError('Missing body parameter');
            }

            const bodyIndex = bodyCandidates[0];

            const result = await validationSchema.safeParseAsync(args[bodyIndex]);

            if (!result.success) {
                throw new ValidationError('Request validation failed', result.error.issues);
            }

            // Important:
            // Use Zod's parsed/transformed value.
            args[bodyIndex] = result.data;

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
