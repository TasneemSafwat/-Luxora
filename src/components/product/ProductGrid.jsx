import { cn } from '../../utils/format';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '../ui';

const COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

/** Responsive product grid with built-in loading state. */
export function ProductGrid({ products = [], columns = 4, loading = false, skeletonCount = 8, className, emptyState }) {
  if (loading) return <ProductGridSkeleton count={skeletonCount} />;

  if (!products.length) return emptyState ?? null;

  return (
    <div className={cn('grid gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14', COLUMNS[columns] ?? COLUMNS[4], className)}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} priority={index < 4} />
      ))}
    </div>
  );
}

export default ProductGrid;
