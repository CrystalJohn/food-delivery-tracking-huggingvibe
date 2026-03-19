import type { OrderItem } from './order';

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'READY' | 'REJECTED';

export interface KitchenTicket {
  id: string;
  orderId: string;
  items: OrderItem[];
  status: TicketStatus;
  staffId?: string;
  staffName?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface TicketAction {
  ticketId: string;
  action: 'accept' | 'complete' | 'reject';
  notes?: string;
}
