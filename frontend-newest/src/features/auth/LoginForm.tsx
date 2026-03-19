'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { useAuth } from './useAuth';

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

export function LoginForm() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Redirect to home if already logged in
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
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          required
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${
            fieldErrors.email ? 'border-red-500' : ''
          }`}
          placeholder="your@email.com"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          required
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 ${
            fieldErrors.password ? 'border-red-500' : ''
          }`}
          placeholder="********"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
        )}
      </div>
      {error && !fieldErrors.email && !fieldErrors.password && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
