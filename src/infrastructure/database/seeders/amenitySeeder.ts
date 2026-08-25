import { AmenityEnum } from '../../../common/enum';
import { Amenity } from '../../../modules/hotels/entities/Amenity';
import { AppDataSource } from '../data-source';

const amenities = [
    {
        name: AmenityEnum.WIFI,
        description: 'This hotel have WiFi',
        isActive: true,
    },
    {
        name: AmenityEnum.POOL,
        description: 'This hotel have Swimming Pool',
        isActive: true,
    },
    {
        name: AmenityEnum.GYM,
        description: 'This hotel have Gym',
        isActive: true,
    },
];

export async function seedAmenities() {
    await AppDataSource.transaction(async (manager) => {
        const amenityRepository = manager.getRepository(Amenity);

        await Promise.all(
            amenities.map(async (amenity) => {
                await amenityRepository.save({
                    name: amenity.name,
                    description: amenity.description,
                });
            }),
        );
    });
}
