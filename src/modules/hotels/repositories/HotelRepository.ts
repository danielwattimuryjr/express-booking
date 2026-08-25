import { Hotel } from '../entities/Hotel';
import { AppDataSource } from '../../../config/database';

export class HotelRepository {
    public static async findPaginated(page: number, limit: number, name?: string) {
        const query = AppDataSource.getRepository(Hotel)
            .createQueryBuilder('hotel')
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

    public static async findBySlug(slug: string) {
        return AppDataSource.getRepository(Hotel).findOne({
            where: {
                slug,
            },
        });
    }

    public static async findBySlugWithDetails(slug: string) {
        return AppDataSource.getRepository(Hotel).findOne({
            where: {
                slug,
            },
            relations: {
                address: true,
                amenities: true,
            },
        });
    }

    public static async remove(slug: string) {
        await AppDataSource.getRepository(Hotel).delete({ slug });
    }
}
