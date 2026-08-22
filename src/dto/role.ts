import z from 'zod';
import { HttpPaginateResponse, HttpResponse, PaginationQuery } from '.';
import { roleRequestSchema } from '../schema';

export type RoleResponse = {
    id: number;
    name: string;
    description: string | null;
};

type SearchRoleQuery = {
    name?: string;
};

export type GetAllRoleQuery = PaginationQuery & SearchRoleQuery;
export type GetAllRoleResponse = HttpPaginateResponse<RoleResponse[]>;

export type GetOneRoleResponse = HttpResponse<RoleResponse>;

export type PostRoleRequest = z.infer<typeof roleRequestSchema>;
export type PostRoleResponse = HttpResponse<RoleResponse>;

export type PatchRoleRequest = z.infer<typeof roleRequestSchema>;
export type PatchRoleResponse = HttpResponse<RoleResponse>;

export type DeleteRoleResponse = HttpResponse<undefined>;
