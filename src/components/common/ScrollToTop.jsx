import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset scroll on page changes.
 * Keyed on pathname only: it used to also react to the query string, so every
 * filter / sort / checkbox change on the shop page threw the shopper back to the top.
 * In-page anchors (#hash) are left alone.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
