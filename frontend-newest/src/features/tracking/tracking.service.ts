import { api } from '@/lib/api';

export interface TrackingData {
  orderId: string;
  status: string;
  driverLocation?: { lat: number; lng: number };
  estimatedTime?: number;
}

export const trackingService = {
  async getTracking(orderId: string): Promise<TrackingData> {
    return api.get<TrackingData>(`/tracking/${orderId}`);
  },
};
