import { api } from '@/lib/api';
import type { DeliveryJob } from '@/types';

export const driverService = {
  async getAvailableJobs(): Promise<DeliveryJob[]> {
    return api.get<DeliveryJob[]>('/driver/jobs/available');
  },

  async getMyJobs(): Promise<DeliveryJob[]> {
    return api.get<DeliveryJob[]>('/driver/jobs/my');
  },

  async acceptJob(jobId: string): Promise<DeliveryJob> {
    return api.patch<DeliveryJob>(`/driver/jobs/${jobId}/accept`);
  },

  async pickupJob(jobId: string): Promise<DeliveryJob> {
    return api.patch<DeliveryJob>(`/driver/jobs/${jobId}/pickup`);
  },

  async deliverJob(jobId: string): Promise<DeliveryJob> {
    return api.patch<DeliveryJob>(`/driver/jobs/${jobId}/deliver`);
  },
};
