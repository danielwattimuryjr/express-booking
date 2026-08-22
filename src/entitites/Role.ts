import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    type Relation,
} from 'typeorm';
import { User } from './User';
import { Permission } from './Permission';

@Entity({
    schema: 'auth',
    name: 'roles',
})
export class Role {
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

    @ManyToMany(() => User, (user) => user.roles, {
        onDelete: 'CASCADE',
    })
    users: Relation<User[]>;

    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable({
        name: 'role_permissions',
        schema: 'auth',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id',
        },
    })
    permissions: Permission[];
}
