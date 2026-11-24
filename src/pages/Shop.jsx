import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, PackageX, SlidersHorizontal, Star, X } from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import {
  selectAllProducts,
  selectCatalogFacets,
  selectCatalogStatus,
  selectCategoryCounts,
} from '../features/products/productsSlice';
import { Breadcrumbs, Button, Drawer, EmptyState, FilterSelect, ProductGridSkeleton } from '../components/ui';
import { ProductGrid } from '../components/product/ProductGrid';
import { Seo } from '../components/common/Seo';
import { useI18n } from '../hooks/useI18n';
import { useShopFilters } from '../hooks/useShopFilters';
import { searchableText } from '../i18n/productI18n';
import { CATEGORY_META, CURRENCIES, SORT_OPTIONS } from '../utils/constants';
import { cn } from '../utils/format';

const PAGE_SIZE = 12;
const ALL = '';
const EASE = [0.22, 1, 0.36, 1];

/** Resolve the active sort label for the current language. */
const sortLabel = (option, lang) => (lang === 'ar' ? option.labelAr : option.label);

/** Narrow the catalogue to the pieces marked as newly arrived. */
function isNewArrival(product) {
  if (product.badge === 'New') return true;
  const created = product.meta?.createdAt ? new Date(product.meta.createdAt).getTime() : 0;
  return created ? Date.now() - created < 1000 * 60 * 60 * 24 * 30 : false;
}

