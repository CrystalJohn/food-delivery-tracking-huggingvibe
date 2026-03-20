import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'customer1@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
  })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty({
    example: '0901234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '123 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',
  })
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @ApiProperty({
    example: 10.776889,
    description: 'Latitude of customer default address',
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({
    example: 106.700806,
    description: 'Longitude of customer default address',
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}