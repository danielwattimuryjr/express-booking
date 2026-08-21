import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn, type Relation } from 'typeorm';
import { User } from './User';
import { Permission } from './Permission';
import { RoleEnum } from '../common/enum';

@Entity({
    schema: 'auth',
    name: 'roles',
})
export class Role {
    @PrimaryColumn('varchar')
    name: RoleEnum;

    @Column({
        type: 'varchar',
        length: 100,
    })
    description: string;

    @ManyToMany(() => User, (user) => user.roles)
    users: Relation<User[]>;

    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable({
        name: 'role_permissions',
        schema: 'auth',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'name',
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'name',
        },
    })
    permissions: Permission[];
}
