import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AddToCartDto } from 'src/dto/cart/add-to-cart.dto';
import { UpdateCartItemDto } from 'src/dto/cart/update-cart-item.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CartService } from 'src/services/cart.service';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Customer add item to cart' })
  @Post('items')
  async addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.id, dto);
  }

  @ApiOperation({ summary: 'Customer get current cart' })
  @Get()
  async getMyCart(@CurrentUser() user: any) {
    return this.cartService.getMyCart(user.id);
  }

  @ApiOperation({ summary: 'Customer update cart item quantity' })
  @Patch('items/:cartItemId')
  async updateCartItem(
    @CurrentUser() user: any,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(user.id, cartItemId, dto);
  }

  @ApiOperation({ summary: 'Customer remove item from cart' })
  @Delete('items/:cartItemId')
  async removeCartItem(
    @CurrentUser() user: any,
    @Param('cartItemId') cartItemId: string,
  ) {
    return this.cartService.removeCartItem(user.id, cartItemId);
  }
}