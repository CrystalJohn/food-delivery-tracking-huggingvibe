import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'staff1@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Nguyen Van Staff' })
  @IsString()
  @Length(1, 120)
  fullName: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}