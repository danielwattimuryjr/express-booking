import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Path,
    Post,
    Query,
    Route,
    Security,
    Tags,
} from 'tsoa';
import {
    DeleteHotelResponse,
    GetAllHotelResponse,
    GetOneHotelResponse,
    PatchHotelRequest,
    PatchHotelResponse,
    PostHotelRequest,
    PostHotelResponse,
} from '../../../common/types/hotel';
import { Authorize } from '../../../common/decorators/authorize';
import { PermissionEnum } from '../../../common/enum';
import { HotelService } from '../services/HotelService';
import { StatusCodes } from 'http-status-codes';

@Route('hotels')
@Security('bearerAuth')
@Tags('Hotel Management')
export class HotelController extends Controller {
    @Get('')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.HOTEL_READ],
    })
    public async getAllHotels(
        @Query() page: number = 1,
        @Query() limit: number = 20,
        @Query() name?: string,
    ): Promise<GetAllHotelResponse> {
        const { data, pagination } = await HotelService.listAllHotels({
            limit,
            page,
            name,
        });

        return {
            code: StatusCodes.OK,
            message: 'Hotels fetched successfully',
            data,
            pagination,
        };
    }

    @Get('{hotelSlug}')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.HOTEL_READ],
    })
    public async getOneHotel(@Path() hotelSlug: string): Promise<GetOneHotelResponse> {
        const data = await HotelService.getOneHotel(hotelSlug);

        return {
            code: StatusCodes.OK,
            message: 'Hotels fetched successfully',
            data,
        };
    }

    @Post('')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.HOTEL_CREATE],
    })
    public async postHotel(@Body() body: PostHotelRequest): Promise<PostHotelResponse> {
        const data = await HotelService.createHotel(body);

        this.setStatus(StatusCodes.CREATED);
        return {
            code: StatusCodes.CREATED,
            message: 'Hotel created successfully',
            data,
        };
    }

    @Patch('{hotelSlug}')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.HOTEL_UPDATE],
    })
    public async patchHotel(
        @Path() hotelSlug: string,
        @Body() body: PatchHotelRequest,
    ): Promise<PatchHotelResponse> {
        const data = await HotelService.updateHotel(body, hotelSlug);

        return {
            code: StatusCodes.OK,
            message: 'Hotel updated successfully',
            data,
        };
    }

    @Delete('{hotelSlug}')
    @Authorize({
        type: 'permission',
        values: [PermissionEnum.HOTEL_DELETE],
    })
    public async deleteHotel(@Path() hotelSlug: string): Promise<DeleteHotelResponse> {
        await HotelService.deleteHotel(hotelSlug);

        return {
            code: StatusCodes.OK,
            message: 'Hotel deleted successfully',
        };
    }
}
