import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';

/** Build a compact page list with ellipses, e.g. 1 … 4 5 6 … 12 */
function buildPages(current, total, siblings = 1) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current]);
  for (let i = 1; i <= siblings; i += 1) {
    if (current - i > 1) pages.add(current - i);
    if (current + i < total) pages.add(current + i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('…');
    result.push(page);
  });
  return result;
}

export function Pagination({ page, totalPages, onChange, className }) {
  const { isRTL } = useI18n();

  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);
  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  const btn =
    'flex h-9 min-w-9 items-center justify-center border px-2 text-xs tabular-nums transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(btn, 'border-line text-ash hover:border-ink hover:text-ink dark:border-night-border dark:text-cream')}
      >
        <Prev className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {pages.map((item, index) =>
        item === '…' ? (
          <span key={`gap-${index}`} className="px-1.5 text-xs text-muted">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onChange(item)}
            className={cn(
              btn,
              item === page
                ? 'border-ink bg-ink text-white dark:border-cream dark:bg-cream dark:text-ink'
                : 'border-line text-ash hover:border-ink hover:text-ink dark:border-night-border dark:text-cream',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(btn, 'border-line text-ash hover:border-ink hover:text-ink dark:border-night-border dark:text-cream')}
      >
        <Next className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;
