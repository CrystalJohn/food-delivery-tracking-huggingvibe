import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateOrderDto } from 'src/dto/order/create-order.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { OrderService } from 'src/services/order.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Customer checkout active cart and create order' })
  @Post()
  async createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(user.id, dto);
  }

  @ApiOperation({ summary: 'Customer get my orders' })
  @Get()
  async getMyOrders(@CurrentUser() user: any) {
    return this.orderService.getMyOrders(user.id);
  }

  @ApiOperation({ summary: 'Customer get tracking of my order' })
  @Get(':id/tracking')
  async getMyOrderTracking(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    return this.orderService.getMyOrderTracking(user.id, orderId);
  }

  @ApiOperation({ summary: 'Customer get my order detail' })
  @Get(':id')
  async getMyOrderDetail(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    return this.orderService.getMyOrderDetail(user.id, orderId);
  }

  @ApiOperation({ summary: 'Customer cancel my order' })
  @Patch(':id/cancel')
  async cancelMyOrder(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    return this.orderService.cancelMyOrder(user.id, orderId);
  }

  @ApiOperation({ summary: 'Customer confirm delivered' })
  @Patch(':id/confirm-delivered')
  async confirmDelivered(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    return this.orderService.confirmDelivered(user.id, orderId);
  }
}