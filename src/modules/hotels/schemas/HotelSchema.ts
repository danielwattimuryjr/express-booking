import z from 'zod';
import { AmenityEnum } from '../../../common/enum';

const locationSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

const hotelAddressSchema = z.object({
    addressLine1: z.string('Address is required').max(255),
    addressLine2: z.string().max(255).optional(),
    country: z.string('Country is required').max(100),
    city: z.string('City is required').max(100),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    location: locationSchema,
});

export const createHotelSchema = z.object({
    name: z.string('Hotel name is required').max(150),
    description: z.string().optional(),
    email: z.email().max(50).optional(),
    phone: z.string().max(30).optional(),
    starRating: z.number().min(1).max(5).optional(),

    address: hotelAddressSchema,

    amenityNames: z
        .array(z.enum(AmenityEnum))
        .min(1, 'At least one amenity is selected')
        .superRefine((values, ctx) => {
            if (new Set(values).size !== values.length) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Duplicate amenities are not allowed',
                });
            }
        }),
});

export const updateHotelSchema = z.object({
    name: z.string('Hotel name is required').max(150).optional(),
    description: z.string().optional(),
    email: z.email().max(50).optional(),
    phone: z.string().max(30).optional(),
    starRating: z.number().min(1).max(5).optional(),
    isActive: z.boolean('Hotel status is required').optional(),

    address: hotelAddressSchema.partial().optional(),

    amenityNames: z
        .array(z.enum(AmenityEnum))
        .superRefine((values, ctx) => {
            if (new Set(values).size !== values.length) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Duplicate amenities are not allowed',
                });
            }
        })
        .optional(),
});
