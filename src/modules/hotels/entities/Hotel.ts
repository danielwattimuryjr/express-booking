import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';
import { HotelAddress } from './HotelAddress';

@Entity({
    schema: 'public',
    name: 'hotels',
})
export class Hotel {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 150,
    })
    name!: string;

    @Column({
        type: 'varchar',
        length: 180,
        unique: true,
    })
    slug!: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description!: string | null;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    email!: string | null;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: true,
    })
    phone!: string | null;

    @Column({
        name: 'star_rating',
        type: 'smallint',
        nullable: true,
        default: 0,
    })
    starRating!: number | null;

    @Column({
        type: 'boolean',
        name: 'is_active',
        nullable: true,
        default: true,
    })
    isActive!: boolean;

    @OneToOne(() => HotelAddress, (address) => address.hotel, {
        cascade: true,
    })
    address!: Relation<HotelAddress>;

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
