import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMenuAvailabilityDto {
  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  isAvailable: boolean;
}