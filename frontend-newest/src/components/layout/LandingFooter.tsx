'use client';

import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import {
  FOOTER_MENU_LINKS,
  FOOTER_HELP_LINKS,
  CONTACT_INFO,
} from '@/lib/constants';

/**
 * LandingFooter Component
 * Footer with menu links, help section, and contact information
 */
export function LandingFooter() {
  const menuLinks = FOOTER_MENU_LINKS;
  const helpLinks = FOOTER_HELP_LINKS;
  const contact = CONTACT_INFO;

  return (
    <footer className="bg-[#1e233a] text-gray-300 py-12 lg:py-16 mt-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-white">FoodGo</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed pr-4">
              The best fried chicken and burgers in town, delivered hot and fresh to your doorstep.
            </p>
          </div>

          {/* Menu Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Menu</h3>
            <ul className="space-y-3">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-red-500 transition-colors inline-block hover:translate-x-1 transform duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Help</h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-red-500 transition-colors inline-block hover:translate-x-1 transform duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm">123 Food Street, Ho Chi Minh City</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm">1900-8888</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
