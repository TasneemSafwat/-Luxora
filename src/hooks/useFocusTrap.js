import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isVisible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
const getFocusable = (root) => Array.from(root.querySelectorAll(FOCUSABLE)).filter(isVisible);

// Overlays can nest; only the top-most trap may react to Tab.
const trapStack = [];

/**
 * Modal focus management (WAI-ARIA dialog pattern):
 *  1. move focus into the dialog when it opens,
 *  2. keep Tab / Shift+Tab cycling inside it,
 *  3. hand focus back to whatever opened it when it closes.
 */
export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    const token = Symbol('focus-trap');
    trapStack.push(token);
    const previouslyFocused = document.activeElement;

    // Prefer an explicit autofocus target, then the first control, then the panel itself.
    const initial = container.querySelector('[data-autofocus]') ?? getFocusable(container)[0];
    if (initial) initial.focus({ preventScroll: true });
    else {
      container.setAttribute('tabindex', '-1');
      container.focus({ preventScroll: true });
    }

    const onKeyDown = (event) => {
      if (event.key !== 'Tab' || trapStack[trapStack.length - 1] !== token) return;
      const focusable = getFocusable(container);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = trapStack.indexOf(token);
      if (index !== -1) trapStack.splice(index, 1);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef]);
}
