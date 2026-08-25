import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AmenityEnum } from '../../../common/enum/AmenityEnum';

@Entity({
    schema: 'public',
    name: 'amenities',
})
export class Amenity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
    })
    name!: AmenityEnum;

    @Column({
        type: 'text',
        nullable: true,
    })
    description!: string | null;

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive!: boolean;

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
