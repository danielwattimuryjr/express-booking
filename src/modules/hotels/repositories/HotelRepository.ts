import { Repository } from 'typeorm';
import { Hotel } from '../entities/Hotel';
import { AppDataSource } from '../../../config/database';
import { HotelQueryBuilder } from './HotelQueryBuilder';

export class HotelRepositoryClass extends Repository<Hotel> {
    constructor() {
        super(Hotel, AppDataSource.manager);
    }

    public async findPaginated(page: number, limit: number, name?: string) {
        const query = this.createQueryBuilder('hotel')
            .select([
                'hotel.id',
                'hotel.name',
                'hotel.slug',
                'hotel.description',
                'hotel.email',
                'hotel.phone',
                'hotel.starRating',
                'hotel.isActive',
            ])
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('hotel.id', 'ASC');

        if (name)
            query.andWhere(`hotel.name ILIKE :name`, {
                name: `%${name}%`,
            });

        return query.getManyAndCount();
    }

    public queryOne() {
        return new HotelQueryBuilder(this);
    }
}

export const HotelRepository = new HotelRepositoryClass();
