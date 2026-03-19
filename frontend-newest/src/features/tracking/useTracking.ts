'use client';

import { useEffect, useState } from 'react';
import type { DeliveryTracking, DriverLocation } from '@/types';

// Socket.io client instance (to be initialized)
let socket: any = null;

export function useTracking(orderId: string) {
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // TODO: Initialize socket.io client
    // import { io } from 'socket.io-client';
    // socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000');
    
    // socket.on('connect', () => {
    //   setConnected(true);
    //   socket.emit('track_order', { orderId });
    // });

    // socket.on('tracking_update', (data: DeliveryTracking) => {
    //   setTracking(data);
    // });

    // socket.on('driver_location', (location: DriverLocation) => {
    //   setTracking((prev) => prev ? { ...prev, driverLocation: location } : null);
    // });

    // socket.on('disconnect', () => {
    //   setConnected(false);
    // });

    return () => {
      // socket?.disconnect();
    };
  }, [orderId]);

  return { tracking, connected };
}
