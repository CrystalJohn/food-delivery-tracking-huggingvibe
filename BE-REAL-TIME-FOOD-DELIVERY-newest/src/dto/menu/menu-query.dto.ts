import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MenuQueryDto {
  @ApiPropertyOptional({
    example: 'Pizza',
    description: 'Filter menu items by category name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}