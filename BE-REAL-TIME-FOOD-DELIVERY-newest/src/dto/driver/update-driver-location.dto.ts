import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateDriverLocationDto {
  @ApiProperty({
    example: 10.7769,
    description: 'Current driver latitude',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  currentLat: number;

  @ApiProperty({
    example: 106.7009,
    description: 'Current driver longitude',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  currentLng: number;
}