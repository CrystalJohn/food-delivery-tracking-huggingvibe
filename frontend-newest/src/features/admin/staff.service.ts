import { api } from '@/lib/api';

export interface StaffAccount {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  userIsActive: boolean;
  createdAt: string;
}

export interface CreateStaffRequest {
  email: string;
  fullName: string;
  phone: string;
  password: string;
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

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return fallback;
}

function normalizeStaff(payload: unknown): StaffAccount {
  const record = isRecord(payload) ? payload : {};
  const email = asString(record.email) ?? '';
  const fullName = asString(record.fullName ?? record.name) ?? '';

  return {
    userId: asString(record.userId ?? record.id ?? record._id) ?? email ?? '',
    email,
    fullName,
    phone: asString(record.phone) ?? '',
    role: asString(record.role) ?? 'STAFF',
    isActive: asBoolean(record.isActive, true),
    userIsActive: asBoolean(record.userIsActive, true),
    createdAt: asString(record.createdAt) ?? new Date().toISOString(),
  };
}

function looksLikeStaffRecord(payload: unknown): payload is UnknownRecord {
  if (!isRecord(payload)) return false;
  return (
    typeof payload.userId !== 'undefined' ||
    typeof payload.email !== 'undefined' ||
    typeof payload.fullName !== 'undefined' ||
    typeof payload.phone !== 'undefined'
  );
}

function normalizeStaffList(payload: unknown): StaffAccount[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeStaff(item));
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [payload.staffs, payload.data, payload.items, payload.users];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((item) => normalizeStaff(item));
    }
  }

  if (looksLikeStaffRecord(payload)) {
    return [normalizeStaff(payload)];
  }

  return [];
}

export const staffAdminService = {
  async getStaffs(): Promise<StaffAccount[]> {
    const payload = await api.get<unknown>('/admin/staffs');
    return normalizeStaffList(payload);
  },

  async createStaff(data: CreateStaffRequest): Promise<StaffAccount> {
    const payload = await api.post<unknown>('/admin/staffs', data);
    return normalizeStaff(payload);
  },
};

