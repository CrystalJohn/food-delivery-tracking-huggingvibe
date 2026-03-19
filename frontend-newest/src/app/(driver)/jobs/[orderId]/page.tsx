'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout';
import { Card } from '@/components/ui';
import { jobService } from '@/features/driver/job.service';
import { ETAOverlay, TrackingMap } from '@/features/tracking';
import type { DeliveryJob } from '@/types';

function buildGoogleMapsDirectionsUrl(params: {
  destinationLatLng?: { lat: number; lng: number } | null;
  destinationAddress?: string | null;
  originLatLng?: { lat: number; lng: number } | null;
}): string | null {
  const base = 'https://www.google.com/maps/dir/?api=1';
  const destination = params.destinationLatLng
    ? `${params.destinationLatLng.lat},${params.destinationLatLng.lng}`
    : params.destinationAddress?.trim()
      ? params.destinationAddress.trim()
      : null;

  if (!destination) return null;

  const qs = new URLSearchParams();
  qs.set('destination', destination);
  qs.set('travelmode', 'driving');

  if (params.originLatLng) {
    qs.set('origin', `${params.originLatLng.lat},${params.originLatLng.lng}`);
  }

  return `${base}&${qs.toString()}`;
}

export default function DriverJobDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [job, setJob] = useState<
    (DeliveryJob & {
      deliveryLocation?: { lat: number; lng: number } | null;
      driverLocation?: { lat: number; lng: number; timestamp?: string | null } | null;
    }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [openingDirections, setOpeningDirections] = useState(false);

  const refetch = useCallback(async () => {
    const data = await jobService.getMyOrderDetail(orderId);
    setJob(data ?? null);
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await jobService.getMyOrderDetail(orderId);
        if (!cancelled) setJob(data ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orderId]);

  const handlePickup = async () => {
    setProcessing(true);
    try {
      try {
        await jobService.updateMyLocation(orderId);
        await refetch();
      } catch {
        // Nếu không lấy được vị trí thì vẫn cho pickup, chỉ warning sau
      }
      const updated = await jobService.pickupJob(orderId);
      setJob(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Không thể cập nhật trạng thái đơn.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeliver = async () => {
    setProcessing(true);
    try {
      try {
        await jobService.updateMyLocation(orderId);
        await refetch();
      } catch {
        // Nếu không lấy được vị trí thì vẫn cho xác nhận giao xong
      }
      const updated = await jobService.deliverJob(orderId);
      setJob(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Không thể cập nhật trạng thái đơn.');
    } finally {
      setProcessing(false);
    }
  };

  const shouldAutoShare = job?.status === 'PICKED_UP';

  useEffect(() => {
    if (!shouldAutoShare) return;
    const id = setInterval(() => {
      void (async () => {
        try {
          await jobService.updateMyLocation(orderId);
          await refetch();
        } catch {
          // ignore background errors (permission/offline/etc)
        }
      })();
    }, 15000);
    return () => clearInterval(id);
  }, [orderId, refetch, shouldAutoShare]);

  if (loading) {
    return (
      <PageContainer>
        <p className="text-gray-600">Loading...</p>
      </PageContainer>
    );
  }

  if (error || !job) {
    return (
      <PageContainer>
        <p className="text-red-600">{error ?? 'Order not found'}</p>
        <Link href="/jobs" className="text-blue-600 hover:underline mt-2 inline-block text-sm">
          ← Back to Jobs
        </Link>
      </PageContainer>
    );
  }

  const canPickup = job.status === 'ASSIGNED';
  const canDeliver = job.status === 'PICKED_UP';

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Order #{String(orderId).slice(0, 8)}</h1>
          <Link href="/jobs" className="text-sm text-gray-600 hover:underline">
            ← Back to Jobs
          </Link>
        </div>

        <Card className="p-4 space-y-3">
          <div>
            <p className="font-semibold">Delivery map</p>
            <p className="text-sm text-gray-600">
              Vị trí điểm giao (customer) + vị trí tài xế (nếu đã gửi).
            </p>
          </div>
          <div className="relative">
            <TrackingMap
              deliveryAddress="Delivery"
              deliveryLocation={job.deliveryLocation ?? null}
              driverLocation={
                job.driverLocation
                  ? {
                      lat: job.driverLocation.lat,
                      lng: job.driverLocation.lng,
                      timestamp: job.driverLocation.timestamp ?? new Date().toISOString(),
                    }
                  : undefined
              }
            />
            <ETAOverlay
              driverLocation={
                job.driverLocation
                  ? { lat: job.driverLocation.lat, lng: job.driverLocation.lng }
                  : null
              }
              deliveryLocation={job.deliveryLocation ?? null}
            />
            <button
              type="button"
              disabled={openingDirections}
              onClick={async () => {
                const destinationUrl = buildGoogleMapsDirectionsUrl({
                  destinationLatLng: job.deliveryLocation ?? null,
                  destinationAddress: null,
                  originLatLng: null,
                });

                if (!destinationUrl) {
                  alert('Chưa có tọa độ điểm giao (customer chưa cấp quyền Location).');
                  return;
                }

                setOpeningDirections(true);
                try {
                  let originLatLng: { lat: number; lng: number } | null = null;
                  try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
                      navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 5000,
                      });
                    });
                    originLatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  } catch {
                    originLatLng = null;
                  }

                  const url = buildGoogleMapsDirectionsUrl({
                    destinationLatLng: job.deliveryLocation ?? null,
                    destinationAddress: null,
                    originLatLng,
                  });

                  if (url) window.open(url, '_blank', 'noopener,noreferrer');
                } finally {
                  setOpeningDirections(false);
                }
              }}
              className="absolute bottom-3 right-3 z-10 px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg"
            >
              Chỉ đường (Google Maps)
            </button>
          </div>
          {job.deliveryAddress ? (
            <p className="text-xs text-gray-500">
              Điểm giao: {job.deliveryAddress}
            </p>
          ) : !job.deliveryLocation ? (
            <p className="text-xs text-gray-500">
              Chưa có địa chỉ giao hàng.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div>
              {job.customerName && (
                <p className="text-sm text-gray-600">
                  Khách hàng: {job.customerName}
                  {job.customerPhone ? ` • ${job.customerPhone}` : ''}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-0.5">
                Trạng thái:{' '}
                {job.status === 'ASSIGNED'
                  ? 'Được gán'
                  : job.status === 'PICKED_UP'
                    ? 'Đang giao'
                    : job.status === 'DELIVERED'
                      ? 'Hoàn thành'
                      : job.status === 'CANCELLED'
                        ? 'Đã hủy'
                        : job.status}
              </p>
            </div>
            <div className="flex gap-2">
              {canPickup && (
                <button
                  onClick={handlePickup}
                  disabled={processing}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 font-medium"
                >
                  Đã lấy hàng
                </button>
              )}
              {canDeliver && (
                <button
                  onClick={handleDeliver}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  Đã giao xong
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
