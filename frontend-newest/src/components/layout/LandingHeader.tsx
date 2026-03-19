'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { CartSidebar } from '@/components/shared/CartSidebar';
import { ProfileMenu } from '@/components/shared/ProfileMenu';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { orderService, type PaymentMethod } from '@/features/orders';
import { CheckoutAddressModal } from '@/features/checkout/CheckoutAddressModal';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2600';

export function LandingHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<PaymentMethod | null>(null);
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

  const handleCheckoutRequest = (paymentMethod: PaymentMethod) => {
    if (isCheckingOut) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setPendingPaymentMethod(paymentMethod);
    setAddressModalOpen(true);
  };

  const handleAddressConfirm = async (
    result: { deliveryLat: number; deliveryLng: number; address?: string } | null,
  ) => {
    setAddressModalOpen(false);
    const paymentMethod = pendingPaymentMethod ?? 'CASH';
    setPendingPaymentMethod(null);

    setIsCheckingOut(true);
    try {
      const coords =
        result != null
          ? { deliveryLat: result.deliveryLat, deliveryLng: result.deliveryLng }
          : undefined;
      await orderService.checkoutActiveCart(paymentMethod, coords);
      await refreshCart();
      setIsCartOpen(false);
      toast.success('Đặt hàng thành công. Bạn có thể theo dõi trong Đơn của tôi.');
      router.push('/orders');
    } catch (error) {
      console.error('[CHECKOUT] checkout failed', error);
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-white font-bold text-xl">F</span>
            </motion.div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              FoodGo
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full flex items-center gap-2 text-sm relative"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Gio hang</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="hidden lg:flex items-center gap-3 ml-2">
              {isAuthenticated ? (
                <>
                  <div className="rounded-2xl bg-[#1e233a] text-white px-4 py-2 shadow-sm border border-[#2b3150]">
                    <p className="text-xs uppercase tracking-wide text-gray-300">Welcome</p>
                    <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                  </div>
                  <ProfileMenu user={user} onLogout={handleLogout} />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link href="/register">
                    <Button className="bg-[#1e233a] hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-full text-sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="md:hidden overflow-hidden border-t border-gray-200"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="px-4 py-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'EN' | 'VN')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
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

      <CheckoutAddressModal
        open={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false);
          setPendingPaymentMethod(null);
        }}
        onConfirm={handleAddressConfirm}
      />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={sidebarItems}
        onUpdateQuantity={(id, quantity) => {
          void updateQuantity(id, quantity);
        }}
        onRemoveItem={(id) => {
          void removeItem(id);
        }}
        onCheckout={(paymentMethod) => handleCheckoutRequest(paymentMethod)}
        checkoutLoading={isCheckingOut}
      />
    </header>
  );
}




