import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileNavDrawer } from './MobileNavDrawer';
import { SearchOverlay } from './SearchOverlay';
import { BackToTop } from '../ui';

/**
 * In a single-page app the browser never announces a "new page", so keyboard and
 * screen-reader users stay stranded on the link they just activated. After every
 * route change focus moves to <main> (the first render is skipped, so the skip link
 * and initial tab order are untouched).
 */
function useRouteFocus(ref) {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (window.location.hash) return;
    ref.current?.focus({ preventScroll: true });
  }, [pathname, ref]);
}

/** Application chrome shared by every route. */
export function Layout() {
  const mainRef = useRef(null);
  useRouteFocus(mainRef);

  /*
   * Root wrapper notes:
   *  - min-h uses dvh (falls back to vh): on phones 100vh is taller than the visible area, which left a
   *    blank strip under short pages.
   *  - overflow-clip: nothing that is translated / animated can extend the scrollable area below the
   *    footer (transforms count towards scroll height). Unlike overflow:hidden it keeps `sticky` working.
   */
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-clip bg-white dark:bg-night">
      <AnnouncementBar />
      <Header />

      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <Footer />

      {/* Global overlays */}
      <CartDrawer />
      <MobileNavDrawer />
      <SearchOverlay />
      <BackToTop />
    </div>
  );
}

export default Layout;
