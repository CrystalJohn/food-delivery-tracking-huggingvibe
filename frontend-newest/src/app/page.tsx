'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { HeroSection } from '@/components/shared/HeroSection';
import { ProductCard, type Product } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/Button';
import { MOCK_MENU_ITEMS, MOCK_PROMO_BANNERS } from '@/mocks';
import { PRODUCT_TABS, PROMO_BANNER_STYLES } from '@/lib/constants';

/**
 * Home Page - Landing Page
 * Main landing page showcasing promotions, featured products, and promotional banners
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('must-try');

  // TODO: replace with API call: GET /api/menu — map _id and imageUrl to component shape
  const menuItems = Array.isArray(MOCK_MENU_ITEMS) ? MOCK_MENU_ITEMS : [];
  const products: Product[] = menuItems.map((item, idx) => ({
    id: item._id,
    name: item.name,
    price: item.price,
    originalPrice: item.price * 1.2, // Mock original price for design display
    image: item.imageUrl ?? '',
    badge: idx === 0 ? 'SALE' : idx === 1 ? 'NEW' : idx === 2 ? 'HOT' : 'BEST SELLER',
    discount: idx === 0 ? 20 : undefined
  }));
  const tabs = Array.isArray(PRODUCT_TABS) ? PRODUCT_TABS : [];
  const banners = Array.isArray(MOCK_PROMO_BANNERS) ? MOCK_PROMO_BANNERS : [];
  const bannerStyles = Array.isArray(PROMO_BANNER_STYLES) ? PROMO_BANNER_STYLES : [];

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product);
    // TODO: Implement cart functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Product Tabs Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 border-b">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-base font-bold transition-all border-b-2 -mb-[2px] ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-red-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                index={index}
              />
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center mt-12"
          >
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 rounded-full"
            >
              <Link href="/menu">View Full Menu</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Promotional Banners Section — API: GET /api/promotions/featured */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner, index) => {
              const style = bannerStyles[index % Math.max(bannerStyles.length, 1)] ?? {
                bgGradient: 'from-gray-900 to-gray-800',
                labelColor: 'text-white',
                ctaStyle: 'bg-white text-gray-900 hover:bg-gray-100',
              };
              return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${style.bgGradient}`}>
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundImage: banner?.imageUrl ? `url(${banner.imageUrl})` : undefined }}
                  />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-center px-8 text-white">
                  <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${style.labelColor}`}>
                    {banner.label}
                  </p>
                  <h3 className="text-4xl font-black mb-4 whitespace-pre-line">
                    {banner.title}
                  </h3>
                  <Button
                    asChild
                    className={`${style.ctaStyle} font-semibold w-fit rounded-full`}
                  >
                    <Link href={banner.ctaLink ?? '#'}>{banner.ctaText}</Link>
                  </Button>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
