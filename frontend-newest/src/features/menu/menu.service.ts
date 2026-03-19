import { api } from '@/lib/api';
import type { MenuItem } from '@/types';

export const menuService = {
  // GET /menu  
  async getAll(): Promise<MenuItem[]> {
    return api.get<MenuItem[]>('/menu');
  },

  // GET /menu/:id
  async getById(id: string): Promise<MenuItem> {
    return api.get<MenuItem>(`/menu/${id}`);
  },

  // GET /menu?category=...
  async getByCategory(category: string): Promise<MenuItem[]> {
    return api.get<MenuItem[]>(`/menu?category=${category}`);
  },
};
