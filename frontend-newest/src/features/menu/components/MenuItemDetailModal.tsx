'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { menuService } from '@/features/menu/menu.service';
import type { MenuItem } from '@/types/menu';
import { Spinner } from '@/components/ui/Spinner';
import type { Product } from './ProductCard';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/lib/api';
import { AuthRequiredPopup } from '@/components/shared/AuthRequiredPopup';
import { Minus, Plus, X } from 'lucide-react';

interface MenuItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  initialProduct: Product;
}

const vndFormatter = new Intl.NumberFormat('vi-VN');

function formatVnd(price: number) {
  return `${vndFormatter.format(price)} đ`;
}

export function MenuItemDetailModal({ isOpen, onClose, itemId, initialProduct }: MenuItemDetailModalProps) {
  const [data, setData] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cart state
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const isAuthRequiredError = (err: unknown): boolean => {
    if (err instanceof ApiError && err.statusCode === 401) return true;
    if (err instanceof Error && err.message === 'AUTH_REQUIRED') return true;
    return false;
  };

  // Reset quantity when opened
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      return;
    }
    setShowAuthPopup(false);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (data && String(data.id) === String(itemId)) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemDetail = await menuService.getById(itemId);
        setData(itemDetail);
      } catch (err) {
        console.error('[MenuItemDetailModal] Fetch Error:', err);
        setError('Không thể tải chi tiết món ăn.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, itemId, data]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }

    // Determine the product info we have
    const addData: MenuItem = {
      id: data?.id || itemId,
      name: data?.name || initialProduct.name,
      price: data?.price ?? initialProduct.price,
      description: data?.description || initialProduct.description,
      imageUrl: data?.imageUrl || initialProduct.image,
      category: data?.category || '',
      available: data ? data.available : true,
    };

    if (!addData.available) return;

    setIsAdding(true);
    try {
      await addItem(addData, quantity);
      onClose(); // Optional: close modal on success
    } catch (err) {
      if (isAuthRequiredError(err)) {
        setShowAuthPopup(true);
        return;
      }
      console.error('Failed to add to cart', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Merge loaded data with initialProduct
  const displayData = {
    name: data?.name || initialProduct.name,
    description: data?.description || initialProduct.description,
    price: data?.price ?? initialProduct.price,
    imageUrl: data?.imageUrl || initialProduct.image,
    category: data?.category || '',
    available: data ? data.available : true,
  };

  const totalPrice = displayData.price * quantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Modal Content - Expanded to look like Popeyes Desktop Model */}
          <motion.div
            layoutId={`product-card-${itemId}`}
            className="relative bg-white shadow-2xl w-full h-full md:h-auto md:max-w-[4xl] lg:max-w-5xl md:rounded-xl overflow-hidden flex flex-col md:flex-row pointer-events-auto md:min-h-[550px] md:max-h-[85vh] z-10"
          >
            {/* Absolute Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-gray-100/80 hover:bg-gray-200 text-gray-700 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Left side: Large Image */}
            <motion.div
              layoutId={`product-image-${itemId}`}
              className="relative w-full h-[40vh] md:h-auto md:w-[50%] lg:w-[55%] bg-gray-50 flex-shrink-0"
            >
              <Image
                src={displayData.imageUrl}
                alt={displayData.name}
                fill
                className="object-cover"
                priority
              />
              {!displayData.available && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-600 text-white text-sm font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                    Hết hàng
                  </span>
                </div>
              )}
            </motion.div>

            {/* Right side: Details and Actions */}
            <div className="flex flex-col flex-1 w-full md:w-[50%] lg:w-[45%] bg-white h-full overflow-hidden">
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 md:py-8 lg:px-8">
                
                {/* Title */}
                <motion.h2
                  layoutId={`product-title-${itemId}`}
                  className="text-2xl md:text-3xl font-extrabold text-orange-600 leading-tight mb-2 pr-6"
                >
                  {displayData.name}
                </motion.h2>

                {/* Sub title / description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-3"
                >
                  {error ? (
                    <p className="text-red-500 font-medium">{error}</p>
                  ) : (
                    <p className="text-gray-600 leading-relaxed">
                      {displayData.description || 'Đang tải mô tả ...'}
                    </p>
                  )}
                  {loading && !error && (
                    <div className="mt-4 flex items-center text-sm text-gray-400 gap-2">
                       <Spinner /> <span className="scale-90">Đang cập nhật...</span>
                    </div>
                  )}
                </motion.div>
                
                {/* Visual Separator */}
                <div className="my-6 border-t border-gray-100" />
                
                {/* Price Display */}
                <motion.div
                  layoutId={`product-price-${itemId}`}
                  className="mb-8"
                >
                  <span className="text-3xl font-black text-gray-900">
                    {formatVnd(displayData.price)}
                  </span>
                </motion.div>

                {/* Optional Mock Options (Visual only as per backend data) */}
                 <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                 >
                   <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
                      <p className="font-semibold text-gray-800 mb-2">Lưu ý</p>
                      <p className="text-sm text-gray-600 italic"> Sản phẩm sẽ được chế biến tùy theo định lượng tiêu chuẩn của nhà hàng. Vui lòng thêm vào giỏ hàng để tiếp tục.</p>
                   </div>
                 </motion.div>

              </div>

              {/* Bottom Sticky Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 md:p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center gap-4">
                  {/* Quantity Control */}
                  <div className="flex items-center h-12 bg-gray-50 border border-gray-200 rounded-full select-none overflow-hidden">
                    <button
                      onClick={handleDecrease}
                      disabled={!displayData.available || quantity <= 1}
                      className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={!displayData.available}
                      className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!displayData.available || isAdding}
                    className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] flex items-center justify-center"
                  >
                    {isAdding ? (
                      <Spinner />
                    ) : !displayData.available ? (
                      'Hết hàng'
                    ) : (
                      `Thêm - ${formatVnd(totalPrice)}`
                    )}
                  </button>
                </div>
              </motion.div>

            </div>
          </motion.div>

          <AuthRequiredPopup open={showAuthPopup} onClose={() => setShowAuthPopup(false)} />
        </div>
      )}
    </AnimatePresence>
  );
}
