import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/*
 * Shop filters live in the URL (?brand=…&rating=4&stock=1&sale=1&min=100&max=900),
 * not in component state. That makes a filtered view shareable and bookmarkable,
 * survives a refresh, and makes the browser Back button behave the way shoppers expect.
 * Params that equal their default are removed so URLs stay short.
 */

const toNumber = (value) => {
  if (value === null || value === '') return null; // Number(null) is 0 — a missing param is not a zero
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function readPrice(params, facets) {
  const min = toNumber(params.get('min'));
  const max = toNumber(params.get('max'));
  return { min: min ?? facets.minPrice, max: max ?? facets.maxPrice };
}

function writePrice(params, price, facets) {
  const cents = (value) => Math.max(0, Math.round((Number(value) || 0) * 100) / 100);
  const min = cents(price.min);
  const max = cents(price.max);
  if (min <= facets.minPrice) params.delete('min');
  else params.set('min', String(min));
  if (max >= facets.maxPrice) params.delete('max');
  else params.set('max', String(max));
}

export function useShopFilters(facets) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Functional form: always applies on top of the *latest* params, so two quick
  // changes (e.g. a checkbox and the price slider) never overwrite each other.
  const update = useCallback(
    (mutate) =>
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          mutate(next);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const brandKey = searchParams.getAll('brand').join('\u0000');
  const brands = useMemo(() => (brandKey ? brandKey.split('\u0000') : []), [brandKey]);

  const minRating = Math.min(5, Math.max(0, toNumber(searchParams.get('rating')) ?? 0));
  const inStockOnly = searchParams.get('stock') === '1';
  const onSaleOnly = searchParams.get('sale') === '1';

  const minParam = searchParams.get('min');
  const maxParam = searchParams.get('max');
  const price = useMemo(
    () => ({ min: toNumber(minParam) ?? facets.minPrice, max: toNumber(maxParam) ?? facets.maxPrice }),
    [minParam, maxParam, facets],
  );

  const toggleBrand = useCallback(
    (brand) =>
      update((params) => {
        const current = params.getAll('brand');
        params.delete('brand');
        (current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]).forEach((item) =>
          params.append('brand', item),
        );
      }),
    [update],
  );

  const setMinRating = useCallback(
    (value) =>
      update((params) => {
        if (value) params.set('rating', String(value));
        else params.delete('rating');
      }),
    [update],
  );

  const setFlag = useCallback(
    (key) => (value) =>
      update((params) => {
        if (value) params.set(key, '1');
        else params.delete(key);
      }),
    [update],
  );

  const setPrice = useCallback(
    (valueOrUpdater) =>
      update((params) => {
        const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(readPrice(params, facets)) : valueOrUpdater;
        writePrice(params, next, facets);
      }),
    [update, facets],
  );

  /** Remove every filter this hook owns (category / sort / query are managed by the page). */
  const reset = useCallback(
    () =>
      update((params) => {
        ['brand', 'rating', 'stock', 'sale', 'min', 'max'].forEach((key) => params.delete(key));
      }),
    [update],
  );

  return {
    brands,
    minRating,
    inStockOnly,
    onSaleOnly,
    price,
    toggleBrand,
    setMinRating,
    setInStockOnly: useMemo(() => setFlag('stock'), [setFlag]),
    setOnSaleOnly: useMemo(() => setFlag('sale'), [setFlag]),
    setPrice,
    reset,
  };
}
