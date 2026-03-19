import { api } from '@/lib/api';
import type { KitchenTicket, OrderStatus } from '@/types';

export interface StaffOrderCustomer {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface StaffOrderDriver {
  userId?: string;
  fullName?: string;
  name?: string;
  phone?: string;
}

export interface StaffOrderMenuItem {
  id: number | string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export interface StaffOrderItem {
  orderItemId: string;
  quantity: number;
  price: number;
  lineTotal: number;
  menuItem: StaffOrderMenuItem;
}

export interface StaffOrderResponse {
  id: string;
  customerId: string;
  customer?: StaffOrderCustomer | null;
  driverId?: string | null;
  driver?: StaffOrderDriver | null;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount: number;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  driverConfirmedDelivered?: boolean;
  customerConfirmedDelivered?: boolean;
  items: StaffOrderItem[];
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export const staffService = {
  async getOrders(): Promise<StaffOrderResponse[]> {
    return api.get<StaffOrderResponse[]>('/staff/orders');
  },

  async getOrderById(orderId: string): Promise<StaffOrderResponse> {
    return api.get<StaffOrderResponse>(`/staff/orders/${orderId}`);
  },

  // PATCH /api/staff/orders/{orderId}/status
  async updateOrderStatus(
    orderId: string,
    status: Extract<OrderStatus, 'CONFIRMED' | 'PREPARING' | 'READY'>,
  ): Promise<StaffOrderResponse> {
    return api.patch<StaffOrderResponse>(`/staff/orders/${orderId}/status`, { status });
  },

  async assignDriver(orderId: string): Promise<StaffOrderResponse> {
    return api.patch<StaffOrderResponse>(`/staff/orders/${orderId}/assign-driver`);
  },

  async cancelOrder(orderId: string, reason: string): Promise<StaffOrderResponse> {
    return api.patch<StaffOrderResponse>(`/staff/orders/${orderId}/cancel`, { reason });
  },

  async getQueue(): Promise<KitchenTicket[]> {
    return api.get<KitchenTicket[]>('/staff/queue');
  },

  async acceptTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/accept`);
  },

  async completeTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/complete`);
  },

  async rejectTicket(ticketId: string): Promise<KitchenTicket> {
    return api.patch<KitchenTicket>(`/staff/queue/${ticketId}/reject`);
  },
};
