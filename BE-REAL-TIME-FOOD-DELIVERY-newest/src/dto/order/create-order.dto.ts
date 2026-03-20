import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import { DeliveryAddressMode } from 'src/enums/delivery-address-mode.enum';

export class CreateOrderDto {
  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    enum: DeliveryAddressMode,
    example: DeliveryAddressMode.DEFAULT,
    description: 'Delivery address source. Defaults to DEFAULT when omitted.',
  })
  @IsOptional()
  @IsEnum(DeliveryAddressMode)
  deliveryAddressMode?: DeliveryAddressMode;

  @ApiPropertyOptional({
    example: '123 Nguyen Hue, District 1, Ho Chi Minh City',
    description: 'Required when deliveryAddressMode is CUSTOM.',
  })
  @ValidateIf(
    (object: CreateOrderDto) =>
      (object.deliveryAddressMode ?? DeliveryAddressMode.DEFAULT) ===
      DeliveryAddressMode.CUSTOM,
  )
  @IsString()
  @IsNotEmpty()
  deliveryAddressText?: string;

  @ApiPropertyOptional({
    example: 10.776889,
    description: 'Required when deliveryAddressMode is CUSTOM.',
  })
  @ValidateIf(
    (object: CreateOrderDto) =>
      (object.deliveryAddressMode ?? DeliveryAddressMode.DEFAULT) ===
      DeliveryAddressMode.CUSTOM,
  )
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  deliveryLat?: number;

  @ApiPropertyOptional({
    example: 106.700806,
    description: 'Required when deliveryAddressMode is CUSTOM.',
  })
  @ValidateIf(
    (object: CreateOrderDto) =>
      (object.deliveryAddressMode ?? DeliveryAddressMode.DEFAULT) ===
      DeliveryAddressMode.CUSTOM,
  )
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  deliveryLng?: number;
}
