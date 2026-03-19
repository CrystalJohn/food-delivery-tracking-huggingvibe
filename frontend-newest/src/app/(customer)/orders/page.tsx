'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderList, useOrders } from '@/features/orders';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error, refetch } = useOrders();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); 

    return () => clearInterval(interval);
  }, [refetch]);

  const handleSelectOrder = (order: Order) => {
    router.push(`/orders/${order.id}`);
  };

  const activeOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const historyOrders = orders.filter((o) => ['DELIVERED', 'CANCELLED'].includes(o.status));

  const displayOrders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>

      <div className="flex space-x-1 mb-6 bg-gray-100/50 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'active'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đang xử lý ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sử ({historyOrders.length})
        </button>
      </div>

      {loading && !orders.length && (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      )}

      {error && <p className="text-center text-red-600 py-4">{error}</p>}

      {!error && (orders.length > 0 || !loading) && (
        <OrderList 
          orders={displayOrders} 
          onSelectOrder={handleSelectOrder}
          refetch={refetch}
        />
      )}
    </div>
  );
}
