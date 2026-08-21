import { ClassConstructor, plainToInstance } from 'class-transformer';

export function serialize<T, V>(cls: ClassConstructor<V>, data: T): V {
    return plainToInstance(cls, data, {
        excludeExtraneousValues: true,
    });
}

export * from './userSerializer';
export * from './authSerializer';
