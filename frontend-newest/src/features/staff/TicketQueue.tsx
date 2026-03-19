'use client';

import { useState } from 'react';
import { TicketCard, type TicketActionType } from './TicketCard';
import { useTickets } from './useTickets';
import { ticketService } from './ticket.service';
import { ClipboardList } from 'lucide-react';
import { Spinner } from '@/components/ui';

export function TicketQueue() {
  const { tickets, loading, error, refetch } = useTickets();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (
    ticketId: string,
    action: TicketActionType,
    driverId?: string
  ) => {
    setProcessing(ticketId);
    try {
      if (action === 'accept') await ticketService.acceptTicket(ticketId);
      if (action === 'start') await ticketService.startCooking(ticketId);
      if (action === 'complete') await ticketService.completeTicket(ticketId);
      if (action === 'reject') await ticketService.rejectTicket(ticketId);
      if (action === 'assign' && driverId) await ticketService.assignDriver(ticketId, driverId);
      await refetch();
    } catch (err) {
      alert(`Failed to ${action}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <ClipboardList className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Chưa có đơn cần xử lý</h2>
        <p className="mt-2 text-sm text-gray-500">Đơn mới sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onAction={processing === ticket.id ? undefined : handleAction}
        />
      ))}
    </div>
  );
}
