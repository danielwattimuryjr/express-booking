import type { StatusCodes } from 'http-status-codes';

export type AuthenticatedUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    roles: string[];
    permissions: string[];
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
    data: TData;
    pagination: PaginationMetadata;
}
