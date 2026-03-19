# Quy trình test – Dùng hoàn toàn API thật

## 1. Đã có API hết chưa? Đã tích hợp hết chưa?

### Bảng trạng thái

| Module | BE có API? | FE đã gọi đúng API? | Có thể dùng ngay? |
|--------|------------|----------------------|-------------------|
| **Auth** (login, register, me) | ✅ | ✅ | ✅ |
| **Menu** (xem món, category) | ✅ | ✅ | ✅ |
| **Cart** (thêm/sửa/xóa giỏ) | ✅ | ✅ | ✅ |
| **Order – Customer** (tạo đơn từ giỏ, xem đơn, hủy) | ✅ | ✅ | ✅ |
| **Staff – Orders** (xem đơn, cập nhật trạng thái, assign driver, hủy) | ✅ | ✅ | ✅ |
| **Driver – Orders** (xem đơn đã assign, pick-up, confirm delivered) | ✅ | ✅ | ✅ |
| **Driver profile** (online/offline) | ✅ | ✅ | ✅ |
| **Staff available drivers** (dropdown assign) | ✅ | ✅ | ✅ |
| **Tracking vị trí tài xế** (driver gửi lat/lng + customer polling 15s) | ✅ | ✅ | ✅ |
| **Admin** (CRUD staff, CRUD driver) | ✅ | FE có admin.service nhưng path khác BE | ⚠️ Cần chỉnh path nếu dùng trang Admin |

**Kết luận:** Luồng chính **Customer → Staff → Driver** đã dùng API thật và **có thể test end-to-end**, bao gồm **driver gửi vị trí** và **customer polling 15s**.

---

## 2. Chuẩn bị trước khi test

### 2.1 Backend (BE-REAL-TIME-FOOD-DELIVERY)

```bash
# 1. PostgreSQL chạy, tạo database
createdb real_time_food_delivery

# 2. Vào thư mục BE
cd BE-REAL-TIME-FOOD-DELIVERY

# 3. Cài đặt và chạy
npm install
npm run dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Khi chạy lần đầu: tự tạo **admin** `admin@gmail.com` / `123123` và seed **menu**.

### 2.2 Tạo tài khoản test (Customer, Staff, Driver)

BE mặc định chỉ có **admin**. Để test đủ vai trò:

**Cách 1 – Đăng ký Customer trên FE:**

1. Mở FE → **Đăng ký** (register) → tạo 1 tài khoản khách (vd: `customer@test.com` / `123456`).

**Cách 2 – Admin tạo Staff & Driver (qua Swagger):**

1. Mở `http://localhost:3000/api/docs`.
2. **POST /api/auth/login** → body `{ "email": "admin@gmail.com", "password": "123123" }` → copy `accessToken`.
3. Bấm **Authorize** → dán `Bearer <accessToken>`.
4. **POST /api/admin/staffs** → tạo staff (email, fullName, password, phone).
5. **POST /api/admin/drivers** → tạo driver (email, fullName, password, phone, …).

Lưu lại email/password của từng vai trò để test.

### 2.3 Frontend

```bash
cd frontend
```

