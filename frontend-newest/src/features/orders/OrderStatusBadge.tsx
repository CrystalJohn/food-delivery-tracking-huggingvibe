'use client';

import type { OrderStatus } from '@/types';
import { Loader2, CheckCircle, Clock, ChefHat, Truck, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: React.ElementType; animate?: boolean }
> = {
  PENDING: { label: 'Đang xử lý', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Loader2, animate: true },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
  PREPARING: { label: 'Đang chuẩn bị', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: ChefHat },
  READY: { label: 'Đợi tài xế', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Clock },
  DELIVERING: { label: 'Đang giao', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: Truck },
  DELIVERED: { label: 'Hoàn thành', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${config.color} ${config.bgColor}`}
    >
      <Icon className={`w-4 h-4 ${config.animate ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}
