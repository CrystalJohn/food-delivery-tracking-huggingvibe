'use client';

import { useParams } from 'next/navigation';
import { OrderDetail, useOrder } from '@/features/orders';

import { useEffect, useState } from 'react';
import { orderService } from '@/features/orders/order.service';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { order, loading, error, refetch } = useOrder(orderId);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      void refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [orderId, refetch]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && <p className="text-center text-gray-600">Loading order...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {order && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={cancelling}
                onClick={async () => {
                  if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
                  try {
                    setCancelling(true);
                    await orderService.cancelOrder(order.id);
                    await refetch();
                  } catch {
                    alert('Không thể hủy đơn hàng, vui lòng thử lại sau.');
                  } finally {
                    setCancelling(false);
                  }
                }}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
              </button>
            </div>
          )}
          <OrderDetail order={order} />
        </div>
      )}
    </div>
  );
}
