'use client';

import { useState, useEffect } from 'react';
import type { MenuItem } from '@/types';
import { menuService } from './menu.service';

// Class này quản lí fetch/loading/error. Dùng kiểu reuseable
export function useMenu(category?: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = category
          ? await menuService.getByCategory(category)
          : await menuService.getAll();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [category]); // chạy lại useEffect mỗi khi category thay đổi

  return { items, loading, error };
}
