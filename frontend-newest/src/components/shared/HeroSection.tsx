'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Search, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { MOCK_HERO_SLIDES } from '@/mocks';

/**
 * HeroSection Component
 * Auto-rotating promotional banner with manual navigation
 * Data source: MOCK_HERO_SLIDES → replace with API call: GET /api/promotions/banners
 */
export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // TODO: replace with API call GET /api/promotions/banners
  const slides = MOCK_HERO_SLIDES ?? [];
  const slideCount = slides.length;
  const safeIndex = slideCount > 0 ? Math.min(currentSlide, slideCount - 1) : 0;

  // Auto-rotate slides every 5 seconds (only when we have slides)
  useEffect(() => {
    if (slideCount <= 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideCount]);

  // Navigate to previous slide
  const prevSlide = () => {
    if (slideCount <= 0) return;
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  // Navigate to next slide
  const nextSlide = () => {
    if (slideCount <= 0) return;
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  if (slideCount === 0) {
    return (
      <section className="relative w-full h-[500px] lg:h-[600px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No slides available.</p>
      </section>
    );
  }

  const slide = slides[safeIndex];

  return (
    <section className="relative w-full h-[500px] lg:h-[600px] bg-gray-100">
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Single full background image for each slide */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: slide ? `url(${slide.imageUrl})` : undefined }}
            />

            {/* Dark overlay to keep text readable */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Content Container */}
            <div className="absolute inset-0 container mx-auto px-4 lg:px-8 flex items-center">
              <div className="w-full max-w-2xl">
                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-white z-10"
                >
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full"
                  >
                    Limited Time Offer
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-5xl lg:text-7xl font-black mb-4 leading-tight italic"
                  >
                    {slide?.title ?? ''}
                  </motion.h1>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-200"
                  >
                    {slide?.subtitle ?? ''}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-lg lg:text-xl mb-8 text-gray-100 hidden"
                  >
                    {slide?.description ?? ''}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-red-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-full shadow-xl"
                    >
                      <a href={slide?.ctaLink ?? '#'}>
                        Order Now
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === safeIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floated Delivery Search Bar */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4">
        <div className="bg-white rounded-full p-2 lg:p-3 shadow-xl flex items-center gap-2 lg:gap-4 w-full">
          {/* Toggle Type */}
          <div className="bg-gray-50 flex items-center p-1 rounded-full shrink-0">
            <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all">
              <Navigation className="w-4 h-4 ml-1" /> {/* To mimic the icon */}
              Delivery
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 px-4 py-2 rounded-full text-sm font-semibold transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Pickup
            </button>
          </div>

          {/* Address Input */}
          <div className="flex-1 flex items-center gap-2 bg-transparent px-2 w-full min-w-0 border-l border-gray-100 pl-4">
            <MapPin className="w-5 h-5 text-red-500 shrink-0" />
            <input 
              type="text"
              placeholder="Enter your delivery address..."
              className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-0 truncate"
            />
          </div>

          {/* Search Button */}
          <button className="w-10 h-10 lg:w-12 lg:h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shrink-0 transition-all shadow-md shadow-red-600/30">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
