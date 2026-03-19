'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth';

export default function CustomerLanding() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">Welcome to FoodDelivery</h1>
        <p className="text-xl text-gray-600 mb-8">
          Order your favorite food and get it delivered to your doorstep
        </p>
        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg">Welcome back, {user?.name || user?.email}!</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/menu"
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Browse Menu
              </Link>
              <Link
                href="/orders"
                className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                My Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

