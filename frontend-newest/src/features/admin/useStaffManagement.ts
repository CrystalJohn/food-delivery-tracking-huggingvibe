'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  staffAdminService,
  type CreateStaffRequest,
  type StaffAccount,
} from './staff.service';

export function useStaffManagement() {
  const [staffs, setStaffs] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaffs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffAdminService.getStaffs();
      setStaffs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaff = useCallback(async (payload: CreateStaffRequest) => {
    setCreating(true);
    try {
      const createdStaff = await staffAdminService.createStaff(payload);
      setStaffs((previous) => {
        const next = previous.filter((staff) => {
          if (staff.userId && createdStaff.userId) {
            return staff.userId !== createdStaff.userId;
          }
          return staff.email !== createdStaff.email;
        });
        return [createdStaff, ...next];
      });
      return createdStaff;
    } finally {
      setCreating(false);
    }
  }, []);

  useEffect(() => {
    void loadStaffs();
  }, [loadStaffs]);

  return {
    staffs,
    loading,
    creating,
    error,
    refetch: loadStaffs,
    createStaff,
  };
}

