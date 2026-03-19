import { api } from '@/lib/api';
import type { User, Order } from '@/types';

export interface AdminStats {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  activeDrivers: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return api.get<AdminStats>('/admin/stats');
  },

  async getAllOrders(): Promise<Order[]> {
    return api.get<Order[]>('/admin/orders');
  },

  async getAllUsers(): Promise<User[]> {
    return api.get<User[]>('/admin/users');
  },

  async approveDriver(userId: string): Promise<User> {
    return api.patch<User>(`/admin/users/${userId}/approve-driver`);
  },
};
