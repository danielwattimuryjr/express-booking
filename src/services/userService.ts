import { NotFoundError } from '../common/error';
import { UserRepository } from '../repositories';
import bcrypt from 'bcrypt';
import { RoleEnum } from '../common/enum';
import { UserRequest } from '../dto';

export class UserService {
    static async getOne(userId: number) {
        const user = await UserRepository.findById(userId);

        if (!user) throw new NotFoundError('User not found');

        return user;
    }

    static async createUser(request: UserRequest) {
        const hashedPassword = await bcrypt.hash(request.password, 12);

        const userInstance = UserRepository.create({
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            password: hashedPassword,
            username: request.username,
            roles: [
                {
                    name: RoleEnum.USER,
                },
            ],
        });

        const user = await UserRepository.save(userInstance);

        return user;
    }
}
