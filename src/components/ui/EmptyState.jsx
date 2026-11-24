import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';
import { Button } from './Button';

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border border-dashed border-line bg-cream-soft/60 px-6 text-center dark:border-night-border dark:bg-night-soft/60',
        compact ? 'py-12' : 'py-20 md:py-28',
        className,
      )}
    >
      {Icon && (
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-ink dark:border-night-border dark:bg-night-card dark:text-cream">
          <Icon className="h-6 w-6" strokeWidth={1.25} aria-hidden="true" />
        </span>
      )}
      <h3 className="font-display text-xl font-normal text-ink dark:text-cream">{title}</h3>
      {description && <p className="prose-lux mt-2.5 max-w-md">{description}</p>}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, onRetry, className }) {
  const { t } = useI18n();

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center border border-line bg-white px-6 py-16 text-center dark:border-night-border dark:bg-night-soft',
        className,
      )}
    >
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h3 className="font-display text-xl font-normal text-ink dark:text-cream">{title ?? t('state.errorTitle')}</h3>
      <p className="prose-lux mt-2.5 max-w-md">{description ?? t('state.errorBody')}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-7" icon={RotateCcw} onClick={onRetry}>
          {t('state.retry')}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
