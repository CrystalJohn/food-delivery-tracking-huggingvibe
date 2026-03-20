'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/useAuth';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

function getFirstFieldError(value?: string[]): string | undefined {
  return value && value.length > 0 ? value[0] : undefined;
}

function mapLoginFieldErrors(error: ApiError): LoginFieldErrors {
  const fieldErrors: LoginFieldErrors = {
    email: getFirstFieldError(error.errors?.email),
    password: getFirstFieldError(error.errors?.password),
  };

  if (!fieldErrors.email && !fieldErrors.password && error.statusCode === 401) {
    return {
      email: 'Email or password is incorrect.',
      password: 'Email or password is incorrect.',
    };
  }

  return fieldErrors;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      let message = 'Login failed. Please try again.';
      if (err instanceof ApiError) {
        message = err.message;
        setFieldErrors(mapLoginFieldErrors(err));
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <LandingHeader />

      <main className="flex-1 px-4 py-8 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:grid lg:grid-cols-2">
          {/* Left Side - Image */}
          <div className="relative hidden min-h-[640px] bg-black lg:flex">
            <Image
              src="https://images.unsplash.com/photo-1503764654157-72d979d9af2f?q=80&w=2074&auto=format&fit=crop"
              alt="Vietnamese Food"
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-end p-16 text-white z-10">
              <h1 className="text-6xl font-bold mb-4">Taste of <br/>Vietnam</h1>
              <p className="text-xl max-w-md text-gray-200">
                Experience the authentic flavors of traditional Vietnamese cuisine, delivered right to your doorstep.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex w-full items-center justify-center p-8 bg-background">
            <div className="w-full max-w-[400px] space-y-6">
              <div className="flex flex-col items-center space-y-2 mb-8">
                <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  F
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                <p className="text-muted-foreground text-sm">
                  Please enter your details to sign in
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    required
                    className={`h-11 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      required
                      className={`h-11 pr-10 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                {error && !fieldErrors.email && !fieldErrors.password && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-red-600 hover:text-red-500 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}


