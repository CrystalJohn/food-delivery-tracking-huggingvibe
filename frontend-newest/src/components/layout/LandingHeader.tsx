'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { CartSidebar, type CartCheckoutPayload } from '@/components/shared/CartSidebar';
import { ProfileMenu } from '@/components/shared/ProfileMenu';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { orderService } from '@/features/orders';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2600';

export function LandingHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'VN'>('VN');

  const { user, isAuthenticated, logout } = useAuth();
  const { items, itemCount, updateQuantity, removeItem, refreshCart } = useCart();

  const navLinks = [
    { href: '/promotions', label: 'Promotions' },
    { href: '/menu', label: 'Menu' },
    { href: '/store-locator', label: 'Store Locator' },
    { href: '/tracking-order', label: 'Tracking Order' },
  ];

  const sidebarItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.unitPrice,
    image: item.imageUrl || FALLBACK_IMAGE,
    quantity: item.quantity,
  }));

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCheckoutRequest = async ({
    paymentMethod,
    addressOption,
    customAddress,
    customAddressLat,
    customAddressLng,
  }: CartCheckoutPayload) => {
    if (isCheckingOut) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (
      addressOption === 'CUSTOM' &&
      (!customAddress || customAddressLat == null || customAddressLng == null)
    ) {
      toast.error('Please select custom address suggestion or use My Location before checkout.');
      return;
    }

    const checkoutPayload =
      addressOption === 'CUSTOM'
        ? {
            paymentMethod,
            deliveryAddressMode: 'CUSTOM' as const,
            deliveryAddressText: customAddress,
            deliveryLat: customAddressLat,
            deliveryLng: customAddressLng,
          }
        : {
            paymentMethod,
            deliveryAddressMode: 'DEFAULT' as const,
          };

    setIsCheckingOut(true);
    try {
      await orderService.checkoutActiveCart(checkoutPayload);
      await refreshCart();
      setIsCartOpen(false);
      toast.success('Order placed successfully. You can track it in My Orders.');
      router.push('/orders');
    } catch (error) {
      console.error('[CHECKOUT] checkout failed', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-xl font-bold text-white">F</span>
            </motion.div>
            <span className="text-xl font-bold text-gray-900 transition-colors group-hover:text-red-600">
              FoodGo
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-gray-700 transition-colors hover:text-red-600"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Gio hang</span>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-red-600">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="ml-2 hidden items-center gap-3 lg:flex">
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl border border-[#2b3150] bg-[#1e233a] px-4 py-2 text-white shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-300">Welcome</p>
                    <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                  </div>
                  <ProfileMenu user={user} onLogout={handleLogout} />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-gray-700 transition-colors hover:text-red-600"
                  >
                    Sign In
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-full bg-[#1e233a] px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-200 md:hidden"
            >
              <div className="space-y-2 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="px-4 py-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'EN' | 'VN')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="EN">English</option>
                    <option value="VN">Tieng Viet</option>
                  </select>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={sidebarItems}
        defaultAddress={user?.defaultAddress?.fullAddress ?? ''}
        onUpdateQuantity={(id, quantity) => {
          void updateQuantity(id, quantity);
        }}
        onRemoveItem={(id) => {
          void removeItem(id);
        }}
        onCheckout={(payload) => {
          void handleCheckoutRequest(payload);
        }}
        checkoutLoading={isCheckingOut}
      />
    </header>
  );
}
