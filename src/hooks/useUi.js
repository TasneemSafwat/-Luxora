import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLatest } from './useLatest';

// Overlays can stack (drawer → modal → confirm). Escape must close only the top-most one.
const escapeStack = [];

/** Close the top-most floating panel on Escape. */
export function useEscapeKey(handler, enabled = true) {
  const latest = useLatest(handler);

  useEffect(() => {
    if (!enabled) return undefined;
    const token = Symbol('escape');
    escapeStack.push(token);

    const onKey = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (escapeStack[escapeStack.length - 1] !== token) return;
      latest.current?.(event);
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const index = escapeStack.indexOf(token);
      if (index !== -1) escapeStack.splice(index, 1);
    };
  }, [enabled, latest]);
}

/** Reports whether the window has scrolled past a threshold. */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

/** Simple boolean disclosure state with stable handlers. */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  return useMemo(() => ({ isOpen, open, close, toggle, set: setIsOpen }), [isOpen, open, close, toggle]);
}
