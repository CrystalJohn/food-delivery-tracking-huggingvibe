"use client";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "@/features/auth";
import { CartProvider } from "@/features/cart";
import { GoogleMapsProvider } from "@/lib/GoogleMapsProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <GoogleMapsProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </GoogleMapsProvider>
      </CartProvider>
    </AuthProvider>
  );
}
