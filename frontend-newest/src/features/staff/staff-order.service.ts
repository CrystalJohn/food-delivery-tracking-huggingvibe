import { api } from '@/lib/api';
import type { KitchenTicket } from '@/types';
import type { OrderStatus } from '@/types';

export interface StaffOrderQuery {
  status?: OrderStatus;
}

interface BeOrderItem {
  orderItemId: string;
  quantity: number;
  price: number;
  lineTotal?: number;
  menuItem?: { id: string; name?: string; description?: string; imageUrl?: string; category?: string };
}

interface BeStaffOrder {
  id: string;
  customerId: string;
  customer?: { userId: string; fullName?: string; email?: string; phone?: string } | null;
  driverId?: string | null;
  driver?: { userId: string; fullName?: string | null; email?: string | null; phone?: string | null } | null;
  status: string;
  totalAmount: number;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  items: BeOrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface BeAvailableDriver {
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  userIsActive: boolean;
  status: string;
  isOnline: boolean;
  vehicleType?: string | null;
  licensePlate?: string | null;
  updatedAt?: string | null;
}

function mapBeStatusToTicketStatus(beStatus: string): KitchenTicket['status'] {
  switch (beStatus) {
    case 'PENDING':
      return 'PENDING';
    case 'CONFIRMED':
    case 'PREPARING':
      return 'IN_PROGRESS';
    case 'READY':
      return 'READY';
    case 'CANCELLED':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
}

function mapBeOrderToTicket(
  be: BeStaffOrder,
): KitchenTicket & { orderStatus: OrderStatus; driverId?: string | null; driverName?: string | null } {
  const orderStatus = be.status as OrderStatus;
  const items = (be.items || []).map((item) => ({
    id: item.orderItemId,
    menuItemId: item.menuItem?.id ?? item.orderItemId,
    name: item.menuItem?.name ?? 'Item',
    quantity: item.quantity,
    unitPrice: item.price ?? 0,
  }));

  return {
    id: be.id,
    orderId: be.id,
    items,
    status: mapBeStatusToTicketStatus(be.status),
    createdAt: typeof be.createdAt === 'string' ? be.createdAt : new Date(be.createdAt).toISOString(),
    orderStatus,
    driverId: be.driverId ?? null,
    driverName: be.driver?.fullName ?? null,
  };
}

export const staffOrderService = {
  async getOrders(query?: StaffOrderQuery): Promise<(KitchenTicket & { orderStatus: OrderStatus })[]> {
    const params = query?.status ? { status: query.status } : {};
    const url = params.status ? `/staff/orders?status=${params.status}` : '/staff/orders';
    const data = await api.get<BeStaffOrder[]>(url);
    const list = Array.isArray(data) ? data : [];
    return list.map(mapBeOrderToTicket);
  },

  async getOrderDetail(orderId: string): Promise<KitchenTicket & { orderStatus: OrderStatus }> {
    const be = await api.get<BeStaffOrder>(`/staff/orders/${orderId}`);
    return mapBeOrderToTicket(be);
  },

  async getAvailableDrivers(): Promise<BeAvailableDriver[]> {
    const data = await api.get<BeAvailableDriver[] | BeAvailableDriver>('/staff/orders/available-drivers');
    return Array.isArray(data) ? data : data ? [data] : [];
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await api.patch(`/staff/orders/${orderId}/status`, { status });
  },

  async assignDriver(orderId: string, driverId: string): Promise<void> {
    await api.patch(`/staff/orders/${orderId}/assign-driver`, { driverId });
  },

  async cancelOrder(orderId: string): Promise<void> {
    await api.patch(`/staff/orders/${orderId}/cancel`);
  },
};
