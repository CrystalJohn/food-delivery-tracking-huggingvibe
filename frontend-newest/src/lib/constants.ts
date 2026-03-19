export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const ROUTES = {
  CUSTOMER: '/menu',
  STAFF: '/tickets',
  DRIVER: '/jobs',
  ADMIN: '/admin/staffs',
  menu: "/menu",
  cart: "/cart",
  orders: (id: string) => `/orders/${id}`,
} as const;

// ---------------------------------------------------------------------------
// Static UI Config — không phải API, không đặt vào mocks/
// ---------------------------------------------------------------------------

/** Header navigation links */
export const NAV_LINKS = [
  { href: '/promotions', label: 'Promotions' },
  { href: '/menu', label: 'Menu' },
  { href: '/tracking-order', label: 'Tracking Order' },
] as const;

/** Footer — menu category links */
export const FOOTER_MENU_LINKS = [
  { href: '/menu/fried-chicken', label: 'Fried Chicken' },
  { href: '/menu/burgers', label: 'Burgers' },
  { href: '/menu/drinks', label: 'Drinks' },
  { href: '/menu/combos', label: 'Combos' },
] as const;

/** Footer — help/policy links */
export const FOOTER_HELP_LINKS = [
  { href: '/support', label: 'Support' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
] as const;

/** Footer & brand info — static, không có API */
export const CONTACT_INFO = {
  brandName: 'FoodGo',
  tagline: 'The best fried chicken and burgers in town, delivered hot and fresh to your doorstep.',
  address: {
    street: '123 Food Street, District 1',
    city: 'Ho Chi Minh City',
  },
  phone: '1900-8888',
} as const;

/**
 * Tabs filter UI trên trang chủ — đây là UI config, không ánh xạ với category backend.
 * Khi gọi API thực, frontend sẽ filter theo tag/field riêng (e.g. featured=true, isNew=true).
 */
export const PRODUCT_TABS = [
  { id: 'must-try', label: 'Must Try' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'new', label: 'New Items' },
] as const;

/**
 * Style cho promo banners trang chủ — UI-only, backend không trả về.
 * Index tương ứng với thứ tự banner trong MOCK_PROMO_BANNERS / API response.
 */
export const PROMO_BANNER_STYLES = [
  {
    bgGradient: 'from-gray-900 to-gray-800',
    labelColor: 'text-yellow-400',
    ctaStyle: 'bg-white text-gray-900 hover:bg-gray-100',
  },
  {
    bgGradient: 'from-red-600 to-red-500',
    labelColor: 'text-white',
    ctaStyle: 'bg-white text-red-600 hover:bg-gray-100',
  },
] as const;

/**
 * Màu gradient background cho từng hero slide — UI-only, backend không trả về.
 * Index tương ứng với thứ tự slide trong MOCK_HERO_SLIDES / API response.
 */
export const HERO_SLIDE_COLORS = [
  'from-orange-400 to-red-500',
  'from-yellow-400 to-orange-500',
  'from-red-500 to-red-600',
] as const;
