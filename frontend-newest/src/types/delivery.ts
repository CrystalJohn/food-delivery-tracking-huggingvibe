export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

export interface DeliveryJob {
  id: string;
  orderId: string;
  driverId?: string;
  driverName?: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  customerName?: string;
  customerPhone?: string;
  estimatedTime?: number;
  createdAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface DeliveryTracking {
  jobId: string;
  orderId: string;
  status: DeliveryStatus;
  driverLocation?: DriverLocation;
  estimatedArrival?: string;
}
