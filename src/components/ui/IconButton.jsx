import { forwardRef } from 'react';
import { cn } from '../../utils/format';

/** Rounded borderless icon button used in the header, cards and galleries. */
export const IconButton = forwardRef(function IconButton(
  { label, active = false, size = 'md', className, children, ...props },
  ref,
) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full text-ink transition-all duration-300 ease-editorial',
        'hover:bg-ink-50 focus-visible:bg-ink-50 disabled:opacity-40 dark:text-cream dark:hover:bg-white/10',
        active && 'bg-ink-50 dark:bg-white/10',
        sizes[size] ?? sizes.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export default IconButton;
