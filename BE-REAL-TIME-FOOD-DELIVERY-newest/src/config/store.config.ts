export const storeConfig = {
  name: process.env.STORE_NAME ?? 'Main Store',
  address:
    process.env.STORE_ADDRESS ??
    '27 Đ. Hoàng Diệu 2, Phường Linh Trung, Thủ Đức, Hồ Chí Minh, Việt Nam',
  lat: Number(process.env.STORE_LAT ?? 10.8602189344313),
  lng: Number(process.env.STORE_LNG ?? 106.76193389485566),
  deliveryRadiusKm: Number(process.env.DELIVERY_RADIUS_KM ?? 30),
};

