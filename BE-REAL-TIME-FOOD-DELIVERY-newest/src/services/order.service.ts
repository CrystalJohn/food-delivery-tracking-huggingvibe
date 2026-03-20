import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { CreateOrderDto } from 'src/dto/order/create-order.dto';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { Cart } from 'src/entities/cart.entity';
import { Customer } from 'src/entities/customer.entity';

import { CartStatus } from 'src/enums/cart-status.enum';
import { OrderStatus } from 'src/enums/order-status.enum';
import { PaymentMethod } from 'src/enums/payment-method.enum';
import { PaymentStatus } from 'src/enums/payment-status.enum';
import { WalletTransactionType } from 'src/enums/wallet-transaction-type.enum';
import { DeliveryAddressMode } from 'src/enums/delivery-address-mode.enum';

import { CartRepository } from 'src/repositories/cart.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { OrderItemRepository } from 'src/repositories/order-item.repository';
import { WalletRepository } from 'src/repositories/wallet.repository';
import { WalletTransactionRepository } from 'src/repositories/wallet-transaction.repository';
import { storeConfig } from 'src/config/store.config';

const CUSTOMER_CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

const SHIPPING_FEE = 30000;
const EARTH_RADIUS_KM = 6371;

type DeliveryAddressSnapshot = {
  addressText: string;
  lat: number | null;
  lng: number | null;
};

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly customerRepository: CustomerRepository,
    private readonly cartRepository: CartRepository,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly walletRepository: WalletRepository,
    private readonly walletTransactionRepository: WalletTransactionRepository,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const customer = await this.getCustomerOrFail(userId, manager);
      const cart = await this.getActiveCartOrFail(customer.userId, manager);

      this.validateCart(cart);

      const itemsTotal = this.calculateCartTotal(cart);
      const deliveryAddress = this.resolveDeliveryAddress(dto, customer);

      this.ensureDeliveryWithinRadius(deliveryAddress);

      const totalAmount = itemsTotal + SHIPPING_FEE;

      const order = await this.orderRepository.create(
        {
          customerId: customer.userId,
          status: OrderStatus.PENDING,
          paymentMethod: dto.paymentMethod,
          paymentStatus: PaymentStatus.UNPAID,
          totalAmount,
          driverId: null,
          assignedAt: null,
          pickedUpAt: null,
          deliveredAt: null,
          driverConfirmedDelivered: false,
          customerConfirmedDelivered: false,
          deliveryAddressText: deliveryAddress.addressText,
          deliveryLat: deliveryAddress.lat,
          deliveryLng: deliveryAddress.lng,
        },
        manager,
      );

      const orderItems = this.buildOrderItemsFromCart(cart, order);
      order.items = await this.orderItemRepository.saveMany(orderItems, manager);

      if (dto.paymentMethod === PaymentMethod.WALLET) {
        await this.payWithWallet(customer.userId, order, totalAmount, manager);
      }

      cart.status = CartStatus.CHECKED_OUT;
      await this.cartRepository.save(cart, manager);

      const savedOrder = await this.orderRepository.findById(order.id, manager);
      if (!savedOrder) {
        throw new NotFoundException('Order not found after creation');
      }

      return this.mapOrderResponse(savedOrder);
    });
  }

  async getMyOrders(userId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const orders = await this.orderRepository.findByCustomerId(customer.userId);
    return orders.map((order) => this.mapOrderResponse(order));
  }

  async getMyOrderTracking(userId: string, orderId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const order = await this.orderRepository.findByIdAndCustomerId(
      orderId,
      customer.userId,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapTrackingResponse(order);
  }

  async getMyOrderDetail(userId: string, orderId: string) {
    const customer = await this.customerRepository.findByUserId(userId);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const order = await this.orderRepository.findByIdAndCustomerId(
      orderId,
      customer.userId,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapOrderResponse(order);
  }

  async cancelMyOrder(userId: string, orderId: string) {
    return this.dataSource.transaction(async (manager) => {
      const customer = await this.getCustomerOrFail(userId, manager);

      const order = await this.orderRepository.findByIdAndCustomerIdForUpdate(
        orderId,
        customer.userId,
        manager,
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        const saved = await this.orderRepository.findById(order.id, manager);
        if (!saved) {
          throw new NotFoundException('Order not found after cancel');
        }
        return this.mapOrderResponse(saved);
      }

      if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
        throw new BadRequestException(
          `Order cannot be cancelled at status "${order.status}".`,
        );
      }

      if (
        order.paymentMethod === PaymentMethod.WALLET &&
        order.paymentStatus === PaymentStatus.PAID
      ) {
        await this.refundToWallet(customer.userId, order, manager);
      } else {
        order.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(order, manager);
      }

      const updatedOrder = await this.orderRepository.findById(order.id, manager);
      if (!updatedOrder) {
        throw new NotFoundException('Order not found after cancel');
      }

      return this.mapOrderResponse(updatedOrder);
    });
  }

  async confirmDelivered(userId: string, orderId: string) {
    return this.dataSource.transaction(async (manager) => {
      const customer = await this.getCustomerOrFail(userId, manager);

      const order = await this.orderRepository.findByIdAndCustomerIdForUpdate(
        orderId,
        customer.userId,
        manager,
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.PICKED_UP) {
        throw new BadRequestException('Only PICKED_UP orders can be confirmed');
      }

      if (!order.customerConfirmedDelivered) {
        order.customerConfirmedDelivered = true;

        if (order.driverConfirmedDelivered) {
          order.status = OrderStatus.DELIVERED;
          order.deliveredAt = new Date();
        }

        await this.orderRepository.save(order, manager);
      }

      const updatedOrder = await this.orderRepository.findById(order.id, manager);
      if (!updatedOrder) {
        throw new NotFoundException(
          'Order not found after delivery confirmation',
        );
      }

      return this.mapOrderResponse(updatedOrder);
    });
  }

  private async getCustomerOrFail(userId: string, manager: EntityManager) {
    const customer = await this.customerRepository.findByUserId(userId, manager);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  private async getActiveCartOrFail(
    customerId: string,
    manager: EntityManager,
  ) {
    const cart = await this.cartRepository.findActiveCartByCustomerIdForUpdate(
      customerId,
      manager,
    );

    if (!cart) {
      throw new BadRequestException(
        'No active cart found. Please add items to cart again before checkout.',
      );
    }

    return cart;
  }

  private validateCart(cart: Cart) {
    if (!cart.items?.length) {
      throw new BadRequestException('Cart empty');
    }

    for (const cartItem of cart.items) {
      if (!cartItem.menuItem) {
        throw new BadRequestException('Cart contains invalid menu item');
      }

      if (!cartItem.menuItem.isActive || !cartItem.menuItem.isAvailable) {
        throw new BadRequestException(
          `Menu item "${cartItem.menuItem.name}" is not available`,
        );
      }
    }
  }

  private calculateCartTotal(cart: Cart): number {
    return cart.items.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0,
    );
  }

  private resolveDeliveryAddress(
    dto: CreateOrderDto,
    customer: Customer,
  ): DeliveryAddressSnapshot {
    const mode = dto.deliveryAddressMode ?? DeliveryAddressMode.DEFAULT;

    if (mode === DeliveryAddressMode.DEFAULT) {
      const defaultAddress = customer.defaultAddress;

      if (!defaultAddress || !defaultAddress.fullAddress?.trim()) {
        throw new BadRequestException(
          'Default address not found. Please update profile address or use CUSTOM mode.',
        );
      }

      return {
        addressText: defaultAddress.fullAddress.trim(),
        lat: defaultAddress.lat ?? null,
        lng: defaultAddress.lng ?? null,
      };
    }

    if (mode === DeliveryAddressMode.CUSTOM) {
      const customText = dto.deliveryAddressText?.trim();

      if (!customText) {
        throw new BadRequestException('deliveryAddressText is required for CUSTOM mode');
      }

      if (dto.deliveryLat === undefined || dto.deliveryLng === undefined) {
        throw new BadRequestException('deliveryLat and deliveryLng are required for CUSTOM mode');
      }

      return {
        addressText: customText,
        lat: dto.deliveryLat,
        lng: dto.deliveryLng,
      };
    }

    throw new BadRequestException('Invalid deliveryAddressMode');
  }

  private ensureDeliveryWithinRadius(delivery: DeliveryAddressSnapshot) {
    if (delivery.lat === null || delivery.lng === null) {
      throw new BadRequestException(
        'Delivery location coordinates are required for delivery.',
      );
    }

    const distanceKm = this.calculateDistanceKm(
      storeConfig.lat,
      storeConfig.lng,
      delivery.lat,
      delivery.lng,
    );

    if (distanceKm > storeConfig.deliveryRadiusKm) {
      throw new BadRequestException(
        'Delivery address is outside delivery radius (' + storeConfig.deliveryRadiusKm + 'km).'
      );
    }
  }

  private calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) {
    const toRadians = (value: number) => (value * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }
  private buildOrderItemsFromCart(cart: Cart, order: Order): OrderItem[] {
    return cart.items.map((cartItem) => {
      const firstImage = cartItem.menuItem.images?.[0];

      const orderItem = new OrderItem();
      orderItem.orderId = order.id;
      orderItem.order = order;
      orderItem.menuItemId = cartItem.menuItem.id;
      orderItem.menuItemName = cartItem.menuItem.name;
      orderItem.menuItemDescription = cartItem.menuItem.description ?? null;
      orderItem.menuItemImageUrl = firstImage ? firstImage.imageUrl : null;
      orderItem.menuItemCategoryName =
        cartItem.menuItem.category?.name ?? null;
      orderItem.quantity = cartItem.quantity;
      orderItem.price = cartItem.menuItem.price;

      return orderItem;
    });
  }

  private async payWithWallet(
    customerId: string,
    order: Order,
    amount: number,
    manager: EntityManager,
  ) {
    const wallet = await this.walletRepository.findByCustomerIdForUpdate(
      customerId,
      manager,
    );

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = wallet.balance - amount;

    wallet.balance = balanceAfter;
    await this.walletRepository.save(wallet, manager);

    await this.walletTransactionRepository.createWithManager(
      {
        walletId: wallet.id,
        type: WalletTransactionType.PAYMENT,
        amount,
        balanceBefore,
        balanceAfter,
        referenceType: 'ORDER',
        referenceId: order.id,
        description: `Thanh toan don hang #${order.id}`,
      },
      manager,
    );

    order.paymentStatus = PaymentStatus.PAID;
    await this.orderRepository.save(order, manager);
  }

  private async refundToWallet(
    customerId: string,
    order: Order,
    manager: EntityManager,
  ) {
    const wallet = await this.walletRepository.findByCustomerIdForUpdate(
      customerId,
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

  private mapTrackingResponse(order: Order | null) {
    if (!order) {
      throw new NotFoundException('Order not found');
    }

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

  private mapOrderResponse(order: Order | null) {
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const items = (order.items || []).map((item) => ({
      orderItemId: item.id,
      quantity: item.quantity,
      price: item.price,
      lineTotal: item.price * item.quantity,
      menuItem: {
        id: item.menuItemId,
        name: item.menuItemName,
        description: item.menuItemDescription ?? null,
        imageUrl: item.menuItemImageUrl ?? null,
        category: item.menuItemCategoryName ?? null,
      },
    }));

    return {
      id: order.id,
      customerId: order.customerId,
      driverId: order.driverId,
      driver: order.driver
        ? {
            userId: order.driver.userId,
            fullName: order.driver.user?.fullName ?? null,
            email: order.driver.user?.email ?? null,
            phone: order.driver.user?.phone ?? null,
          }
        : null,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      delivery: {
        addressText: order.deliveryAddressText ?? null,
        lat: order.deliveryLat ?? null,
        lng: order.deliveryLng ?? null,
      },
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




