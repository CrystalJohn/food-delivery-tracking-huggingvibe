'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, ClipboardList, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { orderService, type PaymentMethod } from '@/features/orders';
import { CheckoutAddressModal } from '@/features/checkout/CheckoutAddressModal';
import { CartSidebar } from '@/components/shared/CartSidebar';
import { ProfileMenu } from '@/components/shared/ProfileMenu';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2600';

export function CustomerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount, items, updateQuantity, removeItem, refreshCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<PaymentMethod | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      params.delete('page');
      const targetPath = pathname.includes('/menu') ? pathname : '/menu';
      router.push(`${targetPath}?${params.toString()}`);
    }, 500);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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

  const sidebarItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.unitPrice,
    image: item.imageUrl || FALLBACK_IMAGE,
    quantity: item.quantity,
  }));

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm h-16 md:h-20 flex items-center">
        <div className="container mx-auto px-4 lg:px-8 w-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <motion.div
              className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-white font-bold text-xl">F</span>
            </motion.div>
            <span className="hidden md:block text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              FoodGo
            </span>
          </Link>

          <div className="flex-1 max-w-2xl px-2 md:px-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for food, coffee, etc..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full focus:ring-red-500 focus:border-red-500 block pl-12 pr-4 py-2.5 outline-none transition-all hover:bg-gray-100 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block text-gray-600">
              <MapPin className="w-5 h-5" />
            </button>

            <div className="h-6 w-[1px] bg-gray-200 hidden sm:block mx-1"></div>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block text-gray-600">
              <ClipboardList className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 focus:outline-none"
            >
              <ShoppingCart className="w-6 h-6" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

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
    </>
  );
}



