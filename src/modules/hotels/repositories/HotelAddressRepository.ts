import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { HotelAddress } from '../entities/HotelAddress';

class HotelAddressRepositoryClass extends Repository<HotelAddress> {
    constructor() {
        super(HotelAddress, AppDataSource.manager);
    }
}

export const HotelAddressRepository = new HotelAddressRepositoryClass();
