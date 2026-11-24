import { Star } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn, formatNumber } from '../../utils/format';

/** Accessible star rating with optional review count. */
export function Rating({ value = 0, count, size = 'sm', showValue = false, className }) {
  const sizes = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const starClass = sizes[size] ?? sizes.sm;
  const rounded = Math.round(value * 2) / 2;
  const { t, locale } = useI18n();
  // Counts are whole numbers by definition; rounding here guards against float noise from any data source.
  const reviews = count === undefined || count === null ? null : Math.max(0, Math.round(Number(count) || 0));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${t('rating.outOf', { value: value.toFixed(1) })}${reviews ? `, ${t('rating.reviewsCount', { count: formatNumber(reviews, locale) })}` : ''}`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className="relative inline-flex">
              <Star className={cn(starClass, 'text-gold/30')} strokeWidth={1.25} aria-hidden="true" />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? '50%' : '100%' }}
                  aria-hidden="true"
                >
                  <Star className={cn(starClass, 'fill-gold text-gold')} strokeWidth={1.25} />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {showValue && <span className="text-xs tabular-nums text-ash dark:text-cream">{value.toFixed(1)}</span>}

      {reviews !== null && <span className="text-xs text-muted">({formatNumber(reviews, locale)})</span>}
    </div>
  );
}

/** Interactive star input for the review form. */
export function RatingInput({ value = 0, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition-transform duration-200 hover:scale-110"
          >
            <Star
              className={cn('h-5 w-5 transition-colors', star <= value ? 'fill-gold text-gold' : 'text-gold/30')}
              strokeWidth={1.25}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-muted">{value ? `${value}.0` : ''}</span>
    </div>
  );
}

export default Rating;
