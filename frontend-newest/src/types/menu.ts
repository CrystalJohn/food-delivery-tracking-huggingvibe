export interface MenuItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
}

export interface MenuCategory {
  id: string | number;
  name: string;
  items: MenuItem[];
}
