export const storeConfig = {
  name: process.env.STORE_NAME ?? 'Main Store',
  address: process.env.STORE_ADDRESS ?? 'Store Address',
  lat: Number(process.env.STORE_LAT ?? 10.762622),
  lng: Number(process.env.STORE_LNG ?? 106.660172),
  deliveryRadiusKm: Number(process.env.DELIVERY_RADIUS_KM ?? 30),
};