'use client';

import { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const apiKey = process.env.NEXT_PUBLIC_MAP_API_KEY ?? '';

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | undefined;
  hasApiKey: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue | null>(null);

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  const value: GoogleMapsContextValue = {
    isLoaded,
    loadError,
    hasApiKey: Boolean(apiKey && apiKey.trim().length > 0),
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const ctx = useContext(GoogleMapsContext);
  return ctx;
}
