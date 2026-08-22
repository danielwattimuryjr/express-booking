import { Repository, ObjectLiteral, DeepPartial } from 'typeorm';

interface SeedEnumOptions<T extends ObjectLiteral> {
    repository: Repository<T>;
    values: Record<string, string>;
    map: (value: string) => DeepPartial<T>;
}

export async function seedEnum<T extends ObjectLiteral>({
    repository,
    values,
    map,
}: SeedEnumOptions<T>) {
    const records = Object.values(values).map(map);

    await repository.deleteAll();
    // @ts-expect-error - upsert() typing from TypeORM doesn't infer conflict columns for generic repository
    await repository.upsert(records, ['name']);
}
