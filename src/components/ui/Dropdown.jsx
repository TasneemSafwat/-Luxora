import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useUi';
import { cn } from '../../utils/format';

/**
 * Minimal, accessible dropdown menu.
 * Closes on outside click, Escape and selection; supports arrow-key traversal.
 */
export function Dropdown({ trigger, items = [], align = 'end', className, panelClassName }) {
  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside(() => setOpen(false), { enabled: open });
  const listRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useEscapeKey(close, open);

  const onKeyDown = (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const focusables = [...(listRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];
    const index = focusables.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
    focusables[(next + focusables.length) % focusables.length]?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        {trigger({ open })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            role="menu"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute top-[calc(100%+0.5rem)] z-50 min-w-[13rem] border border-line bg-white p-1.5 shadow-lift dark:border-night-border dark:bg-night-card',
              align === 'end' ? 'end-0' : 'start-0',
              panelClassName,
            )}
          >
            {items.map((item) =>
              item.divider ? (
                <div key={item.key} className="my-1.5 h-px bg-line dark:bg-night-border" />
              ) : (
                <button
                  key={item.key ?? item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onSelect?.();
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-start text-sm transition-colors duration-200',
                    'hover:bg-ink-50 focus-visible:bg-ink-50 disabled:opacity-40 dark:hover:bg-white/10 dark:focus-visible:bg-white/10',
                    item.active ? 'text-ink dark:text-cream' : 'text-ash dark:text-cream/85',
                    item.danger && 'text-danger hover:bg-danger/10',
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  <span className="flex-1">{item.label}</span>
                  {item.meta && <span className="text-xs text-muted">{item.meta}</span>}
                </button>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Compact native-style select styled as a dropdown trigger. */
export function FilterSelect({ value, onChange, options, label, className }) {
  return (
    <label className={cn('relative inline-flex items-center gap-2', className)}>
      {label && <span className="hidden text-2xs uppercase tracking-wide text-muted sm:inline">{label}</span>}
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 cursor-pointer appearance-none border border-line bg-transparent ps-3.5 pe-9 text-xs text-ash transition-colors hover:border-ink focus:border-ink focus:outline-none dark:border-night-border dark:text-cream dark:hover:border-cream/60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute inset-y-0 end-3 my-auto h-3.5 w-3.5 text-muted" aria-hidden="true" />
      </span>
    </label>
  );
}

export default Dropdown;
