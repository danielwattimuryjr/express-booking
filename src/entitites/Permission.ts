import { Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { Role } from './Role';
import { PermissionEnum } from '../common/enum/PermissionEnum';

@Entity({
    schema: 'auth',
    name: 'permissions',
})
export class Permission {
    @PrimaryColumn('varchar')
    name: PermissionEnum;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}