export function Shop() {
  const { t, lang, formatPrice } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const products = useAppSelector(selectAllProducts);
  const status = useAppSelector(selectCatalogStatus);
  const facets = useAppSelector(selectCatalogFacets);
  const categoryCounts = useAppSelector(selectCategoryCounts);

  const isAr = lang === 'ar';
  const loading = (status === 'loading' || status === 'idle') && products.length === 0;

  // ————— URL-backed state —————
  const category = searchParams.get('category') ?? ALL;
  const collection = searchParams.get('collection') ?? ALL;
  const sort = searchParams.get('sort') ?? SORT_OPTIONS[0].id;
  const query = searchParams.get('q') ?? '';

  // Brand / rating / stock / sale / price also live in the URL (see useShopFilters),
  // so every filtered view can be shared, bookmarked and navigated with Back/Forward.
  const {
    brands,
    minRating,
    inStockOnly,
    onSaleOnly,
    price,
    toggleBrand,
    setMinRating,
    setInStockOnly,
    setOnSaleOnly,
    setPrice,
    reset: resetFilters,
  } = useShopFilters(facets);

  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const categoryLabel = useMemo(() => {
    if (!category) return isAr ? 'الكل' : 'All';
    const meta = CATEGORY_META[category];
    return meta ? (isAr ? meta.ar : meta.en) : category;
  }, [category, isAr]);

  const categoryOptions = useMemo(
    () =>
      Object.keys(categoryCounts).length
        ? Object.keys(categoryCounts).map((slug) => {
            const meta = CATEGORY_META[slug];
            return { value: slug, label: meta ? (isAr ? meta.ar : meta.en) : slug, count: categoryCounts[slug] };
          })
        : [],
    [categoryCounts, isAr],
  );

  const sortOptions = useMemo(
    () => SORT_OPTIONS.map((option) => ({ value: option.id, label: sortLabel(option, lang) })),
    [lang],
  );

  // The price slider updates on every pixel; filtering ~200 products from a deferred
  // copy keeps the thumb perfectly responsive while the grid catches up.
  const deferredPrice = useDeferredValue(price);

  // ————— Filtering + sorting —————
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    const list = products.filter((product) => {
      if (category && product.category !== category) return false;
      if (collection === 'new' && !isNewArrival(product)) return false;
      if (brands.length && !brands.includes(product.brand)) return false;
      if (minRating && (product.rating ?? 0) < minRating) return false;
      if (inStockOnly && product.stock <= 0) return false;
      if (onSaleOnly && !(product.discountPercentage > 0)) return false;
      if (deferredPrice.min > facets.minPrice && product.price < deferredPrice.min) return false;
      if (deferredPrice.max < facets.maxPrice && product.price > deferredPrice.max) return false;
      if (term) {
        // Matches English and Arabic names, so Arabic shoppers can search in Arabic.
        if (!searchableText(product).includes(term)) return false;
      }
      return true;
    });

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
  }, [products, category, collection, brands, minRating, inStockOnly, onSaleOnly, deferredPrice, query, sort, facets]);

  // Any filter change restarts pagination.
  const filterSignature = `${category}|${collection}|${brands.join(',')}|${minRating}|${inStockOnly}|${onSaleOnly}|${price.min}|${price.max}|${query}|${sort}`;
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filterSignature]);

  const activeFilterCount =
    (category ? 1 : 0) +
    (brands.length ? 1 : 0) +
    (minRating ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (price.min > facets.minPrice || price.max < facets.maxPrice ? 1 : 0);

  const clearAll = () => {
    resetFilters();
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const shown = filtered.slice(0, visible);

  const filters = {
    category,
    setCategory: (value) => setParam('category', value),
    categoryOptions,
    brands,
    toggleBrand,
    facets,
    price,
    setPrice,
    minRating,
    setMinRating,
    inStockOnly,
    setInStockOnly,
    onSaleOnly,
    setOnSaleOnly,
    clearAll,
    activeFilterCount,
  };

  return (
    <>
      <Seo
        title={t('shop.title')}
        description={t('shop.subtitle')}
        noIndex={Boolean(query)}
      />

      {/* ————— Editorial header ————— */}
      <header className="border-b border-line bg-cream-soft dark:border-night-border dark:bg-night-soft">
        <div className="lux-container py-12 md:py-16">
          <Breadcrumbs items={[{ label: t('shop.title') }]} />

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">
                <span className="before:me-3 before:inline-block before:h-px before:w-6 before:bg-gold before:align-middle">
                  {t('nav.shop')}
                </span>
              </p>
              <h1 className="display-title mt-4 text-balance">
                {category !== ALL ? categoryLabel : t('shop.title')}
              </h1>
              <p className="prose-lux mt-4 max-w-xl">{t('shop.subtitle')}</p>
            </div>

            <p className="text-sm tabular-nums text-muted">
              {loading ? t('common.loading') : t('shop.resultCount', { count: filtered.length })}
            </p>
          </div>
        </div>
      </header>

      <div className="lux-container py-10 md:py-14">
        <div className="flex gap-10 lg:gap-14">
          {/* ————— Desktop sidebar ————— */}
          <aside className="hidden w-64 shrink-0 self-start lg:block" aria-label={t('shop.filters')}>
            {/* Capped to the viewport and scrolled internally, so a long filter list can't stretch a
                short category page and leave a tall empty block under its few products. */}
            <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pe-2">
              <FiltersContent {...filters} />
            </div>
          </aside>

          {/* ————— Results ————— */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 dark:border-night-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="subtle"
                  size="sm"
                  icon={SlidersHorizontal}
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  {t('shop.filters')}
                  {activeFilterCount > 0 && (
                    <span className="ms-1 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] text-white dark:bg-cream dark:text-ink">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                <span className="hidden text-xs text-muted sm:inline">
                  {t('shop.showing')} {shown.length} {t('common.of')} {filtered.length}
                </span>
              </div>

              <FilterSelect label={t('shop.sort')} value={sort} onChange={(value) => setParam('sort', value)} options={sortOptions} />
            </div>

            {/* Active chips */}
            {activeFilterCount > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {category && (
                  <FilterChip label={categoryLabel} onRemove={() => setParam('category', '')} />
                )}
                {brands.map((brand) => (
                  <FilterChip key={brand} label={brand} onRemove={() => toggleBrand(brand)} />
                ))}
                {minRating > 0 && (
                  <FilterChip
                    label={`${minRating}.0 ★ ${isAr ? 'وأعلى' : '& up'}`}
                    onRemove={() => setMinRating(0)}
                  />
                )}
                {inStockOnly && <FilterChip label={t('shop.inStockOnly')} onRemove={() => setInStockOnly(false)} />}
                {onSaleOnly && <FilterChip label={t('shop.onSale')} onRemove={() => setOnSaleOnly(false)} />}
                {(price.min > facets.minPrice || price.max < facets.maxPrice) && (
                  <FilterChip
                    label={`${formatPrice(price.min)} – ${formatPrice(price.max)}`}
                    onRemove={() => setPrice({ min: facets.minPrice, max: facets.maxPrice })}
                  />
                )}

                <button
                  type="button"
                  onClick={clearAll}
                  className="link-underline ms-1 text-2xs uppercase tracking-wide text-muted hover:text-ink dark:hover:text-cream"
                >
                  {t('shop.clearAll')}
                </button>
              </div>
            )}

            {/* Grid */}
            <div className="mt-10">
              {loading ? (
                <ProductGridSkeleton count={9} />
              ) : filtered.length ? (
                <>
                  <ProductGrid products={shown} columns={3} />

                  {visible < filtered.length && (
                    <div className="mt-14 flex flex-col items-center gap-4">
                      <p className="text-xs tabular-nums text-muted">
                        {t('shop.showing')} {shown.length} {t('common.of')} {filtered.length}
                      </p>
                      <Button variant="outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                        {t('shop.loadMore')}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={PackageX}
                  title={t('shop.noResults')}
                  description={t('shop.noResultsBody')}
                  action={
                    <Button variant="outline" onClick={clearAll}>
                      {t('shop.clearAll')}
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ————— Mobile filters ————— */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t('shop.filters')}
        side="start"
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="link-underline text-2xs uppercase tracking-wide text-muted hover:text-ink dark:hover:text-cream"
            >
              {t('shop.clearAll')}
            </button>
            <Button size="sm" onClick={() => setFiltersOpen(false)}>
              {t('shop.showing')} {filtered.length}
            </Button>
          </div>
        }
      >
        <FiltersContent {...filters} />
      </Drawer>
    </>
  );
}

/** Removable chip summarising one active filter. */
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-line py-1.5 pe-2 ps-3 text-xs text-ash dark:border-night-border dark:text-cream">
      {label}
      <button type="button" onClick={onRemove} className="text-muted transition-colors hover:text-danger" aria-label={`${label} ×`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/** One collapsible-looking filter group. */
function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-line py-6 first:pt-0 dark:border-night-border">
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </div>
  );
}

/** The full filter set — rendered in the sidebar and inside the mobile drawer. */
function FiltersContent({
  category,
  setCategory,
  categoryOptions,
  brands,
  toggleBrand,
  facets,
  price,
  setPrice,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  onSaleOnly,
  setOnSaleOnly,
  clearAll,
  activeFilterCount,
}) {
  const { t, lang, currency, formatPrice } = useI18n();
  const isAr = lang === 'ar';

  // Catalogue prices are stored in USD, but the shopper sees (and thinks in) their chosen
  // currency. The filter used to show raw USD numbers next to e.g. E£ prices — so a
  // "≤ 545" chip meant something entirely different from the cards beside it.
  const currencyInfo = CURRENCIES[currency] ?? CURRENCIES.USD;
  const toDisplay = (usd) => Math.round(usd * currencyInfo.rate);
  const fromDisplay = (shown) => Math.max(0, Number(shown) || 0) / currencyInfo.rate;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4 dark:border-night-border">
        <p className="text-sm font-medium uppercase tracking-wide text-ink dark:text-cream">{t('shop.filters')}</p>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="link-underline text-2xs uppercase tracking-wide text-muted hover:text-ink dark:hover:text-cream"
          >
            {t('shop.clearAll')}
          </button>
        )}
      </div>

      {/* Category */}
      <FilterGroup title={t('shop.category')}>
        <ul className="max-h-72 space-y-1 overflow-y-auto pe-1 no-scrollbar">
          <li>
            <button
              type="button"
              onClick={() => setCategory(ALL)}
              className={cn(
                'flex w-full items-center justify-between gap-3 py-1.5 text-start text-sm transition-colors',
                category === ALL ? 'text-ink dark:text-cream' : 'text-muted hover:text-ash dark:hover:text-cream',
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn('h-1.5 w-1.5 rounded-full', category === ALL ? 'bg-gold' : 'bg-transparent')} />
                {isAr ? 'الكل' : 'All pieces'}
              </span>
            </button>
          </li>
          {categoryOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => setCategory(option.value)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 py-1.5 text-start text-sm transition-colors',
                  category === option.value ? 'text-ink dark:text-cream' : 'text-muted hover:text-ash dark:hover:text-cream',
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full', category === option.value ? 'bg-gold' : 'bg-transparent')} />
                  {option.label}
                </span>
                <span className="text-2xs tabular-nums text-muted">{option.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      {/* Price */}
      <FilterGroup title={t('shop.price')}>
        <div className="flex items-center gap-3">
          <label className="flex-1">
            <span className="sr-only">{t('shop.minPrice')}</span>
            <input
              type="number"
              min={toDisplay(facets.minPrice)}
              max={toDisplay(facets.maxPrice)}
              value={toDisplay(price.min)}
              onChange={(event) => setPrice((current) => ({ ...current, min: fromDisplay(event.target.value) }))}
              placeholder={t('shop.minPrice')}
              className="field h-10 tabular-nums"
            />
          </label>
          <span className="text-muted" aria-hidden="true">
            —
          </span>
          <label className="flex-1">
            <span className="sr-only">{t('shop.maxPrice')}</span>
            <input
              type="number"
              min={toDisplay(facets.minPrice)}
              max={toDisplay(facets.maxPrice)}
              value={toDisplay(price.max)}
              onChange={(event) => setPrice((current) => ({ ...current, max: fromDisplay(event.target.value) }))}
              placeholder={t('shop.maxPrice')}
              className="field h-10 tabular-nums"
            />
          </label>
        </div>

        <p className="mt-2 text-2xs uppercase tracking-wide text-muted">{currencyInfo.code}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {[0.25, 0.5, 0.75].map((ratio) => {
            const ceiling = Math.round(facets.minPrice + (facets.maxPrice - facets.minPrice) * ratio);
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => setPrice({ min: facets.minPrice, max: ceiling })}
                className="border border-line px-2.5 py-1 text-2xs tabular-nums text-muted transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:hover:border-cream/50 dark:hover:text-cream"
              >
                ≤ {formatPrice(ceiling)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPrice({ min: facets.minPrice, max: facets.maxPrice })}
            className="border border-line px-2.5 py-1 text-2xs text-muted transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:hover:border-cream/50 dark:hover:text-cream"
          >
            {isAr ? 'الكل' : 'All'}
          </button>
        </div>
      </FilterGroup>

      {/* Rating */}
      <FilterGroup title={t('shop.rating')}>
        <ul className="space-y-1">
          {[4, 3, 2, 1].map((value) => {
            const selected = minRating === value;
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => setMinRating(selected ? 0 : value)}
                  className={cn(
                    'flex w-full items-center gap-2.5 py-1.5 text-start text-sm transition-colors',
                    selected ? 'text-ink dark:text-cream' : 'text-muted hover:text-ash dark:hover:text-cream',
                  )}
                >
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn('h-3.5 w-3.5', star <= value ? 'fill-gold text-gold' : 'text-gold/25')}
                        strokeWidth={1.25}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span>{value}.0 {isAr ? 'وأعلى' : '& up'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      {/* Brand */}
      {facets.brands.length > 0 && (
        <FilterGroup title={t('shop.brand')}>
          <ul className="max-h-64 space-y-2.5 overflow-y-auto pe-1 no-scrollbar">
            {facets.brands.map((brand) => {
              const checked = brands.includes(brand);
              return (
                <li key={brand}>
                  <label className="group flex cursor-pointer items-center gap-3 text-sm text-ash dark:text-cream">
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center border transition-colors',
                        checked ? 'border-ink bg-ink text-white dark:border-cream dark:bg-cream dark:text-ink' : 'border-line dark:border-night-border',
                      )}
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleBrand(brand)} />
                    <span className="transition-colors group-hover:text-ink dark:group-hover:text-cream">{brand}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}

      {/* Availability */}
      <FilterGroup title={t('shop.availability')}>
        <div className="space-y-3.5">
          <AvailabilityToggle label={t('shop.inStockOnly')} checked={inStockOnly} onChange={setInStockOnly} />
          <AvailabilityToggle label={t('shop.onSale')} checked={onSaleOnly} onChange={setOnSaleOnly} />
        </div>
      </FilterGroup>
    </div>
  );
}

/** Single accessibility-friendly toggle used inside the availability group. */
function AvailabilityToggle({ label, checked, onChange }) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-3 text-sm text-ash dark:text-cream">
      <span className="transition-colors group-hover:text-ink dark:group-hover:text-cream">{label}</span>
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300',
          checked ? 'bg-ink dark:bg-cream' : 'bg-line dark:bg-night-border',
        )}
      >
        <input type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <motion.span
          layout
          transition={{ duration: 0.25, ease: EASE }}
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm dark:bg-night',
            checked ? 'ms-4.5' : 'ms-0.5',
          )}
        />
      </span>
    </label>
  );
}

export default Shop;
