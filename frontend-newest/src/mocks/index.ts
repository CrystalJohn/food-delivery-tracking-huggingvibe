/**
 * 📂 Mock Data — Backend API Contracts
 *
 * Mỗi export trong folder này mô phỏng ĐÚNG cấu trúc response mà backend cần trả về.
 * Backend team đọc từng file để biết schema API cần implement.
 *
 * Quy tắc:
 * - Chỉ chứa fields mà backend THỰC SỰ trả về (match với Mongoose schema).
 * - Không chứa Tailwind class, UI logic, hay bất kỳ frontend-only field nào.
 * - Static config (nav links, footer, contact) → xem lib/constants.ts
 * - UI-only styling (gradient, badge color) → xem lib/constants.ts
 *
 * 📌 Mapping Mock → API:
 * ┌──────────────────────┬─────────────────────────────────────┐
 * │ Mock Data            │ API Endpoint                        │
 * ├──────────────────────┼─────────────────────────────────────┤
 * │ MOCK_MENU_ITEMS      │ GET /api/menu                       │
 * │ MOCK_HERO_SLIDES     │ GET /api/promotions/banners         │
 * │ MOCK_PROMO_BANNERS   │ GET /api/promotions/featured        │
 * └──────────────────────┴─────────────────────────────────────┘
 */

// Menu items — @see backend/src/modules/ordering/menu-item.schema.ts
export { MOCK_MENU_ITEMS } from './menu';

// Promotions & Banners
export { MOCK_HERO_SLIDES, MOCK_PROMO_BANNERS } from './promotions';
