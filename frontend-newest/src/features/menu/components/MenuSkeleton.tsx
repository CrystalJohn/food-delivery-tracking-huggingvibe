export function MenuSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 flex flex-col">
            <div className="w-full aspect-[4/3] bg-gray-200" />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}