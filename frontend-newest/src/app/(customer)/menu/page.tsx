import { Suspense } from 'react';
import { MenuSearchBar } from '@/features/menu/components/MenuSearchBar';
import { MenuHero } from '@/features/menu/components/MenuHero';
import { SidebarFilter } from '@/features/menu/components/SidebarFilter';
import { MenuGrid } from '@/features/menu/components/MenuGrid';
import { MenuSkeleton } from '@/features/menu/components/MenuSkeleton';

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 flex-1">
        <MenuSearchBar />
        <MenuHero />

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <SidebarFilter />

          <div className="flex-1 min-w-0">
            <Suspense fallback={<MenuSkeleton />} key={JSON.stringify(resolvedParams)}>
              <MenuGrid searchParams={resolvedParams} />
            </Suspense>
          </div>
        </div>
      </div>

    </div>
  );
}