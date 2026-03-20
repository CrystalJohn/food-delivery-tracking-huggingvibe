'use client';

import { useMemo, useState } from 'react';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { storeService, type StoreDistanceResponse, type StoreLocationInfo } from '@/features/store';
import { toast } from 'react-toastify';

const STORE_LOCATION = {
  name: 'FoodGo',
  address: '27 Đ. Hoàng Diệu 2, Phường Linh Trung, Thủ Đức, Hồ Chí Minh, Việt Nam',
  lat: 10.8602189344313,
  lng: 106.76193389485566,
  deliveryRadiusKm: 30,
};

export default function StoreLocatorPage() {
  const [storeInfo, setStoreInfo] = useState<StoreLocationInfo | null>(null);
  const [distanceInfo, setDistanceInfo] = useState<StoreDistanceResponse | null>(null);
  const [loadingDistance, setLoadingDistance] = useState(false);

  const displayStore = storeInfo ?? STORE_LOCATION;
  const displayName =
    displayStore.name && displayStore.name !== 'Main Store' ? displayStore.name : 'FoodGo';

  const mapUrl = useMemo(
    () =>
      `https://www.google.com/maps/search/?api=1&query=${displayStore.lat},${displayStore.lng}`,
    [displayStore.lat, displayStore.lng],
  );

  const embedUrl = useMemo(
    () =>
      `https://maps.google.com/maps?q=${displayStore.lat},${displayStore.lng}&z=15&output=embed`,
    [displayStore.lat, displayStore.lng],
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trinh duyet khong ho tro lay vi tri.');
      return;
    }

    setLoadingDistance(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const response = await storeService.getStoreDistance(payload);
          setStoreInfo(response.store);
          setDistanceInfo(response);
        } catch (error) {
          console.error('[StoreLocator] getStoreDistance failed', error);
          toast.error('Khong the tinh khoang cach. Vui long thu lai.');
        } finally {
          setLoadingDistance(false);
        }
      },
      (error) => {
        console.warn('[StoreLocator] geolocation error', error);
        toast.error('Khong lay duoc vi tri. Vui long bat quyen Location.');
        setLoadingDistance(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />
      <main className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Store Locator</h1>
          <p className="text-lg text-gray-600">
            Vi tri nha hang va khoang cach giao hang se duoc tinh tu he thong backend.
          </p>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">Store</p>
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-gray-700">{displayStore.address}</p>
                <div className="text-sm text-gray-500">
                  Delivery radius: {distanceInfo?.deliveryRadiusKm ?? STORE_LOCATION.deliveryRadiusKm} km
                </div>
                {distanceInfo && (
                  <div className="text-sm text-gray-600">
                    Khoang cach tu vi tri cua ban: {distanceInfo.distanceKm} km
                  </div>
                )}
                {distanceInfo && (
                  <div
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      distanceInfo.withinRadius
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {distanceInfo.withinRadius ? 'Trong pham vi giao hang' : 'Ngoai pham vi giao hang'}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={loadingDistance}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {loadingDistance ? 'Dang tinh khoang cach...' : 'Tinh khoang cach tu vi tri cua ban'}
                </button>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative h-[360px] w-full">
              <iframe
                title="FoodGo Map"
                src={embedUrl}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
