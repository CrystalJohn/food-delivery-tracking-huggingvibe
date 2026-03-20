import { OrderService } from './order.service';
import { CartStatus } from '../enums/cart-status.enum';
import { DeliveryAddressMode } from '../enums/delivery-address-mode.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

type MockDeps = {
  dataSource: { transaction: jest.Mock };
  customerRepository: { findByUserId: jest.Mock };
  cartRepository: {
    findActiveCartByCustomerIdForUpdate: jest.Mock;
    save: jest.Mock;
  };
  orderRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    save: jest.Mock;
  };
  orderItemRepository: { saveMany: jest.Mock };
  walletRepository: { findByCustomerIdForUpdate: jest.Mock; save: jest.Mock };
  walletTransactionRepository: { createWithManager: jest.Mock };
};

describe('OrderService.createOrder address modes', () => {
  const manager = { tx: 'manager' } as any;
  let service: OrderService;
  let deps: MockDeps;
  let createdPayload: any;

  const baseCart = {
    id: 'cart-1',
    customerId: 'customer-1',
    status: CartStatus.ACTIVE,
    items: [
      {
        id: 'cart-item-1',
        quantity: 2,
        menuItem: {
          id: 1,
          name: 'Pizza Seafood',
          description: 'Good pizza',
          price: 100000,
          isActive: true,
          isAvailable: true,
          category: { name: 'Pizza' },
          images: [{ imageUrl: 'https://cdn.example.com/pizza.jpg' }],
        },
      },
    ],
  } as any;

  const buildHydratedOrder = () => ({
    id: 'order-1',
    customerId: 'customer-1',
    driverId: null,
    driver: null,
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    paymentStatus: PaymentStatus.UNPAID,
    totalAmount: 200000,
    deliveryAddressText: createdPayload.deliveryAddressText,
    deliveryLat: createdPayload.deliveryLat,
    deliveryLng: createdPayload.deliveryLng,
    assignedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    driverConfirmedDelivered: false,
    customerConfirmedDelivered: false,
    createdAt: new Date('2026-03-20T00:00:00.000Z'),
    updatedAt: new Date('2026-03-20T00:00:00.000Z'),
    items: [
      {
        id: 'order-item-1',
        quantity: 2,
        price: 100000,
        menuItemId: 1,
        menuItemName: 'Pizza Seafood',
        menuItemDescription: 'Good pizza',
        menuItemImageUrl: 'https://cdn.example.com/pizza.jpg',
        menuItemCategoryName: 'Pizza',
      },
    ],
  });

  beforeEach(() => {
    createdPayload = null;

    deps = {
      dataSource: {
        transaction: jest.fn(async (callback: (mgr: any) => any) =>
          callback(manager),
        ),
      },
      customerRepository: {
        findByUserId: jest.fn(),
      },
      cartRepository: {
        findActiveCartByCustomerIdForUpdate: jest.fn().mockResolvedValue(baseCart),
        save: jest.fn().mockResolvedValue(baseCart),
      },
      orderRepository: {
        create: jest.fn().mockImplementation(async (payload: any) => {
          createdPayload = payload;
          return { id: 'order-1', ...payload };
        }),
        findById: jest.fn().mockImplementation(async () => buildHydratedOrder()),
        save: jest.fn(),
      },
      orderItemRepository: {
        saveMany: jest.fn().mockImplementation(async (items: any[]) => items),
      },
      walletRepository: {
        findByCustomerIdForUpdate: jest.fn(),
        save: jest.fn(),
      },
      walletTransactionRepository: {
        createWithManager: jest.fn(),
      },
    };

    service = new OrderService(
      deps.dataSource as any,
      deps.customerRepository as any,
      deps.cartRepository as any,
      deps.orderRepository as any,
      deps.orderItemRepository as any,
      deps.walletRepository as any,
      deps.walletTransactionRepository as any,
    );
  });

  it('uses customer defaultAddress when mode is omitted (backward-compatible DEFAULT)', async () => {
    deps.customerRepository.findByUserId.mockResolvedValue({
      userId: 'customer-1',
      defaultAddress: {
        fullAddress: '123 Default Street',
        lat: 10.77,
        lng: 106.7,
      },
    });

    const result = await service.createOrder('customer-1', {
      paymentMethod: PaymentMethod.CASH,
    });

    expect(deps.orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryAddressText: '123 Default Street',
        deliveryLat: 10.77,
        deliveryLng: 106.7,
      }),
      manager,
    );

    expect(result.delivery).toEqual({
      addressText: '123 Default Street',
      lat: 10.77,
      lng: 106.7,
    });
  });

  it('uses payload delivery fields when mode is CUSTOM', async () => {
    deps.customerRepository.findByUserId.mockResolvedValue({
      userId: 'customer-1',
      defaultAddress: {
        fullAddress: '123 Default Street',
        lat: 10.77,
        lng: 106.7,
      },
    });

    const result = await service.createOrder('customer-1', {
      paymentMethod: PaymentMethod.CASH,
      deliveryAddressMode: DeliveryAddressMode.CUSTOM,
      deliveryAddressText: '456 Custom Address',
      deliveryLat: 10.81,
      deliveryLng: 106.66,
    });

    expect(deps.orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryAddressText: '456 Custom Address',
        deliveryLat: 10.81,
        deliveryLng: 106.66,
      }),
      manager,
    );

    expect(result.delivery).toEqual({
      addressText: '456 Custom Address',
      lat: 10.81,
      lng: 106.66,
    });
  });
});
