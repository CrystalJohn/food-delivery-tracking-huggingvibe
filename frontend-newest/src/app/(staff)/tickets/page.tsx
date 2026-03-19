'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth';
import { StaffOrderQueue } from '@/features/staff';

export default function StaffOrdersPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kitchen Queue</h1>
            <p className="mt-1 text-gray-600">
              Logged in as {user?.name || user?.email || 'Staff'} ({user?.role || 'STAFF'})
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full md:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <StaffOrderQueue />
      </div>
    </PageContainer>
  );
}