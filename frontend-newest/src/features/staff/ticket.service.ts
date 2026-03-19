import type { KitchenTicket } from '@/types';
import type { OrderStatus } from '@/types';
import { staffOrderService } from './staff-order.service';

const QUEUE_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];

export type StaffTicket = KitchenTicket & {
  orderStatus: OrderStatus;
  driverId?: string | null;
  driverName?: string | null;
};

export const ticketService = {
  async getAll(): Promise<StaffTicket[]> {
    return staffOrderService.getOrders();
  },

  async getQueue(): Promise<StaffTicket[]> {
    const orders = await staffOrderService.getOrders();
    return orders.filter((o) => QUEUE_STATUSES.includes(o.orderStatus));
  },

  async acceptTicket(ticketId: string): Promise<void> {
    await staffOrderService.updateOrderStatus(ticketId, 'CONFIRMED');
  },

  async startCooking(ticketId: string): Promise<void> {
    await staffOrderService.updateOrderStatus(ticketId, 'PREPARING');
  },

  async completeTicket(ticketId: string): Promise<void> {
    await staffOrderService.updateOrderStatus(ticketId, 'READY');
  },

  async rejectTicket(ticketId: string): Promise<void> {
    await staffOrderService.cancelOrder(ticketId);
  },

  async assignDriver(orderId: string, driverId: string): Promise<void> {
    await staffOrderService.assignDriver(orderId, driverId);
  },

  async getAvailableDrivers() {
    return staffOrderService.getAvailableDrivers();
  },
};
