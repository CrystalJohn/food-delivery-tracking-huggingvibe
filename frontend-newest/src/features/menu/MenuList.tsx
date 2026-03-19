'use client';

import { useState } from 'react';
import { useMenu } from './useMenu';
import { MenuItemCard } from './MenuItemCard';
import type { MenuItem } from '@/types';

const CATEGORIES = ['All', 'Pizza', 'Burger', 'Pasta', 'Salad', 'Drinks', 'Dessert'];

interface MenuListProps {
  onAddToCart: (item: MenuItem) => void;
}

export function MenuList({ onAddToCart }: MenuListProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { items, loading, error } = useMenu(selectedCategory === 'All' ? undefined : selectedCategory);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading menu...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
