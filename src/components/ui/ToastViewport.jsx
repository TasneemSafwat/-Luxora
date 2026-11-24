import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { dismissToast, selectToasts } from '../../features/ui/uiSlice';
import { cn } from '../../utils/format';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const ACCENTS = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-gold',
};

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] ?? Info;

  useEffect(() => {
    if (!toast.duration) return undefined;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto flex w-[min(92vw,22rem)] items-start gap-3 border border-line bg-white p-4 shadow-lift dark:border-night-border dark:bg-night-card"
      role="status"
    >
      <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', ACCENTS[toast.type])} aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-medium text-ink dark:text-cream">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs leading-relaxed text-muted">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-me-1 -mt-1 rounded-full p-1 text-muted transition-colors hover:bg-ink-50 hover:text-ink dark:hover:bg-white/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.li>
  );
}

/** Global toast viewport — mounted once at the app root. */
export function ToastViewport() {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();

  const handleDismiss = (id) => dispatch(dismissToast(id));

  return (
    <ul
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-5 end-5 z-[100] flex flex-col items-end gap-2.5"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </ul>
  );
}

export default ToastViewport;
