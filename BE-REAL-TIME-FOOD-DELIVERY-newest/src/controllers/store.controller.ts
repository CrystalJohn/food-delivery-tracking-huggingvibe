import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoreDistanceDto } from 'src/dto/store/store-distance.dto';
import { StoreService } from 'src/services/store.service';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({ summary: 'Compute distance between user and store' })
  @Post('distance')
  getDistance(@Body() dto: StoreDistanceDto) {
    return this.storeService.getStoreDistance(dto.lat, dto.lng);
  }
}
