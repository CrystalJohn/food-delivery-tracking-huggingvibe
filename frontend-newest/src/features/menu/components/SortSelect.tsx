'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${pathname}?${createQueryString('sort', e.target.value)}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-500 hidden sm:inline-block">Sort by:</label>
      <select 
        id="sort"
        onChange={handleSort}
        value={searchParams.get('sort') || ''}
        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-red-500 focus:border-red-500 block px-4 py-2 pr-8 appearance-none outline-none cursor-pointer shadow-sm"
      >
        <option value="">Recommended</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}