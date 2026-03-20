'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useGoogleMaps } from '@/lib/GoogleMapsProvider';

const currencyFormatter = new Intl.NumberFormat('vi-VN');
export type PaymentMethod = 'CASH' | 'WALLET';
export type DeliveryAddressOption = 'DEFAULT' | 'CUSTOM';

export interface CartCheckoutPayload {
  paymentMethod: PaymentMethod;
  addressOption: DeliveryAddressOption;
  customAddress?: string;
  customAddressLat?: number;
  customAddressLng?: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  defaultAddress?: string;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  onCheckout?: (payload: CartCheckoutPayload) => void | Promise<void>;
  checkoutLoading?: boolean;
}

export function CartSidebar({
  isOpen,
  onClose,
  items = [],
  defaultAddress = '',
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  checkoutLoading = false,
}: CartSidebarProps) {
  const mapsContext = useGoogleMaps();
  const isPlacesLoaded = mapsContext?.isLoaded ?? false;
  const hasApiKey = mapsContext?.hasApiKey ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [addressOption, setAddressOption] = useState<DeliveryAddressOption>('DEFAULT');
  const [customAddress, setCustomAddress] = useState('');
  const [customAddressCoords, setCustomAddressCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const trimmedCustomAddress = customAddress.trim();
  const customAddressTooShort =
    addressOption === 'CUSTOM' && trimmedCustomAddress.length > 0 && trimmedCustomAddress.length < 5;
  const customAddressRequired =
    addressOption === 'CUSTOM' && trimmedCustomAddress.length === 0;
  const customCoordsRequired = addressOption === 'CUSTOM' && !customAddressCoords;
  const checkoutDisabled =
    checkoutLoading ||
    !onCheckout ||
    customAddressTooShort ||
    customAddressRequired ||
    customCoordsRequired;

  useEffect(() => {
    if (!isOpen || !isPlacesLoaded || !inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: ['vn'] },
      fields: ['geometry', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      const formattedAddress = place.formatted_address ?? inputRef.current?.value ?? '';

      setCustomAddress(formattedAddress);
      setLocationError(null);

      if (!location) {
        setCustomAddressCoords(null);
        return;
      }

      setCustomAddressCoords({
        lat: location.lat(),
        lng: location.lng(),
      });
    });

    return () => {
      window.google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, [isOpen, isPlacesLoaded]);

  const mapGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission is denied. Please allow location access and try again.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable. Please try selecting an address suggestion.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return error.message || 'Unable to get current location.';
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('This browser does not support geolocation.');
      return;
    }

    setIsResolvingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let resolvedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        if (window.google?.maps?.Geocoder) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            const response = await geocoder.geocode({ location: { lat, lng } });
            const formattedAddress = response.results[0]?.formatted_address;
            if (formattedAddress) {
              resolvedAddress = formattedAddress;
            }
          } catch (error) {
            console.warn('[CartSidebar] reverse geocoding failed', error);
          }
        }

        setCustomAddress(resolvedAddress);
        setCustomAddressCoords({ lat, lng });
        setLocationError(null);
        setIsResolvingLocation(false);
      },
      (error) => {
        setLocationError(mapGeolocationErrorMessage(error));
        setCustomAddressCoords(null);
        setIsResolvingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-gray-50 flex flex-col z-[110] shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-500">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Start adding your favorite meals</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
                    >
                      <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                          <button
                            onClick={() => onRemoveItem?.(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-red-600 text-sm">
                            {currencyFormatter.format(item.price * item.quantity)} VND
                          </span>
                          <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                            <button
                              onClick={() => onUpdateQuantity?.(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-white rounded-full shadow-sm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-white bg-red-600 hover:bg-red-700 rounded-full shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="bg-white border-t border-gray-100 p-4 pb-8 space-y-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="text-2xl font-black text-red-600">
                    {currencyFormatter.format(totalAmount)} VND
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Delivery Address</p>
                  <button
                    type="button"
                    onClick={() => setAddressOption('DEFAULT')}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      addressOption === 'DEFAULT'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        checked={addressOption === 'DEFAULT'}
                        onChange={() => setAddressOption('DEFAULT')}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Default address (Profile)</p>
                        <p className="mt-1 text-xs text-gray-600">
                          {defaultAddress.trim().length > 0
                            ? defaultAddress
                            : 'Default address will be used from your profile on backend.'}
                        </p>
                      </div>
                    </div>
                  </button>

                  <div
                    className={`rounded-xl border p-3 transition-colors ${
                      addressOption === 'CUSTOM'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        checked={addressOption === 'CUSTOM'}
                        onChange={() => setAddressOption('CUSTOM')}
                        className="mt-1 h-4 w-4"
                      />
                      <span className="text-sm font-semibold text-gray-800">Địa chỉ muốn giao</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={addressOption !== 'CUSTOM' || isResolvingLocation}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Navigation className="h-4 w-4" />
                      {isResolvingLocation ? 'Getting your location...' : 'My Location'}
                    </button>
                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={customAddress}
                        onChange={(e) => {
                          setCustomAddress(e.target.value);
                          setCustomAddressCoords(null);
                          setLocationError(null);
                        }}
                        disabled={addressOption !== 'CUSTOM'}
                        placeholder="Nhập địa chỉ muốn giao"
                        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    {addressOption === 'CUSTOM' && customAddressCoords && (
                      <p className="mt-1 text-xs text-green-700">
                        Lat: {customAddressCoords.lat.toFixed(6)} | Lng: {customAddressCoords.lng.toFixed(6)}
                      </p>
                    )}
                    {customAddressRequired && (
                      <p className="mt-1 text-xs text-red-600">
                        Please enter custom delivery address.
                      </p>
                    )}
                    {customAddressTooShort && (
                      <p className="mt-1 text-xs text-red-600">
                        Custom address must be at least 5 characters.
                      </p>
                    )}
                    {customCoordsRequired && !customAddressRequired && !customAddressTooShort && (
                      <p className="mt-1 text-xs text-red-600">
                        Please choose an address suggestion or use My Location so system can get coordinates.
                      </p>
                    )}
                    {locationError && addressOption === 'CUSTOM' && (
                      <p className="mt-1 text-xs text-red-600">{locationError}</p>
                    )}
                    {addressOption === 'CUSTOM' && hasApiKey && !isPlacesLoaded && (
                      <p className="mt-1 text-xs text-amber-700">Loading address suggestions...</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        paymentMethod === 'CASH'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      CASH
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('WALLET')}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        paymentMethod === 'WALLET'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      WALLET
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (onCheckout) {
                      void onCheckout({
                        paymentMethod,
                        addressOption,
                        customAddress:
                          addressOption === 'CUSTOM' ? trimmedCustomAddress : undefined,
                        customAddressLat:
                          addressOption === 'CUSTOM' ? customAddressCoords?.lat : undefined,
                        customAddressLng:
                          addressOption === 'CUSTOM' ? customAddressCoords?.lng : undefined,
                      });
                    }
                  }}
                  disabled={checkoutDisabled}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-6 text-lg font-bold"
                >
                  {checkoutLoading ? 'Processing...' : 'Checkout Now >'}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
