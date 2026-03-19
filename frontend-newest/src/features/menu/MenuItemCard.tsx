'use client';

import Image from 'next/image';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {item.imageUrl && (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover rounded-md mb-3"
        />
      )}
      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
      {item.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
      )}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xl font-bold text-red-600">${item.price.toFixed(2)}</span>
        <button
          onClick={() => onAddToCart(item)}
          disabled={!item.available}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {item.available ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}
