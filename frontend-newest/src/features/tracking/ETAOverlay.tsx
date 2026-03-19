'use client';

import { estimateMinutesToArrival } from './eta';

interface ETAOverlayProps {
  driverLocation?: { lat: number; lng: number } | null;
  deliveryLocation?: { lat: number; lng: number } | null;
}

export function ETAOverlay({ driverLocation, deliveryLocation }: ETAOverlayProps) {
  const minutes =
    driverLocation && deliveryLocation
      ? estimateMinutesToArrival(driverLocation, deliveryLocation)
      : null;

  return (
    <div className="absolute top-3 left-3 z-10 rounded-lg bg-white/95 px-3 py-2 shadow-md border border-gray-200">
      <p className="text-xs font-medium text-gray-600">Còn bao lâu tới nơi</p>
      <p className="text-sm font-semibold text-gray-900">
        {minutes != null ? `~${minutes} phút` : 'Chưa có đủ vị trí'}
      </p>
    </div>
  );
}
