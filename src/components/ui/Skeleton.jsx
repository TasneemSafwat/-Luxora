import { cn } from '../../utils/format';

/** Shimmering placeholder block. */
export function Skeleton({ className, rounded = 'rounded-none' }) {
  return <div aria-hidden="true" className={cn('skeleton', rounded, className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-fade-in">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="mt-4 space-y-2.5">
        <Skeleton className="h-3 w-20" rounded="rounded-sm" />
        <Skeleton className="h-4 w-3/4" rounded="rounded-sm" />
        <Skeleton className="h-4 w-24" rounded="rounded-sm" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2.5', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          rounded="rounded-sm"
          className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export default Skeleton;
