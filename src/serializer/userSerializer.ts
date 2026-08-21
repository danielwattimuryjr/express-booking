import { serialize } from '.';
import { UserResponse } from '../dto';
import { User } from '../entitites';

export class UserSerializer {
    static serialize(user: User): UserResponse {
        return serialize(UserResponse, user);
    }

    static serializeMany(users: User[]): UserResponse[] {
        return users.map((user) => serialize(UserResponse, user));
    }
}
