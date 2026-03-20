import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { StaffOrderQueryDto } from 'src/dto/order/staff-order-query.dto';
import { AssignDriverDto } from 'src/dto/order/assign-driver.dto';
import { UpdateOrderStatusDto } from 'src/dto/order/update-order-status.dto';
import { UserRole } from 'src/enums/user-role.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { StaffOrderService } from 'src/services/staff-order.service';

@ApiTags('Staff Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STAFF)
@Controller('staff/orders')
export class StaffOrderController {
  constructor(private readonly staffOrderService: StaffOrderService) {}

  @ApiOperation({ summary: 'Get available online drivers for staff assignment' })
  @Get('available-drivers')
  async getAvailableDrivers() {
    return this.staffOrderService.getAvailableDrivers();
  }

  @ApiOperation({ summary: 'Get all orders for staff' })
  @Get()
  async getAllOrders(@Query() query: StaffOrderQueryDto) {
    return this.staffOrderService.getAllOrders(query);
  }

  @ApiOperation({ summary: 'Get tracking of an order for staff' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @Get(':orderId/tracking')
  async getOrderTracking(@Param('orderId') orderId: string) {
    return this.staffOrderService.getOrderTracking(orderId);
  }

  @ApiOperation({ summary: 'Get order detail for staff' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @Get(':orderId')
  async getOrderDetail(@Param('orderId') orderId: string) {
    return this.staffOrderService.getOrderDetail(orderId);
  }

  @ApiOperation({ summary: 'Update order status by staff until READY' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.staffOrderService.updateOrderStatus(orderId, dto.status);
  }

  @ApiOperation({ summary: 'Assign driver to READY order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @Patch(':orderId/assign-driver')
  async assignDriver(
    @Param('orderId') orderId: string,
    @Body() dto: AssignDriverDto,
  ) {
    return this.staffOrderService.assignDriver(orderId, dto.driverId);
  }

  @ApiOperation({ summary: 'Cancel order by staff' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @Patch(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.staffOrderService.cancelOrder(orderId);
  }
}