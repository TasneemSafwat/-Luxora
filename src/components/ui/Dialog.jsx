import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEscapeKey } from '../../hooks/useUi';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';
import { IconButton } from './IconButton';

/**
 * Portal-based overlay used by both the modal and the drawer.
 * Handles body-scroll locking, Escape-to-close and initial focus.
 */
function Overlay({ open, onClose, children }) {
  const panelRef = useRef(null);
  // Unique per instance: two dialogs mounted at once used to share one id.
  const labelledBy = useId();

  useLockBodyScroll(open);
  useEscapeKey(onClose, open);
  useFocusTrap(panelRef, open);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex" role="presentation">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px] dark:bg-black/65"
          />
          {children(panelRef, labelledBy)}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', hideClose = false }) {
  const { t } = useI18n();

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-6xl',
  };

  return (
    <Overlay open={open} onClose={onClose}>
      {(panelRef, labelledBy) => (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? labelledBy : undefined}
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.99 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'relative z-10 m-auto flex max-h-[92vh] w-[calc(100%-2rem)] flex-col border border-line bg-white shadow-lift dark:border-night-border dark:bg-night-soft',
            sizes[size] ?? sizes.md,
          )}
        >
          {!hideClose && (
            <IconButton label={t('common.close')} onClick={onClose} className="absolute end-3 top-3 z-10">
              <X className="h-4.5 w-4.5" />
            </IconButton>
          )}

          {(title || description) && (
            <header className="border-b border-line px-6 py-5 pe-14 dark:border-night-border">
              {title && (
                <h2 id={labelledBy} className="font-display text-xl font-normal text-ink dark:text-cream">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </header>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

          {footer && <footer className="border-t border-line px-6 py-4 dark:border-night-border">{footer}</footer>}
        </motion.div>
      )}
    </Overlay>
  );
}

export function Drawer({ open, onClose, title, children, side = 'end', size = 'md', footer }) {
  const { isRTL, t } = useI18n();
  const isStartSide = side === 'start';
  const offset = (isStartSide ? -1 : 1) * (isRTL ? -1 : 1);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  return (
    <Overlay open={open} onClose={onClose}>
      {(panelRef, labelledBy) => (
        <motion.aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? labelledBy : undefined}
          initial={{ x: `${offset * 100}%` }}
          animate={{ x: 0 }}
          exit={{ x: `${offset * 100}%` }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'relative z-10 ms-auto flex h-full w-full flex-col bg-white shadow-lift dark:bg-night-soft',
            isStartSide && 'me-auto ms-0',
            sizes[size] ?? sizes.md,
          )}
        >
          <header className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-night-border">
            <h2
              id={labelledBy}
              className="font-display text-base font-normal uppercase tracking-wide text-ink dark:text-cream"
            >
              {title}
            </h2>
            <IconButton label={t('common.close')} onClick={onClose}>
              <X className="h-4.5 w-4.5" />
            </IconButton>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

          {footer && <footer className="border-t border-line px-5 py-4 dark:border-night-border">{footer}</footer>}
        </motion.aside>
      )}
    </Overlay>
  );
}

export default Modal;
