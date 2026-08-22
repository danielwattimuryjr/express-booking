import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    type Relation,
} from 'typeorm';
import { Role } from './Role';
import { RefreshToken } from './RefreshToken';

@Entity({
    schema: 'auth',
    name: 'users',
})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        unique: true,
        length: 50,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 50,
        name: 'first_name',
    })
    firstName: string;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 50,
        name: 'last_name',
    })
    lastName: string | null;

    @Column({
        type: 'varchar',
        unique: true,
    })
    username: string;

    @Column({
        type: 'varchar',
        select: false,
    })
    password: string;

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable({
        name: 'user_roles',
        schema: 'auth',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
    })
    roles: Relation<Role[]>;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: Relation<RefreshToken[]>;
}
