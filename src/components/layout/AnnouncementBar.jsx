import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

const DISMISS_KEY = 'luxora.announce.dismissed';
const ROTATE_MS = 6000;

/** Each message deep-links to where it makes sense to act on it. */
const LINKS = ['/shop', '/register', '/shop?collection=new'];

/** sessionStorage can throw (privacy modes), and must never break the page. */
const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Rotating announcement bar.
 *  - messages are links, not dead text
 *  - rotation pauses while hovered / focused (WCAG 2.2.2: moving content must be pausable)
 *    and never starts for people who prefer reduced motion
 *  - dismissible for the rest of the session
 *  - polite live region so screen readers hear a change without being interrupted
 */
export function AnnouncementBar() {
  const { t } = useI18n();
  const messages = [t('announce.1'), t('announce.2'), t('announce.3')];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (paused || dismissed || reduceMotion) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % messages.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, dismissed, reduceMotion, messages.length]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="relative border-b border-white/5 bg-ink text-white dark:bg-night-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="lux-container relative flex min-h-[2.5rem] items-center justify-center py-1.5">
        {/* Position dots — also let people jump to a specific message */}
        <div className="absolute start-0 hidden items-center gap-1.5 md:flex" role="group" aria-label="Announcements">
          {messages.map((_, dot) => (
            <button
              key={dot}
              type="button"
              onClick={() => setIndex(dot)}
              aria-label={`${dot + 1} / ${messages.length}`}
              aria-current={dot === index}
              className="group flex h-6 w-3 items-center justify-center"
            >
              <span
                className={`h-1 rounded-full transition-all duration-300 ${
                  dot === index ? 'w-4 bg-gold' : 'w-1 bg-white/30 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="overflow-hidden px-8 md:px-24" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={LINKS[index] ?? '/shop'}
                className="group inline-flex items-center gap-2 text-center text-2xs uppercase tracking-eyebrow text-white/85 transition-colors hover:text-white rtl:tracking-normal"
              >
                <span>{messages[index]}</span>
                <ArrowRight
                  className="hidden h-3 w-3 shrink-0 text-gold transition-transform group-hover:translate-x-0.5 sm:block rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label={t('common.close')}
          className="absolute end-0 flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-white"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default AnnouncementBar;
