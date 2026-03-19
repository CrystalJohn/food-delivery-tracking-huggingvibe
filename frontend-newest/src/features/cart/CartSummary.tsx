// Chức năng của CartSummary:
// Hiển thị số lượng items, subtotal (tổng tiền item).
// Tính và hiển thị tổng cuối cùng
// Nút “Checkout / Place order” gọi callback
'use client';

import { useCart } from './CartContext';

interface CartSummaryProps {
  onCheckout?: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const { items, totalAmount, itemCount } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Items ({itemCount})</span>
          <span className="font-medium">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium">$5.00</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-red-600">${(totalAmount + 5).toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={onCheckout}
        className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
