import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { DriverStatus } from 'src/enums/driver-status.enum';

export class CreateDriverDto {
  @ApiProperty({ example: 'driver1@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Nguyen Van Driver' })
  @IsString()
  @Length(1, 120)
  fullName: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiPropertyOptional({ example: '0908888888' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Motorbike' })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({ example: '59A1-12345' })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'Driver online status',
  })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: DriverStatus,
    example: DriverStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}