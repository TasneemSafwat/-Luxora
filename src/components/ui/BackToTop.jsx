import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useScrolled } from '../../hooks/useUi';

/** Floating "back to top" affordance that appears after the first viewport. */
export function BackToTop() {
  const visible = useScrolled(600);
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t('common.back')}
          className="fixed bottom-5 start-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-soft backdrop-blur transition-colors hover:bg-ink hover:text-white dark:border-night-border dark:bg-night-card/95 dark:text-cream dark:hover:bg-cream dark:hover:text-ink"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default BackToTop;
