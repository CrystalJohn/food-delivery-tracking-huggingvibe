'use client';

import Link from 'next/link';
import { useState } from 'react';
import { JobCard } from './JobCard';
import { useJobs } from './useJobs';
import { jobService } from './job.service';
import { Spinner } from '@/components/ui';

export function JobList() {
  const { jobs, loading, error, refetch } = useJobs();
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const handleAction = async (job: import('@/types').DeliveryJob, action: 'pickup' | 'deliver') => {
    setProcessing(job.id);
    try {
      // Luôn cố gắng gửi vị trí hiện tại trước khi đổi trạng thái
      try {
        await jobService.updateMyLocation(job.orderId);
      } catch {
        // Bỏ qua lỗi GPS / network, vẫn cho phép đổi trạng thái đơn
      }

      if (action === 'pickup') await jobService.pickupJob(job.orderId);
      if (action === 'deliver') await jobService.deliverJob(job.orderId);
      await refetch();
    } catch (err) {
      alert(`Failed to ${action} job: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
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

  const activeJobs = jobs.filter((j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED');
  const historyJobs = jobs.filter((j) => j.status === 'DELIVERED' || j.status === 'CANCELLED');
  const displayJobs = activeTab === 'active' ? activeJobs : historyJobs;

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 mb-2 bg-gray-100/50 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'active'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đang xử lý ({activeJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Lịch sử ({historyJobs.length})
        </button>
      </div>

      {displayJobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">
            {activeTab === 'active' ? 'Không có đơn đang giao' : 'Chưa có lịch sử giao hàng'}
          </p>
          {activeTab === 'active' && (
            <p className="text-sm mt-2">Chờ staff assign đơn cho bạn.</p>
          )}
        </div>
      )}

      {displayJobs.length > 0 && (
        <div className="space-y-4">
          {displayJobs.map((job) => (
            <div key={job.id}>
              <JobCard
                job={job}
                onAction={
                  activeTab === 'active' && processing !== job.id ? handleAction : undefined
                }
              />
              <Link
                href={`/jobs/${job.orderId}`}
                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
              >
                View detail →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
