import { useCallback, useEffect, useState } from 'react';
import { staffService, type StaffOrderResponse } from './staff.service';

export function useStaffOrders() {
  const [orders, setOrders] = useState<StaffOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await staffService.getOrders();
      setOrders(data);
    } catch (err: unknown) {
      console.error('[useStaffOrders.fetchOrders] failed', err);
      setError(err instanceof Error ? err.message : 'Failed to load staff orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();

    // Keep queue fresh for staff screen.
    const interval = setInterval(() => {
      void fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}
