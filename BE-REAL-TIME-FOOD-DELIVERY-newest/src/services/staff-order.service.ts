import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { StaffOrderQueryDto } from 'src/dto/order/staff-order-query.dto';
import { Order } from 'src/entities/order.entity';
import { OrderStatus } from 'src/enums/order-status.enum';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import { PaymentStatus } from 'src/enums/payment-status.enum';
import { WalletTransactionType } from 'src/enums/wallet-transaction-type.enum';
import { DriverStatus } from 'src/enums/driver-status.enum';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { WalletRepository } from 'src/repositories/wallet.repository';
import { WalletTransactionRepository } from 'src/repositories/wallet-transaction.repository';
import { storeConfig } from 'src/config/store.config';

const STAFF_ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [],
  [OrderStatus.PICKED_UP]: [],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class StaffOrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly driverRepository: DriverRepository,
    private readonly walletRepository: WalletRepository,
    private readonly walletTransactionRepository: WalletTransactionRepository,
  ) {}

  async getAllOrders(query: StaffOrderQueryDto) {
    const orders = await this.orderRepository.findAll(query.status);
    return orders.map((order) => this.mapOrderResponse(order));
  }

  async getOrderTracking(orderId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapTrackingResponse(order);
  }

  async getOrderDetail(orderId: string) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapOrderResponse(order);
  }

  async updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findByIdForUpdate(
        orderId,
        manager,
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (
        nextStatus === OrderStatus.PICKED_UP ||
        nextStatus === OrderStatus.DELIVERED
      ) {
        throw new BadRequestException(
          'Staff cannot set PICKED_UP or DELIVERED',
        );
      }

      if (order.status === nextStatus) {
        const hydratedOrder = await this.getHydratedOrderOrFail(order.id, manager);
        return this.mapOrderResponse(hydratedOrder);
      }

      this.validateTransition(order.status, nextStatus);

      order.status = nextStatus;
      await this.orderRepository.save(order, manager);

      const hydratedOrder = await this.getHydratedOrderOrFail(order.id, manager);
      return this.mapOrderResponse(hydratedOrder);
    });
  }

  async assignDriver(orderId: string, driverId: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findByIdForUpdate(orderId, manager);

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.READY) {
        throw new BadRequestException(
          'Only READY orders can be assigned to driver',
        );
      }

      if (order.driverId) {
        throw new BadRequestException('Order already has assigned driver');
      }

      const driver = await this.driverRepository.findByUserId(driverId, manager);

      if (!driver) {
        throw new NotFoundException('Driver not found');
      }

      if (driver.status !== DriverStatus.ACTIVE) {
        throw new BadRequestException('Driver is not active');
      }

      if (!driver.user?.isActive) {
        throw new BadRequestException('Driver account is inactive');
      }

      if (!driver.isOnline) {
        throw new BadRequestException('Driver is offline');
      }

      order.driverId = driver.userId;
      order.assignedAt = new Date();

      await this.orderRepository.save(order, manager);

      const hydratedOrder = await this.getHydratedOrderOrFail(order.id, manager);
      return this.mapOrderResponse(hydratedOrder);
    });
  }

  async cancelOrder(orderId: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.orderRepository.findByIdForUpdate(
        orderId,
        manager,
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        const hydratedOrder = await this.getHydratedOrderOrFail(order.id, manager);
        return this.mapOrderResponse(hydratedOrder);
      }

      if (
        order.status === OrderStatus.PICKED_UP ||
        order.status === OrderStatus.DELIVERED
      ) {
        throw new BadRequestException('Order cannot be cancelled after pickup');
      }

      if (
        order.paymentMethod === PaymentMethod.WALLET &&
        order.paymentStatus === PaymentStatus.PAID
      ) {
        await this.refundToWallet(order, manager);
      } else {
        order.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(order, manager);
      }

      const hydratedOrder = await this.getHydratedOrderOrFail(order.id, manager);
      return this.mapOrderResponse(hydratedOrder);
    });
  }

  async getAvailableDrivers() {
    const drivers = await this.driverRepository.findAvailableDrivers();

    return drivers.map((driver) => ({
      userId: driver.userId,
      fullName: driver.user?.fullName ?? null,
      email: driver.user?.email ?? null,
      phone: driver.user?.phone ?? null,
      userIsActive: driver.user?.isActive ?? false,
      status: driver.status,
      isOnline: driver.isOnline,
      vehicleType: driver.vehicleType,
      licensePlate: driver.licensePlate,
      updatedAt: driver.updatedAt,
    }));
  }

  private validateTransition(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    const allowedNextStatuses = STAFF_ALLOWED_TRANSITIONS[currentStatus] ?? [];

    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid order status transition from ${currentStatus} to ${nextStatus}`,
      );
    }
  }

  private async refundToWallet(order: Order, manager: EntityManager) {
    const wallet = await this.walletRepository.findByCustomerIdForUpdate(
      order.customerId,
      manager,
    );

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const balanceBefore = wallet.balance;
    const refundAmount = order.totalAmount;
    const balanceAfter = balanceBefore + refundAmount;

    wallet.balance = balanceAfter;
    await this.walletRepository.save(wallet, manager);

    await this.walletTransactionRepository.createWithManager(
      {
        walletId: wallet.id,
        type: WalletTransactionType.REFUND,
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        referenceType: 'ORDER',
        referenceId: order.id,
        description: `Hoan tien don hang #${order.id}`,
      },
      manager,
    );

    order.status = OrderStatus.CANCELLED;
    order.paymentStatus = PaymentStatus.REFUNDED;
    await this.orderRepository.save(order, manager);
  }

  private async getHydratedOrderOrFail(orderId: string, manager: EntityManager) {
    const order = await this.orderRepository.findById(orderId, manager);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private mapTrackingResponse(order: Order) {
    return {
      orderId: order.id,
      status: order.status,
      driver: order.driver
        ? {
            userId: order.driver.userId,
            fullName: order.driver.user?.fullName ?? null,
            email: order.driver.user?.email ?? null,
            phone: order.driver.user?.phone ?? null,
            isOnline: order.driver.isOnline,
            status: order.driver.status,
            vehicleType: order.driver.vehicleType ?? null,
            licensePlate: order.driver.licensePlate ?? null,
            currentLocation: {
              lat: order.driver.currentLat ?? null,
              lng: order.driver.currentLng ?? null,
              lastLocationAt: order.driver.lastLocationAt ?? null,
            },
          }
        : null,
      delivery: {
        addressText: order.deliveryAddressText ?? null,
        lat: order.deliveryLat ?? null,
        lng: order.deliveryLng ?? null,
      },
      store: {
        name: storeConfig.name,
        address: storeConfig.address,
        lat: storeConfig.lat,
        lng: storeConfig.lng,
      },
      assignedAt: order.assignedAt,
      pickedUpAt: order.pickedUpAt,
      deliveredAt: order.deliveredAt,
      driverConfirmedDelivered: order.driverConfirmedDelivered,
      customerConfirmedDelivered: order.customerConfirmedDelivered,
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
      driver: order.driver
        ? {
            userId: order.driver.userId,
            fullName: order.driver.user?.fullName ?? null,
            email: order.driver.user?.email ?? null,
            phone: order.driver.user?.phone ?? null,
            isOnline: order.driver.isOnline,
            status: order.driver.status,
          }
        : null,
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