import { ApiProperty } from '@nestjs/swagger';

export class MenuItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Pizza Hải Sản' })
  name: string;

  @ApiProperty({ example: 'Pizza hải sản nhiều phô mai', nullable: true })
  description: string | null;

  @ApiProperty({ example: 120000 })
  price: number;

  @ApiProperty({
    example: 'https://cdn.example.com/pizza-1.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ example: 'Pizza' })
  category: string;

  @ApiProperty({ example: true })
  available: boolean;
}