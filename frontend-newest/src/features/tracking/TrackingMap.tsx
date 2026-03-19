'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DriverLocation } from '@/types';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { useGoogleMaps } from '@/lib/GoogleMapsProvider';

interface TrackingMapProps {
  driverLocation?: DriverLocation;
  deliveryLocation?: { lat: number; lng: number } | null;
  deliveryAddress: string;
}

export function TrackingMap({
  driverLocation,
  deliveryLocation,
  deliveryAddress,
}: TrackingMapProps) {
  const mapsContext = useGoogleMaps();
  const hasApiKey = mapsContext?.hasApiKey ?? false;
  const isLoaded = mapsContext?.isLoaded ?? false;
  const loadError = mapsContext?.loadError;

  const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[] | null>(null);

  const center = useMemo(() => {
    if (driverLocation) return { lat: driverLocation.lat, lng: driverLocation.lng };
    if (deliveryLocation) return { lat: deliveryLocation.lat, lng: deliveryLocation.lng };
    return { lat: 10.7769, lng: 106.7009 };
  }, [driverLocation, deliveryLocation]);

  useEffect(() => {
    if (!isLoaded || !driverLocation || !deliveryLocation || !window.google?.maps) {
      queueMicrotask(() => setRoutePath(null));
      return;
    }

    let cancelled = false;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: { lat: driverLocation.lat, lng: driverLocation.lng },
        destination: deliveryLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (cancelled) return;
        if (status === window.google.maps.DirectionsStatus.OK && result?.routes?.[0]?.overview_path) {
          const path = result.routes[0].overview_path.map((p) => ({
            lat: p.lat(),
            lng: p.lng(),
          }));
          setRoutePath(path);
        } else {
          setRoutePath(null);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isLoaded, driverLocation, deliveryLocation]);

  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      {!hasApiKey && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 p-4 text-center">
          <div>
            <p className="font-medium">Missing Google Maps API key</p>
            <p className="text-sm mt-1">
              Set <code className="px-1 py-0.5 bg-white border rounded">NEXT_PUBLIC_MAP_API_KEY</code> in
              <code className="px-1 py-0.5 bg-white border rounded ml-1">frontend/.env.local</code>.
            </p>
          </div>
        </div>
      )}

      {hasApiKey && loadError && (
        <div className="absolute inset-0 flex items-center justify-center text-red-600 p-4 text-center">
          Failed to load Google Maps.
        </div>
      )}

      {hasApiKey && isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={14}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            gestureHandling: 'greedy',
          }}
        >
          {deliveryLocation && (
            <Marker
              position={deliveryLocation}
              label={{ text: 'D', color: '#ffffff', fontWeight: '700' }}
              title={`Delivery: ${deliveryAddress}`}
            />
          )}
          {driverLocation && (
            <Marker
              position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
              label={{ text: 'R', color: '#ffffff', fontWeight: '700' }}
              title="Driver"
            />
          )}
          {routePath && routePath.length > 0 && (
            <Polyline
              path={routePath}
              options={{
                strokeColor: '#dc2626',
                strokeOpacity: 0.9,
                strokeWeight: 4,
              }}
            />
          )}
        </GoogleMap>
      )}
    </div>
  );
}
