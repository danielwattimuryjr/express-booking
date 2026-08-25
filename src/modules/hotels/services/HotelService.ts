import { In } from 'typeorm';
import { NotFoundError } from '../../../common/errors';
import { GetAllHotelQuery, PatchHotelRequest, PostHotelRequest } from '../../../common/types/hotel';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../../common/utils/constants';
import { genSlug } from '../../../common/utils/slug';
import { AppDataSource } from '../../../config/database';
import { Amenity } from '../entities/Amenity';
import { Hotel } from '../entities/Hotel';
import { HotelAddress } from '../entities/HotelAddress';
import { HotelRepository } from '../repositories/HotelRepository';
import { AmenityEnum } from '../../../common/enum';

export class HotelService {
    private static validateAmenities(amenities: Amenity[], requestedNames: AmenityEnum[]) {
        if (amenities.length !== new Set(requestedNames).size) {
            throw new NotFoundError('One or more amenities were not found');
        }
    }

    private static updateHotelFields(hotel: Hotel, data: Partial<PostHotelRequest>) {
        const { name, ...hotelData } = data;

        Object.assign(hotel, hotelData);

        if (name !== undefined) {
            hotel.name = name;
            hotel.slug = genSlug(name);
        }
    }

    private static updateAddress(
        addressEntity: HotelAddress,
        address: NonNullable<PatchHotelRequest['address']>,
    ) {
        const { location, ...addressData } = address;

        Object.assign(addressEntity, addressData);

        if (location) {
            addressEntity.location = {
                type: 'Point',
                coordinates: [location.longitude, location.latitude],
            };
        }
    }

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

    private static toAmenitiesResponse(amenities: Amenity[]) {
        return amenities.map((amenity) => ({
            name: amenity.name,
            description: amenity.description,
            isActive: amenity.description,
        }));
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
        const hotel = await HotelRepository.findBySlugWithDetails(slug);

        if (!hotel) {
            throw new NotFoundError('Hotel not found');
        }

        return {
            ...this.toHotelResponse(hotel),
            address: this.toHotelAddressResponse(hotel.address),
            amenities: this.toAmenitiesResponse(hotel.amenities),
        };
    }

    public static async createHotel({ address, amenityNames, ...hotel }: PostHotelRequest) {
        return AppDataSource.transaction(async (manager) => {
            const hotelRepository = manager.getRepository(Hotel);
            const amenityRepository = manager.getRepository(Amenity);

            const amenities = await amenityRepository.find({
                where: {
                    name: In(amenityNames),
                    isActive: true,
                },
            });

            this.validateAmenities(amenities, amenityNames);

            const newHotel = hotelRepository.create({
                ...hotel,
                slug: genSlug(hotel.name),
                isActive: true,
                address: {
                    ...address,
                    location: {
                        type: 'Point',
                        coordinates: [address.location.longitude, address.location.latitude],
                    },
                },

                amenities,
            });

            await hotelRepository.save(newHotel);

            return this.toHotelResponse(newHotel);
        });
    }

    public static async updateHotel(
        { address, amenityNames, ...hotel }: PatchHotelRequest,
        hotelSlug: string,
    ) {
        return AppDataSource.transaction(async (manager) => {
            const hotelRepository = manager.getRepository(Hotel);
            const amenityRepository = manager.getRepository(Amenity);

            const existingHotel = await hotelRepository.findOne({
                where: {
                    slug: hotelSlug,
                },
                relations: {
                    address: true,
                },
            });

            if (!existingHotel) {
                throw new NotFoundError('Hotel not found');
            }

            this.updateHotelFields(existingHotel, hotel);

            if (address) {
                this.updateAddress(existingHotel.address, address);
            }

            if (amenityNames !== undefined) {
                const amenities = await amenityRepository.find({
                    where: {
                        name: In(amenityNames),
                        isActive: true,
                    },
                });

                this.validateAmenities(amenities, amenityNames);

                existingHotel.amenities = amenities;
            }

            await hotelRepository.save(existingHotel);

            return this.toHotelResponse(existingHotel);
        });
    }

    public static async deleteHotel(slug: string) {
        const hotel = await HotelRepository.findBySlug(slug);
        if (!hotel) {
            throw new NotFoundError('Hotel not found');
        }

        await HotelRepository.remove(slug);
    }
}
