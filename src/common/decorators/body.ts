export function Body() {
    return function (target: object, propertyKey: string | symbol, parameterIndex: number) {
        const existingMetadata = Reflect.getOwnMetadata('Body', target, propertyKey) || [];
        existingMetadata.push(parameterIndex);
        Reflect.defineMetadata('Body', existingMetadata, target, propertyKey);
    };
}
