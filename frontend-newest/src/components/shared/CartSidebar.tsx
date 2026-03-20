'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { storeService, type StoreDistanceResponse } from '@/features/store';

const currencyFormatter = new Intl.NumberFormat('vi-VN');
export type PaymentMethod = 'CASH' | 'WALLET';

export interface CartCheckoutPayload {
  paymentMethod: PaymentMethod;
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
  defaultAddressLat?: number;
  defaultAddressLng?: number;
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
  defaultAddressLat,
  defaultAddressLng,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  checkoutLoading = false,
}: CartSidebarProps) {
  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [distanceInfo, setDistanceInfo] = useState<StoreDistanceResponse | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState('');

  const hasCoords = defaultAddressLat != null && defaultAddressLng != null;
  const isWithinRadius = distanceInfo?.withinRadius ?? false;
  const checkoutDisabled =
    checkoutLoading ||
    !onCheckout ||
    !hasCoords ||
    (distanceInfo ? !isWithinRadius : false);

  useEffect(() => {
    if (!isOpen || !hasCoords) {
      setDistanceInfo(null);
      setDistanceError('');
      return;
    }

    let canceled = false;
    const fetchDistance = async () => {
      setDistanceLoading(true);
      setDistanceError('');
      try {
        const response = await storeService.getStoreDistance({
          lat: defaultAddressLat!,
          lng: defaultAddressLng!,
        });
        if (!canceled) {
          setDistanceInfo(response);
        }
      } catch (error) {
        console.error('[CartSidebar] store distance fetch failed', error);
        if (!canceled) {
          setDistanceError('Khong the kiem tra khoang cach. Vui long thu lai.');
        }
      } finally {
        if (!canceled) {
          setDistanceLoading(false);
        }
      }
    };

    void fetchDistance();

    return () => {
      canceled = true;
    };
  }, [isOpen, hasCoords, defaultAddressLat, defaultAddressLng]);

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
                  <div className="w-full rounded-xl border border-red-600 bg-red-50 p-3 text-left">
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        checked
                        readOnly
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
                  </div>
                  {distanceLoading && (
                    <p className="text-xs text-gray-500">Dang kiem tra khoang cach giao hang...</p>
                  )}
                  {!distanceLoading && distanceInfo && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span>Khoang cach: {distanceInfo.distanceKm} km</span>
                      <span>|</span>
                      <span>Ban kinh: {distanceInfo.deliveryRadiusKm} km</span>
                    </div>
                  )}
                  {!distanceLoading && distanceInfo && (
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
                  {!hasCoords && (
                    <p className="text-xs text-red-600">
                      Chua co toa do dia chi. Vui long cap nhat dia chi trong ho so.
                    </p>
                  )}
                  {distanceError && (
                    <p className="text-xs text-red-600">{distanceError}</p>
                  )}
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
                      void onCheckout({ paymentMethod });
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
