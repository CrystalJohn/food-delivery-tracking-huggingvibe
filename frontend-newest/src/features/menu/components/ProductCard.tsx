'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { AddToCartButton } from './AddToCartButton';
import { MenuItemDetailModal } from './MenuItemDetailModal';

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  prepTime: string;
  image: string;
  description: string;
  badge?: string;
}

const vndFormatter = new Intl.NumberFormat('vi-VN');

function formatVnd(price: number) {
  return `${vndFormatter.format(price)} VNĐ`;
}

export function ProductCard({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div
        layoutId={`product-card-${product.id}`}
        onClick={handleCardClick}
        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col group h-full cursor-pointer relative"
      >
        <motion.div 
          layoutId={`product-image-${product.id}`}
          className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {product.badge && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">
              {product.badge}
            </div>
          )}

          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
            <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {product.prepTime}
          </div>
        </motion.div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-4 mb-2">
            <motion.h3 
              layoutId={`product-title-${product.id}`}
              className="font-bold text-lg text-gray-900 leading-tight"
            >
              {product.name}
            </motion.h3>
            <div className="flex items-center gap-1 text-sm font-bold text-gray-700 bg-yellow-50 px-2 py-0.5 rounded-full shrink-0">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {product.rating}
            </div>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 relative z-20">
            <motion.div 
              layoutId={`product-price-${product.id}`}
              className="flex flex-col"
            >
              <span className="text-xs text-gray-400 font-semibold mb-0.5">Price</span>
              {/* Render giá mặc định là format Việt Nam */}
              <span className="text-lg font-black text-red-600">{formatVnd(product.price)}</span>
            </motion.div>
            <div onClick={(e) => e.stopPropagation()}>
              <AddToCartButton productId={product.id} name={product.name} price={product.price} />
            </div>
          </div>
        </div>
      </motion.div>

      <MenuItemDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemId={product.id}
        initialProduct={product}
      />
    </>
  );
}
