import { AuthenticatedUserRequest } from '../../dto';

declare global {
    namespace Express {
        interface User extends AuthenticatedUserRequest {}
    }
}

export {};
