'use client';

import { useState, useEffect } from 'react';
import type { DeliveryJob } from '@/types';
import { driverService } from './driver.service';

export function useDriverJobs() {
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await driverService.getMyJobs();
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return { jobs, loading, error, refetch: loadJobs };
}
