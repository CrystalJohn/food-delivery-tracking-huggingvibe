import { api, ApiError } from '@/lib/api';
import type { OrderItem } from '@/types';

export interface CartItem extends OrderItem {
  imageUrl?: string;
}

export interface CartSnapshot {
  items: CartItem[];
}

interface AddToCartRequest {
  menuItemId: number;
  quantity: number;
}

interface UpdateCartItemRequest {
  quantity: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function getNestedRecord(value: unknown, key: string): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
}

function extractRawItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  if (Array.isArray(payload.items)) return payload.items;

  const cart = getNestedRecord(payload, 'cart');
  if (cart && Array.isArray(cart.items)) return cart.items;

  const data = getNestedRecord(payload, 'data');
  if (data && Array.isArray(data.items)) return data.items;

  return [];
}

function normalizeCartItem(raw: unknown): CartItem | null {
  if (!isRecord(raw)) return null;

  const menuItem = getNestedRecord(raw, 'menuItem');
  const id = asString(raw.id ?? raw._id ?? raw.cartItemId ?? raw.itemId);
  const menuItemId = asString(raw.menuItemId ?? menuItem?.id ?? menuItem?._id);

  if (!id || !menuItemId) return null;

  const name =
    asString(raw.name ?? raw.menuItemName ?? menuItem?.name) ?? 'Unknown item';
  const quantity = asNumber(raw.quantity) ?? 1;
  const unitPrice =
    asNumber(raw.unitPrice ?? raw.price ?? menuItem?.price ?? raw.subtotal) ?? 0;
  const imageUrl = asString(raw.imageUrl ?? raw.image ?? menuItem?.imageUrl);

  return {
    id,
    menuItemId,
    name,
    quantity,
    unitPrice,
    imageUrl,
  };
}

function normalizeCartSnapshot(payload: unknown): CartSnapshot {
  const items = extractRawItems(payload)
    .map((raw) => normalizeCartItem(raw))
    .filter((item): item is CartItem => item !== null);

  return { items };
}

export const cartService = {
  async getMyCart(): Promise<CartSnapshot> {
    const payload = await api.get<unknown>('/cart');
    return normalizeCartSnapshot(payload);
  },

  async addItem(data: AddToCartRequest): Promise<void> {
    console.log('[cartService.addItem] POST /cart/items', data);

    try {
      await api.post<unknown>('/cart/items', data);
      console.log('[cartService.addItem] success', data);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('[cartService.addItem] ApiError', {
          endpoint: '/cart/items',
          data,
          statusCode: error.statusCode,
          message: error.message,
          errors: error.errors,
        });
      } else {
        console.error('[cartService.addItem] unexpected error', {
          endpoint: '/cart/items',
          data,
          error,
        });
      }
      throw error;
    }
  },

  async updateItemQuantity(cartItemId: string, data: UpdateCartItemRequest): Promise<void> {
    await api.patch<unknown>(`/cart/items/${cartItemId}`, data);
  },

  async removeItem(cartItemId: string): Promise<void> {
    await api.delete<unknown>(`/cart/items/${cartItemId}`);
  },
};
