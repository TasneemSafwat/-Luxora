import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Search, TrendingUp, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectSearchOpen, setSearchOpen } from '../../features/ui/uiSlice';
import { selectAllProducts } from '../../features/products/productsSlice';
import { searchableText } from '../../i18n/productI18n';
import { searchProducts } from '../../services/productsApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useEscapeKey } from '../../hooks/useUi';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useI18n } from '../../hooks/useI18n';
import { CATEGORY_META } from '../../utils/constants';
import { cn } from '../../utils/format';
import { SmartImage } from '../common/SmartImage';
import { ProductFlag } from '../ui/PriceBadge';

const POPULAR = ['Silk dress', 'Cashmere', 'Gold jewellery', 'Fragrance', 'Leather bag', 'Sunglasses'];

/**
 * Command-palette style search overlay.
 * Results come from the API (debounced); recent searches persist locally.
 */
export function SearchOverlay() {
  const open = useAppSelector(selectSearchOpen);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, formatPrice, lang, localize } = useI18n();
  const { recent, record, removeOne, clear } = useRecentSearches();
  const catalogue = useAppSelector(selectAllProducts);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const panelRef = useRef(null);
  const debouncedQuery = useDebounce(query, 320);

  useLockBodyScroll(open);
  useEscapeKey(() => dispatch(setSearchOpen(false)), open);
  // Focus lands on the search field ([data-autofocus]) and Tab stays inside the overlay.
  useFocusTrap(panelRef, open);

  // Start every session from a clean slate.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    setStatus('idle');
  }, [open]);

  // Debounced live search against the service layer.
  useEffect(() => {
    if (!open) return undefined;
    const term = debouncedQuery.trim();
    if (term.length < 2) {
      setResults([]);
      setStatus('idle');
      return undefined;
    }

    // The remote search API only understands English. Arabic queries are matched locally against the
    // catalogue's Arabic names/brands (and English ones too), so Arabic shoppers can search in Arabic.
    if (/[\u0600-\u06FF]/.test(term)) {
      const needle = term.toLowerCase();
      setResults(catalogue.filter((item) => searchableText(item).includes(needle)).slice(0, 6));
      setStatus('done');
      return undefined;
    }

    // Abort the previous request instead of merely ignoring its answer: stale
    // searches no longer keep running (or finish out of order) while the shopper types.
    const controller = new AbortController();
    setStatus('loading');

    searchProducts(term, { limit: 6, signal: controller.signal })
      .then((response) => {
        setResults(response.products);
        setStatus('done');
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setResults([]);
        setStatus('error');
        if (import.meta.env.MODE !== 'production') console.warn('Search failed', error);
      });

    return () => controller.abort();
  }, [debouncedQuery, open, catalogue]);

  const categoryMatches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    return Object.entries(CATEGORY_META)
      .filter(([slug, meta]) => slug.includes(term) || meta.en.toLowerCase().includes(term) || meta.ar.includes(term))
      .slice(0, 3);
  }, [query]);

  const submit = (term) => {
    const value = String(term || '').trim();
    if (!value) return;
    record(value);
    dispatch(setSearchOpen(false));
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex flex-col" role="dialog" aria-modal="true" aria-label={t('search.title')}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => dispatch(setSearchOpen(false))}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm dark:bg-black/70"
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[92vh] overflow-y-auto border-b border-line bg-white dark:border-night-border dark:bg-night-soft"
          >
            <div className="lux-container py-6 md:py-8">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit(query);
                }}
                className="flex items-center gap-4 border-b border-line pb-5 dark:border-night-border"
              >
                <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                <input
                  data-autofocus
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('search.placeholder')}
                  aria-label={t('search.title')}
                  className="h-10 flex-1 bg-transparent font-display text-lg text-ink placeholder:text-muted/70 focus:outline-none md:text-2xl dark:text-cream"
                />
                <button
                  type="button"
                  onClick={() => dispatch(setSearchOpen(false))}
                  aria-label={t('common.close')}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink-50 hover:text-ink dark:hover:bg-white/10"
                >
                  <X className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
              </form>

              <div className="grid gap-10 py-8 lg:grid-cols-[1.6fr_1fr]">
                {/* Left: live results / empty prompt */}
                <div>
                  {query.trim().length >= 2 ? (
                    <>
                      <p className="eyebrow mb-4" role="status" aria-live="polite">
                        {status === 'loading' ? t('common.loading') : `${results.length} ${t('search.products')}`}
                      </p>

                      {results.length > 0 ? (
                        <ul className="space-y-1">
                          {results.map((product) => (
                            <li key={product.id}>
                              <Link
                                to={`/product/${product.id}`}
                                onClick={() => {
                                  record(query);
                                  dispatch(setSearchOpen(false));
                                }}
                                className="group flex w-full items-center gap-4 border-b border-line/70 py-3 text-start transition-colors hover:bg-cream-soft/60 dark:border-night-border/70 dark:hover:bg-white/5"
                              >
                                <SmartImage
                                  src={product.thumbnail}
                                  alt={localize(product).title}
                                  prompt={`${product.title} luxury product photography`}
                                  wrapperClassName="h-16 w-14 shrink-0"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-ink dark:text-cream">
                                      {localize(product).title}
                                    </span>
                                    <ProductFlag product={product} />
                                  </span>
                                  <span className="mt-1 block text-2xs uppercase tracking-wide text-muted">
                                    {localize(product).brand}
                                  </span>
                                </span>
                                <span className="shrink-0 text-sm tabular-nums text-ash dark:text-cream">
                                  {formatPrice(product.price)}
                                </span>
                                <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        status === 'done' && (
                          <div className="border border-dashed border-line px-6 py-12 text-center dark:border-night-border">
                            <p className="font-display text-lg text-ink dark:text-cream">
                              {t('search.empty', { query })}
                            </p>
                            <p className="prose-lux mt-2">{t('search.emptyBody')}</p>
                          </div>
                        )
                      )}

                      {results.length > 0 && (
                        <button
                          type="button"
                          onClick={() => submit(query)}
                          className="link-underline mt-6 inline-flex items-center gap-2 text-2xs uppercase tracking-wide text-ink dark:text-cream"
                        >
                          {t('search.viewAllResults')}
                          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="eyebrow mb-4">{t('search.popular')}</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="border border-line px-3.5 py-2 text-xs text-ash transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:text-cream dark:hover:border-cream/60"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Right: recents + categories */}
                <aside className="space-y-8">
                  {recent.length > 0 && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="eyebrow">{t('search.recent')}</p>
                        <button
                          type="button"
                          onClick={clear}
                          className="link-underline text-2xs uppercase tracking-wide text-muted hover:text-ink dark:hover:text-cream"
                        >
                          {t('search.clearRecent')}
                        </button>
                      </div>
                      <ul className="space-y-1">
                        {recent.map((term) => (
                          <li key={term} className="group flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setQuery(term)}
                              className="flex flex-1 items-center gap-3 py-2 text-start text-sm text-ash transition-colors hover:text-ink dark:text-cream/85 dark:hover:text-cream"
                            >
                              <Clock className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                              {term}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeOne(term)}
                              aria-label={t('search.remove', { term })}
                              className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="eyebrow mb-4 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                      {t('search.categories')}
                    </p>
                    <ul className="space-y-1">
                      {(categoryMatches.length
                        ? categoryMatches
                        : Object.entries(CATEGORY_META).slice(0, 6)
                      ).map(([slug, meta]) => (
                        <li key={slug}>
                          <Link
                            to={`/shop?category=${slug}`}
                            onClick={() => dispatch(setSearchOpen(false))}
                            className={cn(
                              'flex w-full items-center justify-between py-2 text-start text-sm text-ash transition-colors hover:text-ink dark:text-cream/85 dark:hover:text-cream',
                            )}
                          >
                            {lang === 'ar' ? meta.ar : meta.en}
                            <ArrowRight className="h-3.5 w-3.5 text-muted rtl:rotate-180" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                </aside>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default SearchOverlay;
