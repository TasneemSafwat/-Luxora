import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

/**
 * Wordmark. Pure type — no image request, crisp at every size.
 */
export function Logo({ className, size = 'md', inverted = false, asLink = true }) {
  const sizes = {
    sm: 'text-base tracking-[0.3em]',
    md: 'text-xl tracking-[0.34em]',
    lg: 'text-3xl tracking-[0.3em]',
    xl: 'text-5xl tracking-[0.24em]',
  };

  const mark = (
    <span
      className={cn(
        'font-display font-medium uppercase leading-none',
        inverted ? 'text-white' : 'text-ink dark:text-cream',
        sizes[size] ?? sizes.md,
        className,
      )}
    >
      Luxora
    </span>
  );

  if (!asLink) return mark;

  return (
    <Link to="/" aria-label="LUXORA — home" className="inline-flex items-center">
      {mark}
    </Link>
  );
}

export default Logo;
