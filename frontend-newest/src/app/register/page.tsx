'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { ROUTES } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const getRoleRedirectPath = (role: string): string => {
    const roleRoutes: Record<string, string> = {
      CUSTOMER: ROUTES.CUSTOMER,
      STAFF: ROUTES.STAFF,
      DRIVER: ROUTES.DRIVER,
      ADMIN: ROUTES.ADMIN,
    };

    return roleRoutes[role] || ROUTES.CUSTOMER;
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const redirectPath = getRoleRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [user, authLoading, router]);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
          alt="Vietnamese Cuisine"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white z-10">
          <h1 className="text-6xl font-bold mb-4">
            Join Our <br />
            Food Community
          </h1>
          <p className="text-xl max-w-md text-gray-200">
            Order delicious Vietnamese cuisine or earn money delivering food to customers across the city.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="flex flex-col items-center space-y-2 mb-8">
            <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
              F
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground text-sm text-center">
              Sign up to start ordering or delivering food
            </p>
          </div>

          <RegisterForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-red-600 hover:text-red-500 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
