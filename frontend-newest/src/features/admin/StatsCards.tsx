'use client';

import { Card, Spinner } from '@/components/ui';
import { useAdminStats } from './useAdminStats';

export function StatsCards() {
  const { stats, loading } = useAdminStats();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '📦',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: '🔥',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Revenue Today',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Drivers',
      value: stats.activeDrivers,
      icon: '🚗',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
            <div className={`text-4xl ${card.bgColor} p-3 rounded-full`}>
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
