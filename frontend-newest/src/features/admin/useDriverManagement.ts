'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  driverAdminService,
  type CreateDriverRequest,
  type DriverAccount,
} from './driver.service';

export function useDriverManagement() {
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await driverAdminService.getDrivers();
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai danh sach tai xe.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDriver = useCallback(async (payload: CreateDriverRequest) => {
    setCreating(true);
    try {
      const createdDriver = await driverAdminService.createDriver(payload);
      setDrivers((previous) => {
        const next = previous.filter((driver) => {
          if (driver.userId && createdDriver.userId) {
            return driver.userId !== createdDriver.userId;
          }
          return driver.email !== createdDriver.email;
        });
        return [createdDriver, ...next];
      });
      return createdDriver;
    } finally {
      setCreating(false);
    }
  }, []);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

  return {
    drivers,
    loading,
    creating,
    error,
    refetch: loadDrivers,
    createDriver,
  };
}
