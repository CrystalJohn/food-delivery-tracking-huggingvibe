'use client';

import { useState, useEffect } from 'react';
import type { KitchenTicket } from '@/types';
import { staffService } from './staff.service';

export function useStaffQueue() {
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffService.getQueue();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return { tickets, loading, error, refetch: loadQueue };
}
