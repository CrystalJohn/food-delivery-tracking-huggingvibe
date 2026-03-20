import { Injectable } from '@nestjs/common';
import { storeConfig } from 'src/config/store.config';

const EARTH_RADIUS_KM = 6371;

@Injectable()
export class StoreService {
  getStoreDistance(lat: number, lng: number) {
    const distanceKm = this.calculateDistanceKm(
      storeConfig.lat,
      storeConfig.lng,
      lat,
      lng,
    );

    return {
      store: {
        name: storeConfig.name,
        address: storeConfig.address,
        lat: storeConfig.lat,
        lng: storeConfig.lng,
      },
      distanceKm: Number(distanceKm.toFixed(2)),
      withinRadius: distanceKm <= storeConfig.deliveryRadiusKm,
      deliveryRadiusKm: storeConfig.deliveryRadiusKm,
    };
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
}
