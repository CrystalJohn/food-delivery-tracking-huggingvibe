'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '@/types';

interface ProfileMenuProps {
  user: Pick<User, 'id' | 'name' | 'role' | 'phone'> | null;
  onLogout: () => void | Promise<void>;
  triggerClassName?: string;
}

export function ProfileMenu({ user, onLogout, triggerClassName }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await onLogout();
  };

  const role = user?.role ?? 'GUEST';
  const isCustomer = role === 'CUSTOMER';
  const isStaff = role === 'STAFF';
  const isDriver = role === 'DRIVER';
  const isAdmin = role === 'ADMIN';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={triggerClassName ?? 'p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600'}
        aria-expanded={isOpen}
        aria-controls="profile-menu"
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <UserIcon className="w-5 h-5" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="profile-menu"
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-lg z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{user?.name || '-'}</p>
              <p className="text-xs text-gray-500">Role: {user?.role || '-'}</p>
              <p className="text-xs text-gray-500">Phone: {user?.phone || '-'}</p>
              {user?.id && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2 py-1">
                  <p className="text-[11px] text-gray-600 truncate" title={user.id}>
                    ID: <span className="font-mono text-gray-800">{user.id}</span>
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(user.id);
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            <div className="py-2">
              {isCustomer && (
                <>
                  <Link
                    href="/orders"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/cart"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cart
                  </Link>
                </>
              )}

              {isStaff && (
                <Link
                  href="/tickets"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Tickets (Kitchen Queue)
                </Link>
              )}

              {isDriver && (
                <Link
                  href="/jobs"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Jobs (My Deliveries)
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Admin Dashboard
                </Link>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  void handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
