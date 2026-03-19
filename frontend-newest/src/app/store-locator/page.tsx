import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';

export default function StoreLocatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />
      <main className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Store Locator</h1>
          <p className="text-lg text-gray-600">
            Store locator page is ready for API integration (store list, nearest branch,
            opening hours, and map embed).
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}