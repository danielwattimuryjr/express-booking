import { RoleEnum } from '../../../common/enum';
import { NotFoundError } from '../../../common/errors';
import { Role } from '../../../modules/roles/entities/Role';
import { User } from '../../../modules/users/entities/User';
import { AppDataSource } from '../data-source';
import bcrypt from 'bcrypt';

export async function seedAdmin() {
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    const password = await bcrypt.hash('password123', 12);

    const adminRole = await roleRepository.findOne({
        where: { name: RoleEnum.ADMIN },
    });

    if (!adminRole) {
        throw new NotFoundError('ADMIN role not found — did you seed roles?');
    }

    const user = userRepository.create({
        firstName: 'Admin',
        email: 'admin@app.com',
        password,
        username: 'admin',
        roles: [adminRole],
    });

    await userRepository.save(user);
}
