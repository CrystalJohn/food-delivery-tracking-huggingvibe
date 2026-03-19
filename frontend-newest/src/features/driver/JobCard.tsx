'use client';

import type { DeliveryJob } from '@/types';
import { Badge, Card } from '@/components/ui';

interface JobCardProps {
  job: DeliveryJob;
  onAction?: (job: DeliveryJob, action: 'pickup' | 'deliver') => void;
}

export function JobCard({ job, onAction }: JobCardProps) {
  const getStatusBadge = () => {
    switch (job.status) {
      case 'PENDING':
        return <Badge variant="default">Chờ nhận</Badge>;
      case 'ASSIGNED':
        return <Badge variant="outline">Được gán</Badge>;
      case 'PICKED_UP':
        return <Badge variant="secondary">Đang giao</Badge>;
      case 'DELIVERED':
        return <Badge variant="default">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Đã hủy</Badge>;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">Order #{job.orderId.slice(0, 8)}</h3>
          <p className="text-sm text-gray-600">
            {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">📍 Pickup:</p>
          <p className="text-sm text-gray-900">{job.pickupAddress}</p>
        </div>
        {job.deliveryAddress && (
          <div>
            <p className="text-sm font-medium text-gray-700">🏠 Delivery:</p>
            <p className="text-sm text-gray-900">{job.deliveryAddress}</p>
          </div>
        )}
        {job.customerName && (
          <div>
            <p className="text-sm font-medium text-gray-700">👤 Customer:</p>
            <p className="text-sm text-gray-900">
              {job.customerName}
              {job.customerPhone && ` • ${job.customerPhone}`}
            </p>
          </div>
        )}
        {job.estimatedTime && (
          <div>
            <p className="text-sm font-medium text-gray-700">⏱️ Estimated Time:</p>
            <p className="text-sm text-gray-900">{job.estimatedTime} mins</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {job.status === 'ASSIGNED' && onAction && (
          <button
            onClick={() => onAction(job, 'pickup')}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-medium"
          >
            Đã lấy hàng
          </button>
        )}
        {job.status === 'PICKED_UP' && onAction && (
          <button
            onClick={() => onAction(job, 'deliver')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
          >
            Đã giao xong
          </button>
        )}
      </div>
    </Card>
  );
}
