import { api } from '@/lib/api';

export interface DriverAccount {
  userId?: string;
  email: string;
  fullName: string;
  phone: string;
  vehicleType?: string;
  licensePlate?: string;
  isOnline?: boolean;
  isActive?: boolean;
  status?: string;
}

export interface CreateDriverRequest {
  email: string;
  fullName: string;
  password: string;
  phone: string;
  vehicleType?: string;
  licensePlate?: string;
  isOnline?: boolean;
  isActive?: boolean;
  status?: string;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return undefined;
}

function normalizeDriver(payload: unknown): DriverAccount {
  const record = isRecord(payload) ? payload : {};
  const email = asString(record.email) ?? '';
  const fullName = asString(record.fullName ?? record.name) ?? '';

  return {
    userId: asString(record.userId ?? record.id ?? record._id),
    email,
    fullName,
    phone: asString(record.phone) ?? '',
    vehicleType: asString(record.vehicleType),
    licensePlate: asString(record.licensePlate),
    isOnline: asBoolean(record.isOnline),
    isActive: asBoolean(record.isActive),
    status: asString(record.status),
  };
}

function normalizeDriverList(payload: unknown): DriverAccount[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeDriver(item));
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [payload.drivers, payload.data, payload.items, payload.users];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((item) => normalizeDriver(item));
    }
  }

  return isRecord(payload) ? [normalizeDriver(payload)] : [];
}

function normalizeUserDriverList(payload: unknown): DriverAccount[] {
  if (!isRecord(payload)) {
    if (Array.isArray(payload)) {
      return payload.map((item) => normalizeDriver(item));
    }
    return [];
  }

  const candidates = [payload.data, payload.items, payload.users];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter((item) => {
          if (!isRecord(item)) return false;
          const role = asString(item.role);
          return role?.toUpperCase() === 'DRIVER';
        })
        .map((item) => normalizeDriver(item));
    }
  }

  return [];
}

export const driverAdminService = {
  async getDrivers(): Promise<DriverAccount[]> {
    try {
      const payload = await api.get<unknown>('/admin/drivers');
      return normalizeDriverList(payload);
    } catch (error) {
      try {
        const payload = await api.get<unknown>('/admin/users');
        return normalizeUserDriverList(payload);
      } catch {
        throw error;
      }
    }
  },

  async createDriver(data: CreateDriverRequest): Promise<DriverAccount> {
    const payload = await api.post<unknown>('/admin/drivers', data);
    return normalizeDriver(payload);
  },
};
