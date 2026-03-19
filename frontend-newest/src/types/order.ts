export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryPhone?: string;
  deliveryLocation?: { lat: number; lng: number } | null;
  driverLocation?: { lat: number; lng: number; timestamp?: string | null } | null;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  confirmedAt?: string;
  deliveredAt?: string;
}
