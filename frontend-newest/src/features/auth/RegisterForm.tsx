'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { ROUTES } from '@/lib/constants';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  agreeTerms?: string;
}

function getFirstFieldError(value?: string[]): string | undefined {
  return value && value.length > 0 ? value[0] : undefined;
}

function mapRegisterFieldErrors(error: ApiError): RegisterFieldErrors {
  const fieldErrors: RegisterFieldErrors = {
    name: getFirstFieldError(error.errors?.name) ?? getFirstFieldError(error.errors?.fullName),
    email: getFirstFieldError(error.errors?.email),
    password: getFirstFieldError(error.errors?.password),
    phone: getFirstFieldError(error.errors?.phone),
  };

  const message = error.message.toLowerCase();

  if (!fieldErrors.email && message.includes('email')) {
    fieldErrors.email = error.message;
  }

  if (!fieldErrors.password && message.includes('password')) {
    fieldErrors.password = error.message;
  }

  if (!fieldErrors.name && (message.includes('name') || message.includes('full name'))) {
    fieldErrors.name = error.message;
  }

  return fieldErrors;
}

export function RegisterForm() {
  const router = useRouter();
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  // Helper function - role-based redirect
  const getRoleRedirectPath = (role: string): string => {
    const roleRoutes: Record<string, string> = {
      CUSTOMER: ROUTES.CUSTOMER,
      STAFF: ROUTES.STAFF,
      DRIVER: ROUTES.DRIVER,
      ADMIN: ROUTES.ADMIN,
    };
    return roleRoutes[role] || ROUTES.CUSTOMER;
  };

  // Listen for user changes after registration
  useEffect(() => {
    if (user && !loading) {
      const redirectPath = getRoleRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    setFieldErrors({});

    // Name validation
    if (formData.name.trim().length < 3) {
      setFieldErrors({ name: 'Name must be at least 3 characters long' });
      setError('Name must be at least 3 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters long' });
      setError('Password must be at least 8 characters long');
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      setError('Passwords do not match');
      return false;
    }

    // Phone validation
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      setFieldErrors({ phone: 'Phone number must be 10-11 digits' });
      setError('Phone number must be 10-11 digits');
      return false;
    }

    // Terms validation
    if (!formData.agreeTerms) {
      setFieldErrors({ agreeTerms: 'You must agree to the Terms and Conditions' });
      setError('You must agree to the Terms and Conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      });
      // Redirect is handled by useEffect above
    } catch (err) {
      let message = 'Registration failed. Please try again.';
      if (err instanceof ApiError) {
        message = err.message;
        setFieldErrors(mapRegisterFieldErrors(err));
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Nguyen Van A"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className={`h-11 ${fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.name && (
          <p className="text-xs text-red-600">{fieldErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          placeholder="name@example.com"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`h-11 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="0912345678"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className={`h-11 ${fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.phone && (
          <p className="text-xs text-red-600">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            placeholder="At least 8 characters"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
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

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`h-11 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="agreeTerms"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
        />
        <label htmlFor="agreeTerms" className="text-sm text-gray-600">
          I agree to the{' '}
          <a href="/terms" className="text-red-600 hover:underline">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-red-600 hover:underline">
            Privacy Policy
          </a>
        </label>
      </div>
      {fieldErrors.agreeTerms && (
        <p className="text-xs text-red-600">{fieldErrors.agreeTerms}</p>
      )}

      {/* Error Message */}
      {error &&
        !fieldErrors.name &&
        !fieldErrors.email &&
        !fieldErrors.password &&
        !fieldErrors.confirmPassword &&
        !fieldErrors.phone &&
        !fieldErrors.agreeTerms && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 bg-red-600 hover:bg-red-700 text-base font-semibold"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
