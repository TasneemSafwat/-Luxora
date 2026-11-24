import { useEffect, useRef } from 'react';
import { useLatest } from './useLatest';

/** Invoke a handler when a click/touch happens outside the referenced element. */
export function useClickOutside(handler, { enabled = true } = {}) {
  const ref = useRef(null);
  const latest = useLatest(handler);

  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (event) => {
      const el = ref.current;
      if (!el || el.contains(event.target)) return;
      latest.current?.(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [enabled, latest]);

  return ref;
}
