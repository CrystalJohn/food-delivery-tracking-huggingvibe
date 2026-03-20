'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, ClipboardList, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { orderService } from '@/features/orders';
import { CartSidebar, type CartCheckoutPayload } from '@/components/shared/CartSidebar';
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

  const handleCheckoutRequest = async ({ paymentMethod }: CartCheckoutPayload) => {
    if (isCheckingOut) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const checkoutPayload = {
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

  const sidebarItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.unitPrice,
    image: item.imageUrl || FALLBACK_IMAGE,
    quantity: item.quantity,
  }));

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-gray-200 bg-white shadow-sm md:h-20">
        <div className="container mx-auto flex w-full items-center justify-between gap-4 px-4 lg:px-8">
          <Link href="/" className="group flex flex-shrink-0 items-center gap-2">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-xl font-bold text-white">F</span>
            </motion.div>
            <span className="hidden text-xl font-bold text-gray-900 transition-colors group-hover:text-red-600 md:block">
              FoodGo
            </span>
          </Link>

          <div className="max-w-2xl flex-1 px-2 md:px-8">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for food, coffee, etc..."
                className="block w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-12 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:bg-gray-100 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
            <button className="hidden rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 sm:block">
              <MapPin className="h-5 w-5" />
            </button>

            <div className="mx-1 hidden h-6 w-[1px] bg-gray-200 sm:block"></div>

            <button className="hidden rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 sm:block">
              <ClipboardList className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none"
            >
              <ShoppingCart className="h-6 w-6" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm"
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

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={sidebarItems}
        defaultAddress={user?.defaultAddress?.fullAddress ?? ''}
        defaultAddressLat={user?.defaultAddress?.lat}
        defaultAddressLng={user?.defaultAddress?.lng}
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
    </>
  );
}
