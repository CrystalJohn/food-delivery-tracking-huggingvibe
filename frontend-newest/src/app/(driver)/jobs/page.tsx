'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { JobList } from '@/features/driver';
import { PageContainer } from '@/components/layout';
import { driverProfileService } from '@/features/driver/driverProfile.service';

export default function DriverJobsPage() {
  const [toggling, setToggling] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const handleToggleOnline = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (isOnline) {
        await driverProfileService.goOffline();
        setIsOnline(false);
        toast.success('Bạn đã Offline, sẽ không nhận thêm đơn mới.');
      } else {
        await driverProfileService.goOnline();
        setIsOnline(true);
        toast.success('Bạn đang Online, staff có thể assign đơn cho bạn.');
      }
    } catch (e) {
      console.error('Toggle online failed', e);
      toast.error('Không đổi được trạng thái Online. Vui lòng thử lại.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Delivery Jobs</h1>
            <p className="text-gray-600">Track and manage your active deliveries</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleOnline}
              disabled={toggling}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                isOnline
                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>

        <JobList />
      </div>
    </PageContainer>
  );
}


