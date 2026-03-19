'use client';

import { useCart } from './CartContext';

export function CartList() {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-600">${item.unitPrice.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <p className="font-bold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-600 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
