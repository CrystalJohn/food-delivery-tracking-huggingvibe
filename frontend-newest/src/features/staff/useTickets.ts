'use client';

import { useState, useEffect } from 'react';
import type { StaffTicket } from './ticket.service';
import { ticketService } from './ticket.service';

export function useTickets() {
  const [tickets, setTickets] = useState<StaffTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getQueue();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    
    // Poll every 30 seconds
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  return { tickets, loading, error, refetch: loadTickets };
}
