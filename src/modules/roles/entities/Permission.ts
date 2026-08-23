import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './Role';

@Entity({
    schema: 'auth',
    name: 'permissions',
})
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 25,
        unique: true,
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    description: string | null;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}
