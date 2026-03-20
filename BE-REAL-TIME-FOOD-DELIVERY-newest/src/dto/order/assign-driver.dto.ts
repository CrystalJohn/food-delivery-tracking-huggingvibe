import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignDriverDto {
  @ApiProperty({
    example: '12',
    description: 'Driver userId',
  })
  @IsString()
  @IsNotEmpty()
  driverId: string;
}