import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { digitsOnly } from '../../utils/card';
import { cn } from '../../utils/format';

/** Accessible quantity control shared by the PDP, cart and quick view. */
export function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', className, label }) {
  const { t } = useI18n();
  const name = label ?? t('product.quantity');
  const sizes = {
    sm: { wrap: 'h-9', btn: 'w-9', text: 'text-xs' },
    md: { wrap: 'h-11', btn: 'w-11', text: 'text-sm' },
    lg: { wrap: 'h-13', btn: 'w-13', text: 'text-base' },
  };
  const s = sizes[size] ?? sizes.md;
  const clamp = (next) => Math.max(min, Math.min(max, next));

  // Local draft text: the field can be emptied while typing ("" → "5") and the
  // value is committed on blur / Enter. Clamping on every keystroke made it
  // impossible to clear the box — deleting "1" snapped straight back to "1".
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = parseInt(digitsOnly(draft), 10);
    const next = Number.isNaN(parsed) ? value : clamp(parsed);
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <div
      className={cn('inline-flex items-center border border-line dark:border-night-border', s.wrap, className)}
      role="group"
      aria-label={name}
    >
      <button
        type="button"
        aria-label={`${t('common.decrease')} ${name}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={cn(
          'flex h-full items-center justify-center text-ink transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-35 dark:text-cream dark:hover:bg-white/10',
          s.btn,
        )}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        aria-label={name}
        value={draft}
        onChange={(event) => setDraft(digitsOnly(event.target.value).slice(0, 3))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
        }}
        onFocus={(event) => event.target.select()}
        className={cn('h-full w-11 border-x border-line bg-transparent text-center tabular-nums text-ink focus:outline-none dark:border-night-border dark:text-cream', s.text)}
      />

      <button
        type="button"
        aria-label={`${t('common.increase')} ${name}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={cn(
          'flex h-full items-center justify-center text-ink transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-35 dark:text-cream dark:hover:bg-white/10',
          s.btn,
        )}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export default QuantityStepper;
