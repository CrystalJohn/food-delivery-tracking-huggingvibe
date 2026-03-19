import { ProductCard, type Product } from './ProductCard';
import { Pagination } from '@/features/menu/components/Pagination';
import { SortSelect } from '@/features/menu/components/SortSelect';
import { menuService } from '@/features/menu/menu.service';
import type { MenuItem } from '@/types';

interface MenuGridProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

type MenuQueryParams = {
  category?: string;
  price?: string;
  dietary?: string;
  sort?: string;
  q?: string;
  page?: string;
};

type MenuCatalogItem = Product & {
  category: string;
  dietary?: string[];
};

const PAGE_SIZE = 8;
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600';

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseMenuQueryParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): MenuQueryParams {
  return {
    category: getSingleParam(searchParams.category),
    price: getSingleParam(searchParams.price),
    dietary: getSingleParam(searchParams.dietary),
    sort: getSingleParam(searchParams.sort),
    q: getSingleParam(searchParams.q),
    page: getSingleParam(searchParams.page),
  };
}

function applyPriceFilter(items: MenuCatalogItem[], priceRange?: string) {
  if (!priceRange) return items;

  const [minText, maxText] = priceRange.split('-');
  const minPrice = Number(minText);
  const maxPrice = Number(maxText);

  if (Number.isNaN(minPrice)) return items;

  return items.filter((item) => {
    if (Number.isNaN(maxPrice)) {
      return item.price >= minPrice;
    }

    return item.price >= minPrice && item.price <= maxPrice;
  });
}

function applySort(items: MenuCatalogItem[], sort?: string) {
  const sortedItems = [...items];

  switch (sort) {
    case 'price_asc':
      sortedItems.sort((left, right) => left.price - right.price);
      break;
    case 'price_desc':
      sortedItems.sort((left, right) => right.price - left.price);
      break;
    case 'rating':
      sortedItems.sort((left, right) => right.rating - left.rating);
      break;
    default:
      sortedItems.sort((left, right) => {
        const leftPopularScore = left.badge === 'POPULAR' ? 1 : 0;
        const rightPopularScore = right.badge === 'POPULAR' ? 1 : 0;
        return rightPopularScore - leftPopularScore || right.rating - left.rating;
      });
      break;
  }

  return sortedItems;
}

function toCatalogItem(item: MenuItem): MenuCatalogItem {
  const normalized = item as MenuItem & { _id?: string | number };
  const rawId = normalized.id ?? normalized._id;

  return {
    id: String(rawId),
    name: item.name,
    price: item.price,
    rating: 4.5,
    prepTime: '20-30 min',
    image: item.imageUrl || FALLBACK_IMAGE,
    description: item.description || '',
    badge: item.available ? undefined : 'SOLD OUT',
    category: item.category,
    dietary: [],
  };
}

export async function getFilteredMenuData(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const query = parseMenuQueryParams(searchParams);
  const currentPage = Math.max(1, Number(query.page) || 1);
  const normalizedSearch = query.q?.trim().toLowerCase();

  let apiItems: MenuItem[] = [];

  try {
    apiItems = query.category
      ? await menuService.getByCategory(query.category)
      : await menuService.getAll();
  } catch (error) {
    console.error('Failed to fetch menu items:', error);

    // Safe fallback so page does not break if category endpoint mismatches.
    if (query.category) {
      try {
        apiItems = await menuService.getAll();
      } catch {
        apiItems = [];
      }
    }
  }

  let filteredItems: MenuCatalogItem[] = apiItems.map(toCatalogItem);

  filteredItems = applyPriceFilter(filteredItems, query.price);

  if (query.dietary) {
    filteredItems = filteredItems.filter((item) =>
      item.dietary?.includes(query.dietary as string),
    );
  }

  if (normalizedSearch) {
    filteredItems = filteredItems.filter((item) => {
      const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  const sortedItems = applySort(filteredItems, query.sort);
  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + PAGE_SIZE);

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage: safePage,
  };
}

export async function MenuGrid({ searchParams }: MenuGridProps) {
  const { items, totalItems, totalPages, currentPage } =
    await getFilteredMenuData(searchParams);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu items</h2>
          <p className="text-sm text-gray-500 mt-1">Showing {totalItems} results</p>
        </div>
        <SortSelect />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>

      <div className="mt-12 flex justify-center pb-8">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </>
  );
}