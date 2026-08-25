import z from 'zod';
import { HttpPaginateResponse, HttpResponse, PaginationQuery } from '.';
import { createHotelSchema, updateHotelSchema } from '../../modules/hotels/schemas/HotelSchema';

type HotelResponse = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    starRating: number | null;
    isActive: boolean;
};

type AddressResponse = {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    country: string;
    postalCode: string | null;
    state: string | null;
    location: {
        latitude: number;
        longitude: number;
    };
};

type AmenityResponse = {
    name: string;
    description: string | null;
    isActive: boolean;
};

type SearchHotelQuery = {
    name?: string;
};

export type GetAllHotelResponse = HttpPaginateResponse<HotelResponse>;
export type GetAllHotelQuery = PaginationQuery & SearchHotelQuery;

export type GetOneHotelResponse = HttpResponse<
    HotelResponse & { address: AddressResponse; amenities: AmenityResponse[] }
>;

export type PostHotelRequest = z.infer<typeof createHotelSchema>;
export type PostHotelResponse = HttpResponse<HotelResponse>;

export type PatchHotelRequest = z.infer<typeof updateHotelSchema>;
export type PatchHotelResponse = HttpResponse<HotelResponse>;

export type DeleteHotelResponse = HttpResponse<undefined>;
