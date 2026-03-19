'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/lib/GoogleMapsProvider';
import { MapPin, Navigation, X } from 'lucide-react';

export interface CheckoutAddressResult {
  deliveryLat: number;
  deliveryLng: number;
  address?: string;
}

interface CheckoutAddressModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (result: CheckoutAddressResult | null) => void;
}

export function CheckoutAddressModal({ open, onClose, onConfirm }: CheckoutAddressModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  const mapsContext = useGoogleMaps();
  const isPlacesLoaded = mapsContext?.isLoaded ?? false;

  useEffect(() => {
    if (!open) {
      setCoords(null);
      setAddressInput('');
      return;
    }
    if (!isPlacesLoaded || !inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: ['vn'] },
      fields: ['geometry', 'formatted_address'],
    });

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (location) {
        setCoords({
          lat: location.lat(),
          lng: location.lng(),
          address: place.formatted_address ?? undefined,
        });
      }
    });

    autocompleteRef.current = autocomplete;
    return () => {
      window.google?.maps?.event?.clearInstanceListeners(autocomplete);
      autocompleteRef.current = null;
    };
  }, [open, isPlacesLoaded]);

  const handleUseMyLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ lấy vị trí.');
      setLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Vị trí hiện tại',
        });
        setLoadingLocation(false);
      },
      () => {
        alert('Không lấy được vị trí. Vui lòng bật quyền Location hoặc nhập địa chỉ.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
    );
  };

  const handleConfirm = () => {
    if (coords) {
      onConfirm({
        deliveryLat: coords.lat,
        deliveryLng: coords.lng,
        address: coords.address,
      });
    }
    onClose();
  };

  const handleSkip = () => {
    onConfirm(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[200]" onClick={onClose} aria-hidden />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Chọn &quot;Lấy vị trí hiện tại&quot; hoặc nhập địa chỉ để gợi ý và lấy tọa độ chính xác.
          </p>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={loadingLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-100 bg-red-50 text-red-700 font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <Navigation className="w-5 h-5" />
            {loadingLocation ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
          </button>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hoặc nhập địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Nhập địa chỉ, chọn gợi ý..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            {!isPlacesLoaded && mapsContext?.hasApiKey && (
              <p className="text-xs text-amber-600 mt-1">Đang tải gợi ý địa chỉ...</p>
            )}
          </div>

          {coords && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              Đã chọn: {coords.address ?? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
            </p>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
          >
            Bỏ qua
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!coords}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </>
  );
}
