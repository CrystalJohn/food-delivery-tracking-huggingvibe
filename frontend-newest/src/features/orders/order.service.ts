import { api } from '@/lib/api';
import type { Order, OrderItem, OrderStatus } from '@/types';

export interface CreateOrderRequest {
  items: OrderItem[];
  deliveryAddress: string;
}

export type PaymentMethod = 'CASH' | 'WALLET';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function getNestedRecord(value: unknown, key: string): UnknownRecord | undefined {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
}

function normalizeStatus(value: unknown): OrderStatus {
  const raw = typeof value === 'string' ? value.toUpperCase() : 'PENDING';
  if (raw === 'PICKED_UP') return 'DELIVERING';

  const statuses: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'DELIVERING',
    'DELIVERED',
    'CANCELLED',
  ];

  return statuses.includes(raw as OrderStatus) ? (raw as OrderStatus) : 'PENDING';
}

function normalizeOrderItem(raw: unknown, index: number): OrderItem {
  const record = isRecord(raw) ? raw : {};
  const menuItem = getNestedRecord(record, 'menuItem');

  const id = asString(record.id ?? record.orderItemId ?? record.itemId) ?? `item-${index + 1}`;
  const menuItemId = asString(record.menuItemId ?? menuItem?.id ?? id) ?? id;
  const name = asString(record.name ?? record.menuItemName ?? menuItem?.name) ?? 'Menu item';
  const quantity = asNumber(record.quantity) ?? 1;
  const unitPrice =
    asNumber(record.unitPrice ?? record.price ?? menuItem?.price ?? record.lineTotal) ?? 0;

  return {
    id,
    menuItemId,
    name,
    quantity,
    unitPrice,
  };
}

function normalizeOrder(raw: unknown): Order {
  const record = isRecord(raw) ? raw : {};
  const customer = getNestedRecord(record, 'customer');
  const deliveryLocation = getNestedRecord(record, 'deliveryLocation');
  const driverLocation = getNestedRecord(record, 'driverLocation');
  const itemsRaw = Array.isArray(record.items) ? record.items : [];
  const items = itemsRaw.map((item, index) => normalizeOrderItem(item, index));

  const totalAmount =
    asNumber(record.totalAmount) ??
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return {
    id: asString(record.id ?? record._id) ?? '',
    customerId: asString(record.customerId ?? customer?.id) ?? '',
    customerName: asString(record.customerName ?? customer?.name),
    items,
    totalAmount,
    status: normalizeStatus(record.status),
    deliveryAddress: asString(record.deliveryAddress ?? record.address) ?? '',
    deliveryPhone: asString(record.deliveryPhone ?? record.phone),
    notes: asString(record.notes),
    createdAt: asString(record.createdAt ?? record.created_at) ?? new Date().toISOString(),
    updatedAt: asString(record.updatedAt ?? record.updated_at),
    confirmedAt: asString(record.confirmedAt),
    deliveredAt: asString(record.deliveredAt),
    deliveryLocation:
      deliveryLocation && asNumber(deliveryLocation.lat) != null && asNumber(deliveryLocation.lng) != null
        ? { lat: asNumber(deliveryLocation.lat)!, lng: asNumber(deliveryLocation.lng)! }
        : null,
    driverLocation:
      driverLocation && asNumber(driverLocation.lat) != null && asNumber(driverLocation.lng) != null
        ? {
            lat: asNumber(driverLocation.lat)!,
            lng: asNumber(driverLocation.lng)!,
            timestamp: asString(driverLocation.timestamp) ?? null,
          }
        : null,
  };
}

function normalizeOrderList(payload: unknown): Order[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeOrder(item));
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.orders)) {
    return payload.orders.map((item) => normalizeOrder(item));
  }

  const data = payload.data;
  if (Array.isArray(data)) {
    return data.map((item) => normalizeOrder(item));
  }

  if (isRecord(data)) {
    return [normalizeOrder(data)];
  }

  return [normalizeOrder(payload)];
}

function normalizeSingleOrder(payload: unknown): Order {
  const orders = normalizeOrderList(payload);
  if (orders.length > 0) {
    return orders[0];
  }

  throw new Error('Invalid order response from server');
}

export const orderService = {
  // Legacy path retained for cart-page flow compatibility.
  async create(data: CreateOrderRequest): Promise<Order> {
    const payload = await api.post<unknown>('/orders', data);
    return normalizeSingleOrder(payload);
  },

  async checkoutActiveCart(
    paymentMethod: PaymentMethod,
    opts?: { deliveryLat?: number; deliveryLng?: number },
  ): Promise<Order> {
    const payload = await api.post<unknown>('/orders', { paymentMethod, ...opts });
    return normalizeSingleOrder(payload);
  },

  async getById(id: string): Promise<Order> {
    const payload = await api.get<unknown>(`/orders/${id}`);
    return normalizeSingleOrder(payload);
  },

  async getMyOrders(): Promise<Order[]> {
    const payload = await api.get<unknown>('/orders');
    return normalizeOrderList(payload);
  },

  async cancelOrder(id: string): Promise<Order> {
    const payload = await api.patch<unknown>(`/orders/${id}/cancel`);
    return normalizeSingleOrder(payload);
  },
};
