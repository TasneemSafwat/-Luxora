import { Check } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';

/** Colour swatches with an accessible selected state. */
export function ColorPicker({ colors = [], value, onChange, label = 'Colour', error }) {
  // Selection keeps using the stored (English) colour name; only the visible label is translated.
  const { localizeColor } = useI18n();
  if (!colors.length) return null;

  return (
    <fieldset>
      <legend className="field-label flex items-center gap-2">
        {label}
        {value && <span className="text-muted normal-case tracking-normal">— {localizeColor(value)}</span>}
      </legend>

      <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label={label}>
        {colors.map((color) => {
          const selected = value === color.name;
          return (
            <button
              key={color.name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={localizeColor(color.name)}
              title={localizeColor(color.name)}
              onClick={() => onChange(color.name)}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300',
                selected
                  ? 'border-ink dark:border-cream'
                  : 'border-line hover:border-ink/50 dark:border-night-border dark:hover:border-cream/50',
              )}
            >
              <span
                className="h-6 w-6 rounded-full border border-black/10"
                style={{ backgroundColor: color.value }}
                aria-hidden="true"
              />
              {selected && (
                <Check
                  className={cn(
                    'absolute h-3.5 w-3.5',
                    ['#F7F7F5', '#F2EDE4', '#E8DFCF', '#EDE6DA'].includes(color.value.toUpperCase())
                      ? 'text-ink'
                      : 'text-white',
                  )}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

/** Size pills, with unavailable sizes visibly disabled. */
export function SizePicker({ sizes = [], value, onChange, label = 'Size', error, onOpenGuide }) {
  const { t } = useI18n();
  if (!sizes.length) return null;

  return (
    <fieldset>
      <div className="flex items-center justify-between gap-4">
        <legend className="field-label mb-2">{label}</legend>
        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="link-underline mb-2 text-2xs uppercase tracking-wide text-muted hover:text-ink dark:hover:text-cream"
          >
            {t('product.sizeGuide')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {sizes.map((size) => {
          const selected = value === size;
          return (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(size)}
              className={cn(
                'h-10 min-w-[3rem] border px-3 text-xs font-medium transition-all duration-300',
                selected
                  ? 'border-ink bg-ink text-white dark:border-cream dark:bg-cream dark:text-ink'
                  : 'border-line text-ash hover:border-ink dark:border-night-border dark:text-cream dark:hover:border-cream/60',
              )}
            >
              {size === 'One Size' ? t('product.oneSize') : size}
            </button>
          );
        })}
      </div>

      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

export default ColorPicker;
