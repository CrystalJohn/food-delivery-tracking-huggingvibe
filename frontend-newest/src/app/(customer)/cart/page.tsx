'use client';

import { useRouter } from 'next/navigation';
import { CartList, CartSummary, useCart } from '@/features/cart';
import { CheckoutAddressModal } from '@/features/checkout/CheckoutAddressModal';
import { orderService } from '@/features/orders';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const handleCheckoutClick = () => {
    if (items.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }
    setAddressModalOpen(true);
  };

  const handleAddressConfirm = async (
    result: { deliveryLat: number; deliveryLng: number; address?: string } | null,
  ) => {
    setAddressModalOpen(false);
    setLoading(true);
    try {
      const coords =
        result != null
          ? { deliveryLat: result.deliveryLat, deliveryLng: result.deliveryLng }
          : undefined;
      const order = await orderService.checkoutActiveCart('CASH', coords);
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Tạo đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartList />
          {items.length > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              Thanh toán sẽ tạo đơn từ giỏ hàng. Bạn có thể chọn địa chỉ giao hàng trước khi xác nhận.
            </p>
          )}
        </div>
        <div>
          <CartSummary onCheckout={handleCheckoutClick} />
          {loading && <p className="text-center mt-4 text-gray-600">Đang tạo đơn...</p>}
        </div>
      </div>

      <CheckoutAddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onConfirm={handleAddressConfirm}
      />
    </div>
  );
}

