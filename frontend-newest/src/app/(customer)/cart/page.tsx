'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartList, CartSummary, useCart } from '@/features/cart';
import { orderService } from '@/features/orders';

export default function CartPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckoutClick = async () => {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const order = await orderService.checkoutActiveCart({
        paymentMethod: 'CASH',
        deliveryAddressMode: 'DEFAULT',
      });
      await clearCart();
      router.push(`/orders/${order.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CartList />
          {items.length > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              Checkout will create an order using your default address saved in profile.
            </p>
          )}
        </div>
        <div>
          <CartSummary
            onCheckout={() => {
              void handleCheckoutClick();
            }}
          />
          {loading && <p className="mt-4 text-center text-gray-600">Processing order...</p>}
        </div>
      </div>
    </div>
  );
}
