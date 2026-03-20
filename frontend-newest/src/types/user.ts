export interface UserDefaultAddress {
  id?: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'STAFF' | 'DRIVER' | 'ADMIN';
  phone?: string;
  defaultAddress?: UserDefaultAddress;
  createdAt?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
}
