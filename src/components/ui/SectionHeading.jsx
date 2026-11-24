import { cn } from '../../utils/format';

/** Consistent editorial section header used across every page. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'start',
  className,
  titleClassName,
  as: Heading = 'h2',
}) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-5',
        align === 'center' && 'items-center text-center',
        align === 'between' && 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="eyebrow mb-3.5 flex items-center gap-3">
            {align === 'center' && <span className="h-px w-6 bg-gold" aria-hidden="true" />}
            <span className={cn(align !== 'center' && 'before:me-3 before:inline-block before:h-px before:w-6 before:bg-gold before:align-middle')}>
              {eyebrow}
            </span>
          </p>
        )}

        <Heading className={cn('display-title text-balance', titleClassName)}>{title}</Heading>

        {subtitle && <p className="prose-lux mt-4 max-w-xl text-pretty">{subtitle}</p>}
      </div>

      {action && <div className={cn('shrink-0', align === 'center' && 'mt-2')}>{action}</div>}
    </div>
  );
}

export default SectionHeading;
