import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { Hotel } from './Hotel';

@Entity({
    schema: 'public',
    name: 'hotel_addresses',
})
export class HotelAddress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'hotel_id', type: 'uuid' })
    hotelId!: string;

    @OneToOne(() => Hotel, (hotel) => hotel.address)
    @JoinColumn({ name: 'hotel_id' })
    hotel!: Relation<Hotel>;

    @Column({ name: 'address_line_1', type: 'varchar', length: 255 })
    addressLine1!: string;

    @Column({ name: 'address_line_2', type: 'varchar', length: 255, nullable: true })
    addressLine2!: string | null;

    @Column({ type: 'varchar', length: 100 })
    city!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    state!: string | null;

    @Column({ type: 'varchar', length: 100 })
    country!: string;

    @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
    postalCode!: string | null;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    location!: {
        type: 'Point';
        coordinates: [number, number];
    };

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        name: 'created_at',
    })
    public createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
        name: 'updated_at',
    })
    public updatedAt: Date;
}
