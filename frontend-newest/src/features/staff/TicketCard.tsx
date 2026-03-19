'use client';

import { useEffect, useState } from 'react';
import type { StaffTicket } from './ticket.service';
import { Badge } from '@/components/ui';

export type TicketActionType = 'accept' | 'start' | 'complete' | 'reject' | 'assign';

interface TicketCardProps {
  ticket: StaffTicket;
  onAction?: (ticketId: string, action: TicketActionType, driverId?: string) => void;
}

export function TicketCard({ ticket, onAction }: TicketCardProps) {
  const orderStatus = ticket.orderStatus ?? 'PENDING';

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'IN_PROGRESS':
        return <Badge>In Progress</Badge>;
      case 'READY':
        return <Badge variant="default">Ready</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  const itemsList = ticket.items.map((item) => `${item.quantity}x ${item.name}`);
  const previewText = itemsList.slice(0, 2).join(', ');
  const remainder = itemsList.length > 2 ? ` và ${itemsList.length - 2} món khác` : '';

  const statusLabel =
    orderStatus === 'PENDING'
      ? 'Chờ xác nhận'
      : orderStatus === 'CONFIRMED'
      ? 'Đã xác nhận'
      : orderStatus === 'PREPARING'
      ? 'Đang chế biến'
      : orderStatus === 'READY'
      ? 'Sẵn sàng giao'
      : orderStatus === 'CANCELLED'
      ? 'Đã hủy'
      : orderStatus;

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 md:p-6 transition-all hover:border-red-200 hover:shadow-md relative overflow-hidden">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {statusLabel}
          </p>
          <p className="text-sm font-semibold text-gray-900">
            Đơn hàng #{String(ticket.orderId).slice(0, 8)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(ticket.createdAt).toLocaleString('vi-VN')}
          </p>
          {ticket.driverId && (
            <p className="text-xs text-gray-500">
              Tài xế:{' '}
              <span className="font-semibold text-gray-800">
                {ticket.driverName || ticket.driverId}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge()}
        </div>
      </div>

      <div className="mb-3 md:mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 mb-1">Chi tiết món</p>
          <p className="text-gray-700 text-sm line-clamp-2">
            {previewText}
            {remainder}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 mb-1">Ghi chú bếp</p>
          <p className="text-sm text-gray-700">
            {ticket.notes ? ticket.notes : <span className="text-gray-400">Không có</span>}
          </p>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-gray-100 flex flex-wrap gap-2">
        {orderStatus === 'PENDING' && onAction && (
          <>
            <button
              onClick={() => onAction(ticket.id, 'accept')}
              className="flex-1 min-w-[120px] px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium shadow-sm"
            >
              Accept
            </button>
            <button
              onClick={() => onAction(ticket.id, 'reject')}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              Reject
            </button>
          </>
        )}
        {orderStatus === 'CONFIRMED' && onAction && (
          <button
            onClick={() => onAction(ticket.id, 'start')}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium shadow-sm"
          >
            Start cooking
          </button>
        )}
        {orderStatus === 'PREPARING' && onAction && (
          <button
            onClick={() => onAction(ticket.id, 'complete')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            Mark READY
          </button>
        )}
        {orderStatus === 'READY' && onAction && !ticket.driverId && (
          <AssignDriverForm orderId={ticket.id} onAssign={onAction} />
        )}
      </div>
    </div>
  );
}

function AssignDriverForm({
  orderId,
  onAssign,
}: {
  orderId: string;
  onAssign: (ticketId: string, action: TicketActionType, driverId?: string) => void;
}) {
  const [driverId, setDriverId] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<
    { userId: string; fullName: string | null; phone: string | null; isOnline: boolean }[]
  >([]);

  useEffect(() => {
    if (!open || drivers.length > 0 || loading) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const svc = await import('./ticket.service');
        const data = await svc.ticketService.getAvailableDrivers();
        setDrivers(
          data.map((d: import('./staff-order.service').BeAvailableDriver) => ({
            userId: d.userId,
            fullName: d.fullName,
            phone: d.phone,
            isOnline: d.isOnline,
          })),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [open, drivers.length, loading]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
      >
        Assign driver
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 w-full">
      {drivers.length > 0 && (
        <select
          value={driverId}
          onChange={(e) => {
            const selected = e.target.value;
            setDriverId(selected);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50"
          aria-label="Available drivers"
        >
          <option value="">Chọn tài xế khả dụng…</option>
          {drivers.map((d) => (
            <option key={d.userId} value={d.userId}>
              {d.fullName ?? d.userId} {d.phone ? `(${d.phone})` : ''}
            </option>
          ))}
        </select>
      )}
      {loading && (
        <span className="text-xs text-gray-500">Đang tải danh sách tài xế…</span>
      )}
      {error && (
        <span className="text-xs text-red-600">Không tải được danh sách tài xế</span>
      )}
      <button
        type="button"
        onClick={() => {
          if (!driverId) return;
          onAssign(orderId, 'assign', driverId);
          setDriverId('');
          setOpen(false);
        }}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"
      >
        Assign
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
}
