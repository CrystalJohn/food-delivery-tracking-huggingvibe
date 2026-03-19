'use client';

import Link from 'next/link';
import { CircleAlert } from 'lucide-react';

interface AuthRequiredPopupProps {
  open: boolean;
  onClose: () => void;
}

export function AuthRequiredPopup({ open, onClose }: AuthRequiredPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 pointer-events-auto">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />

      <div className="relative z-[301] w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
            <CircleAlert className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">Đăng nhập để tiếp tục</h3>
            <p className="mt-1 text-sm text-gray-600">
              Bạn cần đăng nhập hoặc đăng ký tài khoản Customer để thêm món vào giỏ hàng và đặt đơn.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href="/login"
            className="rounded-xl bg-red-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-red-700"
            onClick={onClose}
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Đăng ký
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          Để sau
        </button>
      </div>
    </div>
  );
}
