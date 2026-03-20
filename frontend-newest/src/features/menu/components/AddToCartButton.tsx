'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { AuthRequiredPopup } from '@/components/shared/AuthRequiredPopup';
import { toast } from 'react-toastify';

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
}

export function AddToCartButton({ productId, name, price }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const isAuthRequiredError = (error: unknown): boolean => {
    if (error instanceof ApiError && error.statusCode === 401) return true;
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return true;
    return false;
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }

    const payload = {
      id: productId,
      name,
      price,
      description: '',
      imageUrl: '',
      category: '',
      available: true,
    };

    console.log('[AddToCartButton] addItem start', payload);

    try {
      await addItem(payload);
      toast.success(`Added to cart: ${name} x1`);
      console.log('[AddToCartButton] addItem success', {
        productId,
        name,
      });
    } catch (error) {
      if (isAuthRequiredError(error)) {
        setShowAuthPopup(true);
        return;
      }

      if (error instanceof ApiError) {
        console.error('[AddToCartButton] addItem ApiError', {
          statusCode: error.statusCode,
          message: error.message,
          errors: error.errors,
          payload,
        });
      } else {
        console.error('[AddToCartButton] addItem unexpected error', {
          error,
          payload,
        });
      }
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          void handleAdd(e);
        }}
        className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 bg-gray-50 flex flex-shrink-0 items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
        aria-label="Add to cart"
      >
        <Plus className="w-4 h-4" />
      </button>

      <AuthRequiredPopup open={showAuthPopup} onClose={() => setShowAuthPopup(false)} />
    </>
  );
}
