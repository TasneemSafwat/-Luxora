import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/format';

/** Single accordion row (controlled by the parent for single-open behaviour). */
export function AccordionItem({ title, children, open, onToggle, id }) {
  return (
    <div className="border-b border-line dark:border-night-border">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`panel-${id}`}
          id={`trigger-${id}`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-start transition-colors hover:text-gold"
        >
          <span className="text-sm font-medium text-ink dark:text-cream">{title}</span>
          <span className="shrink-0 text-muted">{open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`panel-${id}`}
            role="region"
            aria-labelledby={`trigger-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm leading-relaxed text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Accordion({ items = [], defaultOpen = 0, className, allowMultiple = false }) {
  const [openIds, setOpenIds] = useState(() => (defaultOpen === null ? [] : [defaultOpen]));
  // Two accordions on one page (or two items sharing an id) used to produce duplicate DOM ids,
  // which breaks aria-controls / aria-labelledby.
  const uid = useId();

  const toggle = (index) => {
    setOpenIds((current) => {
      const isOpen = current.includes(index);
      if (allowMultiple) return isOpen ? current.filter((i) => i !== index) : [...current, index];
      return isOpen ? [] : [index];
    });
  };

  return (
    <div className={cn('border-t border-line dark:border-night-border', className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id ?? item.title}
          id={`${uid}-${item.id ?? index}`}
          title={item.title}
          open={openIds.includes(index)}
          onToggle={() => toggle(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}

export default Accordion;
