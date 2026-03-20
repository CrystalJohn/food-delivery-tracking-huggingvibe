import { api } from '@/lib/api';

export interface StoreLocationInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface StoreDistanceResponse {
  store: StoreLocationInfo;
  distanceKm: number;
  withinRadius: boolean;
  deliveryRadiusKm: number;
}

export interface StoreDistanceRequest {
  lat: number;
  lng: number;
}

export const storeService = {
  async getStoreDistance(payload: StoreDistanceRequest): Promise<StoreDistanceResponse> {
    return api.post<StoreDistanceResponse>('/store/distance', payload);
  },
};
