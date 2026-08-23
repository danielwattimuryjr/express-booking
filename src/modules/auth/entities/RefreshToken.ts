import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
} from 'typeorm';
import { User } from '../../users/entities/User';

@Entity({
    schema: 'auth',
    name: 'refresh_tokens',
})
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.refreshTokens, {
        onDelete: 'CASCADE',
    })
    user: Relation<User>;

    @Column({
        type: 'uuid',
        unique: true,
    })
    jti: string;

    @Column({ type: 'varchar', name: 'token_hash' })
    tokenHash: string;

    @Column({ type: 'timestamp without time zone', name: 'expires_at' })
    expiresAt: Date;

    @Column({
        type: 'timestamp without time zone',
        name: 'revoked_at',
        nullable: true,
        default: null,
    })
    revokedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
