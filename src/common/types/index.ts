import { StatusCodes } from 'http-status-codes';

export interface PaginationQuery {
    page?: number;
    limit?: number;
}

export type UserResponse = {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string;
    username: string;
};

type PaginationMetadata = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type HttpResponse<TData = undefined> = TData extends undefined
    ? {
          message: string;
          code: StatusCodes;
      }
    : {
          message: string;
          code: StatusCodes;
          data: TData;
      };

export interface HttpPaginateResponse<TData> {
    message: string;
    code: StatusCodes;
    data: TData[];
    pagination: PaginationMetadata;
}

export type AuthenticatedUserRequest = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    roles: string[];
    permissions: string[];
};

export * from './user';
export * from './me';
export * from './role';
export * from './auth';
export * from './rolePermission';
