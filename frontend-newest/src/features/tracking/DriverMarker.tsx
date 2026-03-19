'use client';

import type { DriverLocation } from '@/types';

interface DriverMarkerProps {
  location: DriverLocation;
}

export function DriverMarker({ location }: DriverMarkerProps) {
  return (
    <div className="relative">
      <div className="absolute -translate-x-1/2 -translate-y-1/2">
        <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
          🚗
        </div>
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
      </div>
    </div>
  );
}