Tạo file **`.env.local`** (trong thư mục `frontend`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MAP_API_KEY=YOUR_GOOGLE_MAPS_KEY
```

Chạy FE:

```bash
npm install
npm run dev
```

Mở `http://localhost:3001` (FE chạy port 3001).

---

## 3. Quy trình test từng bước (end-to-end)

### Bước 1: Customer – Đặt hàng

1. **Đăng nhập** bằng tài khoản **Customer** (hoặc đăng ký mới rồi đăng nhập).
2. Vào **Menu** → chọn món → **Thêm vào giỏ**.
3. Vào **Giỏ hàng** → chỉnh số lượng nếu cần → **Checkout**.
4. Khi checkout, trình duyệt sẽ hỏi quyền **Location** (nếu cho phép). FE sẽ gửi **deliveryLat/deliveryLng** lên BE.
5. Kiểm tra:
   - Tạo đơn thành công, chuyển sang trang đơn hàng (hoặc danh sách đơn).
   - Vào **Đơn của tôi** / **Orders** → thấy đơn vừa tạo, trạng thái (vd: PENDING/CONFIRMED).

**API dùng:** POST /auth/login, GET /menu, POST /cart/items, GET /cart, POST /orders (checkoutActiveCart + deliveryLat/deliveryLng), GET /orders.

---

### Bước 2: Staff – Xử lý đơn (đến READY và assign driver)

1. **Đăng xuất** (hoặc dùng tab ẩn danh / trình duyệt khác).
2. **Đăng nhập** bằng tài khoản **Staff**.
3. Vào **Kitchen Queue** / **Tickets** (route `/tickets`).
4. Thấy đơn ở trạng thái **Pending**:
   - Bấm **Accept** → đơn chuyển **In Progress** (CONFIRMED).
   - Bấm **Start cooking** → đơn chuyển PREPARING.
   - Bấm **Mark READY** → đơn chuyển **Ready**.
5. Với đơn **Ready**:
   - Bấm **Assign driver** → chọn tài xế từ dropdown **Available drivers** → bấm **Assign**.
   - Sau khi assign, card sẽ hiển thị **tên tài xế đã gán** và không còn nút Assign.

**API dùng:** GET /staff/orders, GET /staff/orders/available-drivers, PATCH /staff/orders/:id/status, PATCH /staff/orders/:id/assign-driver.

---

### Bước 3: Driver – Nhận đơn, giao hàng

1. **Đăng nhập** bằng tài khoản **Driver** (driver đã được assign ở bước 2).
2. Vào **Jobs** (route `/jobs`) → bật toggle **Online** để staff thấy trong danh sách available.
3. Thấy đơn đã assign (trạng thái **Được gán**):
   - Bấm **View detail** → vào trang chi tiết đơn.
   - Bấm **Đã lấy hàng** → đơn chuyển **Đang giao** (PICKED_UP). Vị trí tài xế **tự gửi mỗi 15s** lên BE.
   - Khi tới nơi, bấm **Đã giao xong** → đơn chuyển **Hoàn thành** (DELIVERED), rơi xuống tab Lịch sử.
4. Trên map: góc trái trên có **Còn bao lâu tới nơi** (~X phút), góc phải dưới có nút **Chỉ đường (Google Maps)**.

**API dùng:** PATCH /driver/profile/online|offline, GET /driver/orders, GET /driver/orders/:id, PATCH /driver/orders/:id/pick-up, PATCH /driver/orders/:id/location, PATCH /driver/orders/:id/confirm-delivered.

---

### Bước 4: Customer – Xem lại đơn

1. **Đăng nhập** lại bằng **Customer**.
2. Vào **Đơn của tôi** / **Orders** → mở đơn vừa test.
3. Kiểm tra:
   - Trạng thái cập nhật (Đang chuẩn bị → Đợi tài xế → Đang giao → Hoàn thành).
   - Phần **Theo dõi đơn hàng**: map **Google Maps** với marker D (điểm giao), R (tài xế); góc trái trên có **Còn bao lâu tới nơi** (~X phút). Trang **polling 15s** để cập nhật vị trí tài xế.
   - Có thể **Hủy đơn** nếu đơn còn PENDING hoặc CONFIRMED.

**API dùng:** GET /orders, GET /orders/:id, PATCH /orders/:id/cancel (khi hủy).

---

## 4. Checklist nhanh khi test

- [ ] BE chạy port 3000, Swagger mở được.
- [ ] FE chạy port 3001, có `.env.local` với `NEXT_PUBLIC_API_URL=http://localhost:3000/api`.
- [ ] Đăng ký/đăng nhập Customer thành công.
- [ ] Thêm món vào giỏ, checkout → tạo đơn thành công.
- [ ] Staff đăng nhập, thấy đơn trong Kitchen Queue.
- [ ] Staff: Accept → Start cooking → Mark READY.
- [ ] Staff: Assign driver (chọn từ dropdown Available drivers).
- [ ] Driver đăng nhập, thấy đơn trong Jobs.
- [ ] Driver: Mark as Picked Up → Mark as Delivered.
- [ ] Customer xem lại đơn, trạng thái đã cập nhật.

---

## 5. Lưu ý

- **Driver phải Online:** Driver bật toggle Online để xuất hiện trong `/staff/orders/available-drivers`.
- **Địa chỉ giao hàng:** `deliveryAddress` hiện có thể trống (BE chưa lưu địa chỉ), nhưng vị trí giao có thể lấy từ `deliveryLocation` nếu customer cho phép Location.
- **Admin trang FE:** Nếu có trang Admin trên FE, cần chỉnh admin.service gọi đúng path BE: `/admin/staffs`, `/admin/drivers` (GET/POST/PATCH) thay vì `/admin/users`, `/admin/orders`, `/admin/stats` nếu BE không có các route đó.
- **Tracking map:** FE dùng **Google Maps** (`TrackingMap` + `ETAOverlay`). Cần `NEXT_PUBLIC_MAP_API_KEY` trong `.env.local`. Customer và driver đều thấy **Còn bao lâu tới nơi** (~X phút) trên map. Polling 15s cho vị trí tài xế.

Khi chạy đủ các bước trên là đã test được toàn bộ luồng với **API thật**, từ đặt hàng đến giao xong.
