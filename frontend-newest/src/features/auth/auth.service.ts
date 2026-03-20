// API adapter for auth contracts
import { api } from '@/lib/api';
import type { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  defaultAddress?: {
    id?: string;
    fullAddress?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  };
}

interface AuthResponsePayload {
  accessToken: string;
  user: AuthUserPayload;
}

interface RegisterPayload {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

function mapAuthUser(user: AuthUserPayload): User {
  const hasDefaultAddress = Boolean(user.defaultAddress?.fullAddress);

  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    role: user.role as User['role'],
    phone: user.phone,
    defaultAddress: hasDefaultAddress
      ? {
          id: user.defaultAddress?.id,
          fullAddress: user.defaultAddress?.fullAddress ?? '',
          lat: user.defaultAddress?.lat,
          lng: user.defaultAddress?.lng,
          isDefault: user.defaultAddress?.isDefault,
        }
      : undefined,
  };
}

function mapLoginResponse(response: AuthResponsePayload): LoginResponse {
  return {
    token: response.accessToken,
    user: mapAuthUser(response.user),
  };
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<AuthResponsePayload>('/auth/login', data);
    return mapLoginResponse(response);
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const payload: RegisterPayload = {
      email: data.email,
      fullName: data.name,
      password: data.password,
      phone: data.phone,
      fullAddress: data.fullAddress,
      lat: data.lat,
      lng: data.lng,
    };

    const response = await api.post<AuthResponsePayload>(
      '/auth/register/customer',
      payload,
    );
    return mapLoginResponse(response);
  },

  async me(): Promise<User> {
    const user = await api.get<AuthUserPayload>('/auth/me');
    return mapAuthUser(user);
  },
};
