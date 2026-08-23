import { FindOneOptions } from 'typeorm';
import { Hotel } from '../entities/Hotel';
import { HotelRepositoryClass } from './HotelRepository';

export class HotelQueryBuilder {
    private options: FindOneOptions<Hotel> = {};

    constructor(private readonly repository: HotelRepositoryClass) {}

    whereSlug(slug: string) {
        this.options.where = { slug };
        return this;
    }

    withAddress() {
        this.options.relations = {
            ...this.options.relations,
            address: true,
        };

        return this;
    }

    async get() {
        return this.repository.findOne(this.options);
    }
}
