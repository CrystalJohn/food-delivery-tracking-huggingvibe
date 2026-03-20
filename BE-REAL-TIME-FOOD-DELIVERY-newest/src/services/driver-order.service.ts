import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateDriverLocationDto } from 'src/dto/driver/update-driver-location.dto';
import { Driver } from 'src/entities/driver.entity';
import { Order } from 'src/entities/order.entity';
import { DriverStatus } from 'src/enums/driver-status.enum';
import { OrderStatus } from 'src/enums/order-status.enum';
import { TrackingGateway } from 'src/gateways/tracking.gateway';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';

@Injectable()
export class DriverOrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly driverRepository: DriverRepository,
    private readonly orderRepository: OrderRepository,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  async getMyOrders(userId: string) {
    const driver = await this.driverRepository.findByUserId(userId);

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const orders = await this.orderRepository.findByDriverId(driver.userId);
    return orders.map((order) => this.mapOrderResponse(order));
  }

  async getMyOrderDetail(userId: string, orderId: string) {
    const driver = await this.driverRepository.findByUserId(userId);

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const order = await this.orderRepository.findByIdAndDriverId(
      orderId,
      driver.userId,
    );

    if (!order) {
      throw new NotFoundException(
        'Order not found or not assigned to this driver',
      );
    }

    return this.mapOrderResponse(order);
  }

  async confirmPickUp(userId: string, orderId: string) {
    return this.dataSource.transaction(async (manager) => {
      const driver = await this.driverRepository.findByUserId(userId, manager);

      if (!driver) {
        throw new NotFoundException('Driver not found');
      }

      const order = await this.orderRepository.findByIdAndDriverIdForUpdate(
        orderId,
        driver.userId,
        manager,
      );

      if (!order) {
        throw new NotFoundException(
          'Order not found or not assigned to this driver',
        );
      }

      if (order.status !== OrderStatus.READY) {
        throw new BadRequestException('Only READY orders can be picked up');
      }

      order.status = OrderStatus.PICKED_UP;
      order.pickedUpAt = new Date();
      order.driverConfirmedDelivered = false;
      order.customerConfirmedDelivered = false;

      await this.orderRepository.save(order, manager);

      const hydratedOrder = await this.orderRepository.findById(order.id, manager);

      if (!hydratedOrder) {
        throw new NotFoundException('Order not found after pickup');
      }

      return this.mapOrderResponse(hydratedOrder);
    });
  }

  async updateCurrentLocation(
    userId: string,
    orderId: string,
    dto: UpdateDriverLocationDto,
  ) {
    const payload = await this.dataSource.transaction(async (manager) => {
      const driver = await this.driverRepository.findByUserIdForUpdate(
        userId,
        manager,
      );

      if (!driver) {
        throw new NotFoundException('Driver not found');
      }

      if (!driver.user) {
        throw new NotFoundException('Driver user not found');
      }

      if (!driver.user.isActive) {
        throw new BadRequestException('Driver account is inactive');
      }

      if (driver.status !== DriverStatus.ACTIVE) {
        throw new BadRequestException('Driver is suspended');
      }

      if (!driver.isOnline) {
        throw new BadRequestException(
          'Driver must be online to update current location',
        );
      }

      const order = await this.orderRepository.findByIdAndDriverIdForUpdate(
        orderId,
        driver.userId,
        manager,
      );

      if (!order) {
        throw new NotFoundException(
          'Order not found or not assigned to this driver',
        );
      }

      if (order.status !== OrderStatus.PICKED_UP) {
        throw new BadRequestException(
          'Driver location can only be updated when order is PICKED_UP',
        );
      }

      driver.currentLat = dto.currentLat;
      driver.currentLng = dto.currentLng;
      driver.lastLocationAt = new Date();

      const updatedDriver = await this.driverRepository.save(driver, manager);

      return this.mapDriverLocationResponse(order, updatedDriver);
    });

    this.trackingGateway.emitOrderLocationUpdated(orderId, payload);

    return payload;
  }

  async confirmDelivered(userId: string, orderId: string) {
    return this.dataSource.transaction(async (manager) => {
      const driver = await this.driverRepository.findByUserId(userId, manager);

      if (!driver) {
        throw new NotFoundException('Driver not found');
      }

      const order = await this.orderRepository.findByIdAndDriverIdForUpdate(
        orderId,
        driver.userId,
        manager,
      );

      if (!order) {
        throw new NotFoundException(
          'Order not found or not assigned to this driver',
        );
      }

      if (order.status !== OrderStatus.PICKED_UP) {
        throw new BadRequestException(
          'Only PICKED_UP orders can be confirmed as delivered',
        );
      }

      if (order.driverConfirmedDelivered) {
        const hydratedOrder = await this.orderRepository.findById(order.id, manager);

        if (!hydratedOrder) {
          throw new NotFoundException('Order not found');
        }

        return this.mapOrderResponse(hydratedOrder);
      }

      order.driverConfirmedDelivered = true;

      if (order.customerConfirmedDelivered) {
        order.status = OrderStatus.DELIVERED;
        order.deliveredAt = new Date();
      }

      await this.orderRepository.save(order, manager);

      const hydratedOrder = await this.orderRepository.findById(order.id, manager);

      if (!hydratedOrder) {
        throw new NotFoundException('Order not found after delivery confirmation');
      }

      return this.mapOrderResponse(hydratedOrder);
    });
  }

  private mapDriverLocationResponse(order: Order, driver: Driver) {
    return {
      orderId: order.id,
      status: order.status,
      driverId: driver.userId,
      currentLat: driver.currentLat,
      currentLng: driver.currentLng,
      lastLocationAt: driver.lastLocationAt,
    };
  }

  private mapOrderResponse(order: Order) {
    const items = (order.items || []).map((item) => ({
      orderItemId: item.id,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.price * item.quantity,
      menuItem: {
        id: item.menuItemId,
        name: item.menuItemName,
        description: item.menuItemDescription,
        imageUrl: item.menuItemImageUrl,
        category: item.menuItemCategoryName,
      },
    }));

    return {
      id: order.id,
      customerId: order.customerId,
      customer: order.customer
        ? {
            userId: order.customer.userId,
            fullName: order.customer.user?.fullName ?? null,
            email: order.customer.user?.email ?? null,
            phone: order.customer.user?.phone ?? null,
          }
        : null,
      driverId: order.driverId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      assignedAt: order.assignedAt,
      pickedUpAt: order.pickedUpAt,
      deliveredAt: order.deliveredAt,
      driverConfirmedDelivered: order.driverConfirmedDelivered,
      customerConfirmedDelivered: order.customerConfirmedDelivered,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}