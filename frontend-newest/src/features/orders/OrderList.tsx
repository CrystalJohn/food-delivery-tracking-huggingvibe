'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ChevronRight, ShoppingBag } from 'lucide-react';
import type { Order } from '@/types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { orderService } from './order.service';
import { Spinner } from '@/components/ui/Spinner';

const currencyFormatter = new Intl.NumberFormat('vi-VN');

interface OrderListProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
  refetch?: () => void;
}

function formatDate(value?: string): string {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function OrderList({ orders, onSelectOrder, refetch }: OrderListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    
    try {
      setCancellingId(orderId);
      await orderService.cancelOrder(orderId);
      if (refetch) refetch();
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      alert('Không thể hủy đơn hàng, vui lòng thử lại sau.');
    } finally {
      setCancellingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <ClipboardList className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900">Không có đơn hàng nào</h2>
        <p className="mt-2 text-sm text-gray-500">
          Hãy bắt đầu với món yêu thích của bạn ngay hôm nay.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 shadow-sm hover:shadow active:scale-95"
          >
            Khám phá menu
          </Link>
          <Link
            href="/promotions"
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
          >
            Xem khuyến mãi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        // Prepare Item Preview text
        const itemsList = order.items.map(item => `${item.quantity}x ${item.name}`);
        const previewText = itemsList.slice(0, 2).join(', ');
        const remainder = itemsList.length > 2 ? ` và ${itemsList.length - 2} món khác` : '';

        return (
          <div
            key={order.id}
            onClick={() => onSelectOrder?.(order)}
            className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-red-100 hover:shadow-md relative overflow-hidden"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Đơn hàng #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
               <ShoppingBag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
               <p className="text-gray-700 text-sm line-clamp-2">
                 <span className="font-medium text-gray-900">Chi tiết:</span> {previewText}{remainder}
               </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 mb-0.5">Tổng thanh toán</span>
                   <p className="text-lg font-bold text-red-600">
                    {currencyFormatter.format(order.totalAmount)} đ
                   </p>
                </div>

                {['PENDING', 'CONFIRMED'].includes(order.status) && (
                  <button
                    onClick={(e) => handleCancel(e, order.id)}
                    disabled={cancellingId === order.id}
                    className="px-3.5 py-1.5 text-sm font-medium text-gray-500 hover:text-red-700 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {cancellingId === order.id && <Spinner className="w-3 h-3 text-red-600" />}
                    Hủy đơn
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">
                Chi tiết
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
