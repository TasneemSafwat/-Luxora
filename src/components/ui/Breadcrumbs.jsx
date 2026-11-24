import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';

/** Semantic breadcrumb trail with RTL-aware separators. */
export function Breadcrumbs({ items = [], className, showHome = true }) {
  const { isRTL, t } = useI18n();

  const trail = showHome ? [{ label: t('nav.home'), to: '/' }, ...items] : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-x-2">
              {index > 0 && (
                <ChevronRight className={cn('h-3 w-3 shrink-0 text-muted/60', isRTL && 'rotate-180')} aria-hidden="true" />
              )}
              {isLast || !item.to ? (
                <span aria-current="page" className="text-ash dark:text-cream">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink dark:hover:text-cream"
                >
                  {index === 0 && showHome && <Home className="h-3 w-3" aria-hidden="true" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
