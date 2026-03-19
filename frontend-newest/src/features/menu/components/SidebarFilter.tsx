'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { menuService } from '@/features/menu/menu.service';
import type { MenuItem } from '@/types';

interface CategoryOption {
  value: string;
  count: number;
}

const PRICE_RANGES = [
  { label: '0 - 100.000 VND', value: '0-100000' },
  { label: '100.000 - 200.000 VND', value: '100000-200000' },
  { label: '200.000 - 500.000 VND', value: '200000-500000' },
  { label: '500.000+ VND', value: '500000-999999999' },
];

const DIETARY = ['Vegetarian'];

function buildCategoryOptions(menuItems: MenuItem[]): CategoryOption[] {
  const counts = new Map<string, number>();

  for (const item of menuItems) {
    const key = item.category?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function SidebarFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const currentCategory = searchParams.get('category');
  const currentPrice = searchParams.get('price');
  const currentDietary = searchParams.get('dietary');

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const items = await menuService.getAll();
        if (!cancelled) {
          setCategories(buildCategoryOptions(items));
        }
      } catch (error) {
        console.error('Failed to load menu categories:', error);
        if (!cancelled) {
          setCategories([]);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(name) === value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.delete('page');
      return params.toString();
    },
    [searchParams],
  );

  const updateFilter = (name: string, value: string) => {
    router.push(`${pathname}?${createQueryString(name, value)}`, { scroll: false });
  };

  const FilterContent = () => (
    <div className="space-y-8 w-full p-6 md:p-0">
      <div className="flex items-center gap-2 mb-6 hidden md:flex text-gray-900">
        <Filter className="w-5 h-5 text-red-600" />
        <h2 className="text-xl font-bold">Filters</h2>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900">
          Categories
        </h3>
        <ul className="space-y-3">
          {categories.length === 0 && (
            <li className="text-sm text-gray-500">No categories available</li>
          )}

          {categories.map((cat) => {
            const isActive = currentCategory === cat.value;
            return (
              <li
                key={cat.value}
                className="flex justify-between items-center group cursor-pointer"
                onClick={() => updateFilter('category', cat.value)}
              >
                <button
                  className={`text-sm transition-colors ${
                    isActive
                      ? 'font-bold text-red-600'
                      : 'text-gray-600 group-hover:text-red-600'
                  }`}
                >
                  {cat.value}
                </button>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-red-100 text-red-600 font-bold'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {cat.count}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900">
          Price Range
        </h3>
        <ul className="space-y-3">
          {PRICE_RANGES.map((price) => {
            const isActive = currentPrice === price.value;
            return (
              <li key={price.value}>
                <button
                  onClick={() => updateFilter('price', price.value)}
                  className={`text-sm transition-colors ${
                    isActive
                      ? 'font-bold text-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {price.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900">
          Dietary
        </h3>
        <ul className="space-y-3">
          {DIETARY.map((diet) => {
            const rawValue = diet.toLowerCase();
            const isActive = currentDietary === rawValue;
            return (
              <li key={diet}>
                <button
                  onClick={() => updateFilter('dietary', rawValue)}
                  className={`text-sm transition-colors ${
                    isActive
                      ? 'font-bold text-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {diet}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold shadow-sm"
        >
          <Filter className="w-4 h-4 text-red-600" />
          Show Filters
        </button>
      </div>

      <aside className="hidden md:block w-64 flex-shrink-0">
        <FilterContent />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 md:hidden flex justify-end transition-opacity">
          <div className="w-4/5 max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-right overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Filter className="w-5 h-5 text-red-600" /> Filters
              </h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}
