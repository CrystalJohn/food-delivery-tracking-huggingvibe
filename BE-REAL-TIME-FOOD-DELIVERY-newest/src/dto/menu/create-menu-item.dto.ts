import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuItemImageDto {
  @ApiProperty({ example: 'https://cdn.example.com/menu/pizza-1.jpg' })
  @IsString()
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({ example: 'Pizza Hải Sản Cỡ Lớn' })
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiPropertyOptional({ example: 'Pizza hải sản với phô mai mozzarella' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 199000,
    description: 'Giá theo VND, dùng integer để dễ xử lý',
  })
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @ApiPropertyOptional({
    type: [CreateMenuItemImageDto],
    example: [
      {
        imageUrl: 'https://cdn.example.com/menu/pizza-1.jpg',
        isThumbnail: true,
        sortOrder: 0,
      },
      {
        imageUrl: 'https://cdn.example.com/menu/pizza-2.jpg',
        isThumbnail: false,
        sortOrder: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMenuItemImageDto)
  images?: CreateMenuItemImageDto[];
}