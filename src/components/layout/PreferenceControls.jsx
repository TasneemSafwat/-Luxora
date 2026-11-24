import { Globe, Moon, Sun, Check } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useTheme } from '../../hooks/useTheme';
import { CURRENCIES } from '../../utils/constants';
import { cn } from '../../utils/format';
import { IconButton } from '../ui/IconButton';
import { Dropdown } from '../ui/Dropdown';

export function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <IconButton
      label={`${t('common.theme')}: ${isDark ? t('common.dark') : t('common.light')}`}
      onClick={toggleTheme}
      className={className}
    >
      {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </IconButton>
  );
}

export function LanguageToggle({ className, variant = 'icon' }) {
  const { t, lang, toggleLang } = useI18n();

  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={toggleLang}
        className={cn('text-2xs font-medium uppercase tracking-wide text-ash transition-colors hover:text-gold dark:text-cream', className)}
        aria-label={t('common.language')}
      >
        {lang === 'en' ? 'العربية' : 'English'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t('common.language')}
      className={cn(
        'flex h-10 items-center gap-1.5 px-2 text-2xs font-medium uppercase tracking-wide text-ash transition-colors hover:text-ink dark:text-cream dark:hover:text-gold',
        className,
      )}
    >
      <Globe className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      <span aria-hidden="true">{lang}</span>
    </button>
  );
}

export function CurrencyMenu({ className, align = 'end' }) {
  const { currency, setCurrency, t } = useI18n();

  return (
    <Dropdown
      className={className}
      align={align}
      trigger={({ open }) => (
        <button
          type="button"
          className={cn(
            'flex h-10 items-center gap-1.5 px-2 text-2xs font-medium uppercase tracking-wide text-ash transition-colors hover:text-ink dark:text-cream dark:hover:text-gold',
            open && 'text-gold',
          )}
          aria-label={t('common.currency')}
        >
          {currency}
        </button>
      )}
      items={Object.values(CURRENCIES).map((item) => ({
        key: item.code,
        label: `${item.code} — ${item.label}`,
        icon: currency === item.code ? Check : undefined,
        active: currency === item.code,
        onSelect: () => setCurrency(item.code),
      }))}
    />
  );
}

export default ThemeToggle;
