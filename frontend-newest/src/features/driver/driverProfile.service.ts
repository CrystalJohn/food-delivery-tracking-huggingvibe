import { api } from '@/lib/api';

export const driverProfileService = {
  async goOnline(): Promise<void> {
    await api.patch('/driver/profile/online');
  },

  async goOffline(): Promise<void> {
    await api.patch('/driver/profile/offline');
  },
};

