export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'STAFF' | 'DRIVER' | 'ADMIN';
  phone?: string;
  createdAt?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
}
