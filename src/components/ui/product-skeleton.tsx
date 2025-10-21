import { Skeleton } from "./skeleton";
import { Card, CardContent } from "./card";

export function ProductSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <Skeleton className="w-full h-48 rounded-t-lg" />
        <Skeleton className="absolute top-2 left-2 w-16 h-6" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function CategorySkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-16 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}

export function CategorySkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
}
