import { BadgeCheck, Heart, Package, Tag } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn, discountPercent, pseudoOriginalPrice } from '../../utils/format';

/** Price block: current price, struck original, and saving percentage. */
export function Price({ price, originalPrice, size = 'md', className, showSaving = true }) {
  const { formatPrice } = useI18n();
  const original = originalPrice ?? null;
  const saving = original ? discountPercent(price, original) : 0;

  const sizes = {
    sm: { now: 'text-sm', was: 'text-xs' },
    md: { now: 'text-[0.95rem]', was: 'text-sm' },
    lg: { now: 'text-xl md:text-2xl', was: 'text-base' },
    xl: { now: 'text-2xl md:text-3xl', was: 'text-lg' },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2.5 gap-y-1', className)}>
      <span className={cn('font-medium tabular-nums text-ink dark:text-cream', s.now)}>{formatPrice(price)}</span>

      {original && original > price && (
        <>
          <span className={cn('tabular-nums text-muted line-through', s.was)}>{formatPrice(original)}</span>
          {showSaving && saving > 0 && (
            <span className="text-2xs font-medium uppercase tracking-wide text-danger">−{saving}%</span>
          )}
        </>
      )}
    </div>
  );
}

/** Ensures every product shows an anchor price for the "sale" narrative. */
export function PriceWithFallback({ product, size, className, showSaving = true }) {
  const original = product.originalPrice ?? (product.discountPercentage > 0 ? pseudoOriginalPrice(product) : null);
  return (
    <Price price={product.price} originalPrice={original} size={size} className={className} showSaving={showSaving} />
  );
}

export function Badge({ tone = 'ink', children, className, icon: Icon }) {
  const tones = {
    ink: 'bg-ink text-white dark:bg-cream dark:text-ink',
    gold: 'bg-gold text-ink',
    light: 'bg-cream text-ink dark:bg-night-card dark:text-cream',
    outline: 'border border-line text-ash dark:border-night-border dark:text-cream',
    danger: 'bg-danger text-white',
    success: 'bg-success text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wide',
        tones[tone] ?? tones.ink,
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Product "flag" badge derived from discount + newness. */
export function ProductFlag({ product }) {
  const { t } = useI18n();

  if (product.stock === 0) {
    return <Badge tone="outline" className="bg-white/90 backdrop-blur dark:bg-night-card/90">{t('common.outOfStock')}</Badge>;
  }
  if (product.discountPercentage >= 15) {
    return <Badge tone="danger" icon={Tag}>−{product.discountPercentage}%</Badge>;
  }
  if (product.badge === 'New') return <Badge tone="ink" icon={BadgeCheck}>{t('common.new')}</Badge>;
  return null;
}

export function StockIndicator({ stock, className }) {
  const { t } = useI18n();
  if (stock === 0) return <span className={cn('text-xs text-danger', className)}>{t('common.outOfStock')}</span>;
  if (stock <= 12) return <span className={cn('text-xs text-warning', className)}>{t('product.stockLeft', { count: stock })}</span>;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-success', className)}>
      <Package className="h-3.5 w-3.5" aria-hidden="true" />
      {t('common.inStock')}
    </span>
  );
}

export function WishlistBadge({ count }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Heart className="h-3.5 w-3.5" aria-hidden="true" />
      {count}
    </span>
  );
}

export default Price;
