import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Search, SearchX, X } from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import { searchProducts } from '../services/productsApi';
import { selectAllProducts } from '../features/products/productsSlice';
import { searchableText } from '../i18n/productI18n';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useI18n } from '../hooks/useI18n';
import { CATEGORY_META, SORT_OPTIONS } from '../utils/constants';
import { Breadcrumbs, Button, EmptyState, ErrorState, FilterSelect, Input } from '../components/ui';
import { ProductGrid } from '../components/product/ProductGrid';
import { Seo } from '../components/common/Seo';

const ALL_CATEGORIES = '';

export function SearchResults() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [searchParams] = useSearchParams();
  const { recent, record, removeOne, clear } = useRecentSearches();

  const q = searchParams.get('q') ?? '';

  const [term, setTerm] = useState(q);
  const catalogue = useAppSelector(selectAllProducts);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState(() => (q.trim() ? 'loading' : 'idle'));
  const [reloadKey, setReloadKey] = useState(0);
  const [sort, setSort] = useState(SORT_OPTIONS[0].id);
  const [category, setCategory] = useState(ALL_CATEGORIES);

  // Keep the field in sync with the URL (chips, back/forward navigation).
  useEffect(() => {
    setTerm(q);
  }, [q]);

  // Remember the searched term without depending on the (unstable) recorder.
  const recordRef = useRef(record);
  recordRef.current = record;
  useEffect(() => {
    const value = q.trim();
    if (value.length >= 2) recordRef.current(value);
  }, [q]);

  // Fetch from the service layer; a `cancelled` flag guards against races.
  useEffect(() => {
    const value = q.trim();
    if (!value) {
      setResults([]);
      setStatus('idle');
      return undefined;
    }

    // The remote search API only understands English: Arabic queries are matched locally against the
    // catalogue's Arabic (and English) names, brands and tags.
    if (/[\u0600-\u06FF]/.test(value)) {
      const needle = value.toLowerCase();
      setResults(catalogue.filter((item) => searchableText(item).includes(needle)).slice(0, 40));
      setStatus('done');
      return undefined;
    }

    let cancelled = false;
    setStatus('loading');

    searchProducts(value, { limit: 40 })
      .then((response) => {
        if (cancelled) return;
        setResults(response.products);
        setStatus('done');
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [q, reloadKey, catalogue]);

  // A new query deserves a fresh, unfiltered view.
  useEffect(() => {
    setCategory(ALL_CATEGORIES);
  }, [q]);

  const sortOptions = useMemo(
    () => SORT_OPTIONS.map((option) => ({ value: option.id, label: lang === 'ar' ? option.labelAr : option.label })),
    [lang],
  );

  const categoryOptions = useMemo(() => {
    const slugs = [...new Set(results.map((item) => item.category))];
    return [
      { value: ALL_CATEGORIES, label: lang === 'ar' ? 'الكل' : 'All' },
      ...slugs.map((slug) => {
        const meta = CATEGORY_META[slug];
        return { value: slug, label: meta ? (lang === 'ar' ? meta.ar : meta.en) : slug };
      }),
    ];
  }, [results, lang]);

  const categoryLabel = useMemo(() => {
    if (!category) return '';
    const meta = CATEGORY_META[category];
    return meta ? (lang === 'ar' ? meta.ar : meta.en) : category;
  }, [category, lang]);

  const filtered = useMemo(() => {
    const list = category ? results.filter((item) => item.category === category) : results;
    const sorted = [...list];

    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.meta?.createdAt ?? 0) - new Date(a.meta?.createdAt ?? 0));
        break;
      case 'discount':
        sorted.sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0));
        break;
      case 'popularity':
        sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [results, category, sort]);

  const hasQuery = q.trim().length > 0;

  const goToQuery = (value) => {
    const next = value.trim();
    if (!next) return;
    record(next);
    navigate(`/search?q=${encodeURIComponent(next)}`);
  };

  const submit = (event) => {
    event.preventDefault();
    goToQuery(term);
  };

  return (
    <div className="lux-container py-10 md:py-16">
      <Seo title={hasQuery ? t('search.resultsFor', { query: q }) : t('search.title')} />

      <Breadcrumbs items={[{ label: t('search.title') }]} />

      <header className="mt-8 border-b border-line pb-8 dark:border-night-border">
        <p className="eyebrow">{t('search.title')}</p>
        <h1 className="display-title mt-4 text-balance">
          {hasQuery ? t('search.resultsFor', { query: q }) : t('search.title')}
        </h1>
        {hasQuery && (
          <p className="prose-lux mt-4">
            {status === 'loading' ? t('common.loading') : t('shop.resultCount', { count: filtered.length })}
          </p>
        )}

        <form onSubmit={submit} className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
          <Input
            name="q"
            type="search"
            leading={Search}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t('search.placeholder')}
            aria-label={t('search.title')}
          />
          <Button type="submit" className="shrink-0">
            {t('search.title')}
          </Button>
        </form>
      </header>

      {hasQuery ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterSelect label={t('shop.sort')} value={sort} onChange={setSort} options={sortOptions} />
            {status === 'done' && results.length > 0 && (
              <FilterSelect
                label={t('shop.category')}
                value={category}
                onChange={setCategory}
                options={categoryOptions}
              />
            )}

            {category && (
              <button
                type="button"
                onClick={() => setCategory(ALL_CATEGORIES)}
                className="inline-flex items-center gap-2 border border-line px-3 py-1.5 text-xs text-ash transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:text-cream dark:hover:border-cream/60"
              >
                {categoryLabel}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-8">
            {status === 'loading' && <ProductGrid loading columns={4} skeletonCount={8} />}

            {status === 'error' && <ErrorState onRetry={() => setReloadKey((key) => key + 1)} />}

            {status === 'done' &&
              (filtered.length ? (
                <ProductGrid products={filtered} columns={4} />
              ) : (
                <EmptyState
                  icon={SearchX}
                  title={t('search.empty', { query: q })}
                  description={t('search.emptyBody')}
                  action={<Button to="/shop">{t('nav.shop')}</Button>}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 border border-dashed border-line px-6 py-14 text-center dark:border-night-border md:px-14">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-ink dark:border-night-border dark:bg-night-card dark:text-cream">
            <Search className="h-6 w-6" strokeWidth={1.25} aria-hidden="true" />
          </span>
          <p className="mt-5 font-display text-xl text-ink dark:text-cream">{t('search.startTyping')}</p>

          {recent.length > 0 && (
            <div className="mx-auto mt-10 max-w-2xl text-start">
              <div className="flex items-center justify-between gap-4">
                <p className="eyebrow">{t('search.recent')}</p>
                <button
                  type="button"
                  onClick={clear}
                  className="link-underline text-2xs uppercase tracking-wide text-muted hover:text-ink dark:hover:text-cream"
                >
                  {t('search.clearRecent')}
                </button>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {recent.map((item) => (
                  <li key={item} className="group inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => goToQuery(item)}
                      className="inline-flex items-center gap-2 border border-line px-3.5 py-2 text-xs text-ash transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:text-cream dark:hover:border-cream/60"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                      {item}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOne(item)}
                      aria-label={`${t('common.remove')} ${item}`}
                      className="ms-1 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mx-auto mt-12 max-w-3xl text-start">
            <p className="eyebrow">{t('search.popular')}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(CATEGORY_META)
                .slice(0, 8)
                .map(([slug, meta]) => (
                  <Link
                    key={slug}
                    to={`/shop?category=${slug}`}
                    className="border border-line px-4 py-3 text-xs text-ash transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:text-cream dark:hover:border-cream/60"
                  >
                    {lang === 'ar' ? meta.ar : meta.en}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
