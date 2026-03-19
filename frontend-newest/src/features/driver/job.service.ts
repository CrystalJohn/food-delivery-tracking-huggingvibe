import { api } from '@/lib/api';
import type { DeliveryJob } from '@/types';

interface BeDriverOrder {
  id: string;
  customerId: string;
  customer?: { fullName?: string; phone?: string } | null;
  driverId?: string | null;
  status: string;
  totalAmount: number;
  deliveryLocation?: { lat: number; lng: number } | null;
  driverLocation?: { lat: number; lng: number; timestamp?: string | null } | null;
  assignedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  driverConfirmedDelivered?: boolean | null;
  customerConfirmedDelivered?: boolean | null;
  items?: unknown[];
  createdAt: string;
  updatedAt?: string;
}

function mapBeOrderToJob(be: BeDriverOrder): DeliveryJob {
  const status: DeliveryJob['status'] =
    be.status === 'READY'
      ? 'ASSIGNED'
      : be.status === 'PICKED_UP'
        ? 'PICKED_UP'
        : be.status === 'DELIVERED'
          ? 'DELIVERED'
          : 'ASSIGNED';

  return {
    id: be.id,
    orderId: be.id,
    status,
    pickupAddress: 'Store',
    deliveryAddress: '',
    customerName: be.customer?.fullName ?? undefined,
    customerPhone: be.customer?.phone ?? undefined,
    createdAt: typeof be.createdAt === 'string' ? be.createdAt : new Date(be.createdAt).toISOString(),
    assignedAt: be.assignedAt ?? undefined,
    pickedUpAt: be.pickedUpAt ?? undefined,
    deliveredAt: be.deliveredAt ?? undefined,
    // extra fields for detail pages (TS allows extra keys)
    ...(be.deliveryLocation ? { deliveryLocation: be.deliveryLocation } : {}),
    ...(be.driverLocation ? { driverLocation: be.driverLocation } : {}),
  };
}

function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
    );
  });
}

export const jobService = {
  async getMyJobs(): Promise<DeliveryJob[]> {
    const data = await api.get<BeDriverOrder[] | BeDriverOrder>('/driver/orders');
    const list = Array.isArray(data) ? data : data ? [data] : [];
    return list.map(mapBeOrderToJob);
  },

  async getMyOrderDetail(orderId: string): Promise<DeliveryJob | null> {
    try {
      const be = await api.get<BeDriverOrder>(`/driver/orders/${orderId}`);
      return mapBeOrderToJob(be);
    } catch {
      return null;
    }
  },

  async pickupJob(orderId: string): Promise<DeliveryJob> {
    const be = await api.patch<BeDriverOrder>(`/driver/orders/${orderId}/pick-up`);
    return mapBeOrderToJob(be);
  },

  async deliverJob(orderId: string): Promise<DeliveryJob> {
    const be = await api.patch<BeDriverOrder>(`/driver/orders/${orderId}/confirm-delivered`);
    return mapBeOrderToJob(be);
  },

  async updateMyLocation(orderId: string): Promise<void> {
    const { lat, lng } = await getCurrentPosition();
    await api.patch(`/driver/orders/${orderId}/location`, { lat, lng });
  },
};
