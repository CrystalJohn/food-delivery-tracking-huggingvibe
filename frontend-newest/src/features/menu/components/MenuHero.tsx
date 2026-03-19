import { Button } from '@/components/ui/Button';

export function MenuHero() {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900 rounded-3xl overflow-hidden mb-8 mt-0">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: 'url("/Image-menu.png")' }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 w-full md:w-2/3">
        <span className="inline-block bg-red-600/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-red-600/50 w-max">
          Free Delivery on First Order
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
          Authentic Vietnamese <br />
          <span className="text-red-500">Cuisine Delivered</span>
        </h1>
        <p className="text-gray-200 text-lg mb-8 max-w-md">
          Experience the vibrant flavors of Vietnam. From savory Pho to crispy Banh Mi,
          enjoy restaurant-quality meals at your doorstep.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-6 text-lg font-bold w-max">
            Order Now -&gt;
          </Button>
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white/10 hover:text-white rounded-full px-8 py-6 text-lg font-bold w-max bg-white/5 backdrop-blur-sm"
          >
            View Menu
          </Button>
        </div>
      </div>
    </div>
  );
}