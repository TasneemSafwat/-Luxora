import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/format';

/** Text input with label, hint, error and optional leading/trailing adornments. */
export const Input = forwardRef(function Input(
  { label, error, hint, id, className, leading: Leading, trailing: Trailing, required, ...props },
  ref,
) {
  // useId guarantees a unique, SSR-safe id even when the caller passes neither id nor name
  // (a label with htmlFor={undefined} is not connected to its input at all).
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
          {required && (
            <span className="ms-1 text-gold" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {Leading && (
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-muted">
            <Leading className="h-4 w-4" aria-hidden="true" />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn('field', Leading && 'ps-10', Trailing && 'pe-11', error && 'border-danger')}
          {...props}
        />

        {Trailing && <span className="absolute inset-y-0 end-0 flex items-center pe-1.5">{Trailing}</span>}
      </div>

      {error ? (
        <p id={`${inputId}-error`} role="alert" className="field-error flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      {hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
