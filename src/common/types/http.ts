import type { StatusCodes } from 'http-status-codes';

export type AuthenticatedUser = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    roles: {
        name: string;
        permissions: {
            name: string;
        }[];
    }[];
};

type PaginationMetadata = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type HttpResponse<TData> = TData extends undefined
    ? {
          message: string;
          code: StatusCodes;
      }
    : {
          message: string;
          code: StatusCodes;
          data: TData;
      };

export type HttpPaginateResponse<TData> = HttpResponse<TData> & {
    pagination: PaginationMetadata;
};
