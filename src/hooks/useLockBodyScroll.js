import { useEffect } from 'react';

/*
 * Several overlays can be open at once (cart drawer → quick view → confirm).
 * Each used to save/restore `overflow` on its own, so closing them out of order
 * could leave the page permanently unscrollable. A shared counter means the
 * first lock saves the original styles and the last unlock restores them.
 */
let activeLocks = 0;
let savedStyles = null;

/** Lock page scroll while a drawer/modal is open, without layout shift. */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const { body } = document;

    if (activeLocks === 0) {
      savedStyles = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    }
    activeLocks += 1;

    return () => {
      activeLocks -= 1;
      if (activeLocks === 0 && savedStyles) {
        body.style.overflow = savedStyles.overflow;
        body.style.paddingRight = savedStyles.paddingRight;
        savedStyles = null;
      }
    };
  }, [locked]);
}
