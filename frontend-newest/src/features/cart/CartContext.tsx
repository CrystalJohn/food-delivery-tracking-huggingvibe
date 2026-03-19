'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MenuItem } from '@/types';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/features/auth';
import { cartService, type CartItem } from './cart.service';

interface CartContextValue {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (menuItem: MenuItem, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function toPositiveInt(value: string | number): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function toValidQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.floor(quantity));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const cart = await cartService.getMyCart();
      setItems(cart.items);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        console.error('[CartContext.refreshCart] 404 customer/cart not found', {
          statusCode: error.statusCode,
          message: error.message,
        });
        setItems([]);
      } else {
        console.error('[CartContext.refreshCart] failed', error);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void refreshCart();
  }, [authLoading, refreshCart]);

  const addItem = useCallback(
    async (menuItem: MenuItem, quantity = 1) => {
      if (!isAuthenticated) {
        throw new Error('AUTH_REQUIRED');
      }

      const menuItemId = toPositiveInt(menuItem.id);
      if (!menuItemId) {
        console.error('[CartContext.addItem] invalid menuItem.id', {
          menuItemId: menuItem.id,
          menuItem,
        });
        throw new Error(`Invalid menu item id: ${String(menuItem.id)}`);
      }

      const requestPayload = {
        menuItemId,
        quantity: toValidQuantity(quantity),
      };

      console.log('[CartContext.addItem] start', {
        menuItem,
        requestPayload,
      });

      try {
        await cartService.addItem(requestPayload);
        await refreshCart();
        console.log('[CartContext.addItem] success', requestPayload);
      } catch (error) {
        if (error instanceof ApiError) {
          console.error('[CartContext.addItem] ApiError', {
            statusCode: error.statusCode,
            message: error.message,
            errors: error.errors,
            requestPayload,
          });
        } else {
          console.error('[CartContext.addItem] unexpected error', {
            error,
            requestPayload,
          });
        }
        throw error;
      }
    },
    [isAuthenticated, refreshCart],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        return;
      }

      await cartService.removeItem(id);
      await refreshCart();
    },
    [isAuthenticated, refreshCart],
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(id);
        return;
      }

      if (!isAuthenticated) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
        );
        return;
      }

      await cartService.updateItemQuantity(id, { quantity: toValidQuantity(quantity) });
      await refreshCart();
    },
    [isAuthenticated, refreshCart, removeItem],
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    await Promise.all(items.map((item) => cartService.removeItem(item.id)));
    await refreshCart();
  }, [isAuthenticated, items, refreshCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        itemCount,
        loading,
        refreshCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
