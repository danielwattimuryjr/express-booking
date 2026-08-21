import type { StatusCodes } from 'http-status-codes';

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
