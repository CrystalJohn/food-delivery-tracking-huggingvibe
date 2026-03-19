/** Khoảng cách ~ giữa 2 điểm (km), dùng ước tính ETA */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Ước tính phút tới nơi (tốc độ ~25 km/h nội thành) */
export function estimateMinutesToArrival(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const km = haversineKm(from, to);
  const speedKmPerMin = 25 / 60;
  return Math.max(1, Math.round(km / speedKmPerMin));
}
