import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loadCatalog, selectCatalogStatus } from './features/products/productsSlice';
import { useI18n } from './hooks/useI18n';
import { AppRoutes } from './routes/AppRoutes';
import { ToastViewport } from './components/ui';
import { QuickViewModal } from './components/product/QuickViewModal';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AlertTriangle } from 'lucide-react';

/**
 * Root component.
 *
 * Catalogue hydration lives here (rather than in a page) so search, filters,
 * wishlist and the home page all share one fetch and one cache.
 */
export function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectCatalogStatus);
  const { t } = useI18n();

  useEffect(() => {
    if (status === 'idle') dispatch(loadCatalog());
  }, [dispatch, status]);

  return (
    <>
      {status === 'loading' && (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-[120] h-0.5 overflow-hidden bg-transparent"
          aria-label={t('common.loading')}
        >
          <div className="h-full w-1/3 animate-marquee bg-gold" />
        </div>
      )}

      {status === 'failed' ? (
        <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          {/* A failure used to show a spinning loader, which read as "still working". */}
          <AlertTriangle className="h-6 w-6 text-danger" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-sm text-muted">{t('state.errorBody')}</p>
          <button
            type="button"
            onClick={() => dispatch(loadCatalog())}
            className="link-underline text-2xs uppercase tracking-wide text-ink dark:text-cream"
          >
            {t('state.retry')}
          </button>
        </div>
      ) : (
        <>
          <ScrollToTop />
          <AppRoutes />
        </>
      )}

      <ToastViewport />
      <QuickViewModal />
    </>
  );
}

export default App;
