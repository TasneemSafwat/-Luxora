import { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/format';

export const Textarea = forwardRef(function Textarea({ label, error, id, className, rows = 4, ...props }, ref) {
  const inputId = id ?? props.name;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn('field h-auto resize-none py-3', error && 'border-danger')}
        {...props}
      />
      {error && (
        <p role="alert" className="field-error flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, id, options = [], placeholder, className, children, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(
            'field cursor-pointer appearance-none pe-10',
            error && 'border-danger',
            !props.value && 'text-muted',
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children ??
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label ?? option.value}
              </option>
            ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 end-3.5 my-auto h-4 w-4 text-muted"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p role="alert" className="field-error flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});

export const Checkbox = forwardRef(function Checkbox({ label, error, id, className, ...props }, ref) {
  const inputId = id ?? props.name;

  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={inputId} className="group flex cursor-pointer items-start gap-3 text-sm text-ash dark:text-cream">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none border border-line transition-colors
            checked:border-ink checked:bg-ink dark:border-night-border dark:checked:border-cream dark:checked:bg-cream
            bg-[length:12px] bg-center bg-no-repeat
            checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22><path d=%22M20 6 9 17l-5-5%22/></svg>')]
            dark:checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23171717%22 stroke-width=%223%22><path d=%22M20 6 9 17l-5-5%22/></svg>')]"
          {...props}
        />
        {label && <span className="leading-snug">{label}</span>}
      </label>
      {error && (
        <p role="alert" className="field-error ms-7 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});

export const Radio = forwardRef(function Radio({ label, description, id, className, ...props }, ref) {
  const inputId = id ?? props.value;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex cursor-pointer items-start gap-3 border border-line p-4 transition-colors duration-200',
        'has-[:checked]:border-ink has-[:checked]:bg-ink-50/60 dark:border-night-border dark:has-[:checked]:border-cream/60 dark:has-[:checked]:bg-white/5',
        className,
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border border-line
          checked:border-[5px] checked:border-ink dark:border-night-border dark:checked:border-cream"
        {...props}
      />
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink dark:text-cream">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
});

export default Textarea;
