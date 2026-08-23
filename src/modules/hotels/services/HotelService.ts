import { NotFoundError } from '../../../common/errors';
import { GetAllHotelQuery, PatchHotelRequest, PostHotelRequest } from '../../../common/types/hotel';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../../common/utils/constants';
import { AppDataSource } from '../../../config/database';
import { Hotel } from '../entities/Hotel';
import { HotelAddress } from '../entities/HotelAddress';
import { HotelRepository } from '../repositories/HotelRepository';
import slugify from 'slugify';

export class HotelService {
    private static toHotelResponse(hotel: Hotel) {
        return {
            id: hotel.id,
            name: hotel.name,
            slug: hotel.slug,
            description: hotel.description,
            email: hotel.email,
            phone: hotel.phone,
            starRating: hotel.starRating,
            isActive: hotel.isActive,
        };
    }

    private static toHotelAddressResponse(address: HotelAddress) {
        return {
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            country: address.country,
            postalCode: address.postalCode,
            state: address.state,
            location: {
                latitude: address.location.coordinates[1],
                longitude: address.location.coordinates[0],
            },
        };
    }

    public static async listAllHotels({
        limit = DEFAULT_LIMIT,
        page = DEFAULT_PAGE,
        name,
    }: GetAllHotelQuery) {
        const normalizedPage = Math.max(1, page);
        const normalizedLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

        const [hotels, total] = await HotelRepository.findPaginated(
            normalizedPage,
            normalizedLimit,
            name,
        );
        const totalPages = Math.ceil(total / normalizedLimit);

        return {
            data: hotels,
            pagination: {
                page: normalizedPage,
                limit: normalizedLimit,
                total,
                totalPages,
            },
        };
    }

    public static async getOneHotel(slug: string) {
        const hotel = await HotelRepository.queryOne().whereSlug(slug).withAddress().get();
        if (!hotel) throw new NotFoundError('Hotel not found');

        return {
            address: this.toHotelAddressResponse(hotel.address),
            ...this.toHotelResponse(hotel),
        };
    }

    public static async createHotel(body: PostHotelRequest) {
        return AppDataSource.transaction(async (manager) => {
            const HotelRepository = manager.getRepository(Hotel);
            const AddressRepository = manager.getRepository(HotelAddress);

            const hotelSlug = slugify(body.name);
            const hotel = HotelRepository.create({
                name: body.name,
                slug: hotelSlug,
                description: body.description,
                email: body.email,
                phone: body.phone,
                starRating: body.starRating,
                isActive: true,
                address: AddressRepository.create({
                    addressLine1: body.address.addressLine1,
                    addressLine2: body.address.addressLine2,
                    city: body.address.city,
                    country: body.address.country,
                    postalCode: body.address.postalCode,
                    state: body.address.state,
                    location: {
                        type: 'Point',
                        coordinates: [
                            body.address.location.longitude,
                            body.address.location.latitude,
                        ],
                    },
                }),
            });

            await HotelRepository.save(hotel);

            return this.toHotelResponse(hotel);
        });
    }

    public static async updateHotel(body: PatchHotelRequest, hotelSlug: string) {
        return AppDataSource.transaction(async (manager) => {
            const hotelRepository = manager.getRepository(Hotel);
            const addressRepository = manager.getRepository(HotelAddress);

            const hotel = await hotelRepository.findOne({
                where: { slug: hotelSlug },
                relations: {
                    address: true,
                },
            });

            if (!hotel) {
                throw new NotFoundError('Hotel not found');
            }

            const { address, name, ...hotelData } = body;

            hotelRepository.merge(hotel, hotelData);

            if (name !== undefined) {
                hotel.name = name;
                hotel.slug = slugify(name);
            }

            if (address) {
                const { location, ...addressData } = address;

                addressRepository.merge(hotel.address, addressData);

                if (location) {
                    hotel.address.location = {
                        type: 'Point',
                        coordinates: [location.longitude, location.latitude],
                    };
                }

                await addressRepository.save(hotel.address);
            }

            await hotelRepository.save(hotel);

            return this.toHotelResponse(hotel);
        });
    }

    public static async deleteHotel(slug: string) {
        const hotel = await HotelRepository.findOne({
            where: { slug },
        });

        if (!hotel) {
            throw new NotFoundError('Hotel not found');
        }

        await HotelRepository.remove(hotel);
    }
}
