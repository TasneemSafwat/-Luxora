import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/format';

const BASE =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium uppercase tracking-wide transition-all duration-300 ease-editorial disabled:pointer-events-none disabled:opacity-45';

const VARIANTS = {
  primary:
    'bg-ink text-white hover:bg-ink-800 dark:bg-cream dark:text-ink dark:hover:bg-white',
  gold: 'bg-gold text-ink hover:bg-gold-600 dark:bg-gold dark:text-ink-900 dark:hover:bg-gold-400',
  outline:
    'border border-ink/80 text-ink hover:bg-ink hover:text-white dark:border-cream/40 dark:text-cream dark:hover:bg-cream dark:hover:text-ink',
  outlineLight:
    'border border-white/60 text-white hover:bg-white hover:text-ink',
  subtle:
    'border border-line bg-transparent text-ash hover:border-ink hover:text-ink dark:border-night-border dark:text-cream dark:hover:border-cream/60',
  ghost: 'text-ink hover:bg-ink-50 dark:text-cream dark:hover:bg-white/5',
  link: 'px-0 text-ink underline-offset-4 hover:underline dark:text-cream',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

const SIZES = {
  xs: 'h-8 px-3 text-2xs',
  sm: 'h-9 px-4 text-2xs',
  md: 'h-11 px-6 text-2xs md:text-xs',
  lg: 'h-14 px-9 text-xs',
  icon: 'h-10 w-10',
  iconSm: 'h-9 w-9',
};

/**
 * Polymorphic button: renders a router <Link>, an <a>, or a <button>
 * depending on the props supplied — one consistent visual language everywhere.
 */
export const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    className,
    children,
    icon: Icon,
    iconRight: IconRight,
    ...props
  },
  ref,
) {
  const classes = cn(
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </>
  );

  if (to && !disabled && !loading) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href && !disabled && !loading) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  const Component = as ?? 'button';

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? type : undefined}
      className={classes}
      disabled={Component === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </Component>
  );
});

export default Button;
