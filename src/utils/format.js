import { CURRENCIES } from './constants';

/** Tiny classnames joiner — avoids a runtime dependency for a one-liner. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Clamp a number between bounds. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/*
 * `new Intl.*Format()` is surprisingly expensive (it parses locale data), and a
 * product grid calls formatPrice() dozens of times per render. Build each
 * formatter once per locale/options pair and reuse it.
 */
const formatterCache = new Map();

function cachedFormatter(Ctor, locale, options = {}) {
  const key = `${Ctor.name}|${locale}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Ctor(locale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Format a USD base amount into the active display currency + locale.
 * Prices from the API are USD, so we convert with a static demo rate table.
 */
export function formatPrice(amount, { currency = 'USD', locale = 'en-US', baseCurrency = 'USD' } = {}) {
  const from = CURRENCIES[baseCurrency] ?? CURRENCIES.USD;
  const to = CURRENCIES[currency] ?? CURRENCIES.USD;
  const converted = round((Number(amount) || 0) * (to.rate / from.rate));

  try {
    const formatted = cachedFormatter(Intl.NumberFormat, locale, {
      style: 'currency',
      currency: to.code,
      // Whole amounts read cleaner ("$480"), fractional ones keep both decimals ("$480.50").
      minimumFractionDigits: Number.isInteger(converted) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(converted);
    // Arabic locales spell the dollar "US$", which reads cluttered next to Arabic text.
    return locale.startsWith('ar') ? formatted.replace('US$', '$') : formatted;
  } catch {
    return `${to.symbol}${converted.toFixed(2)}`;
  }
}

/** 1234 -> "1,234" */
export function formatNumber(value, locale = 'en-US') {
  try {
    return cachedFormatter(Intl.NumberFormat, locale).format(Number(value) || 0);
  } catch {
    return String(value);
  }
}

/** Discount percentage from price + original price. */
export function discountPercent(price, original) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

/** Deterministic pseudo "original" price used for demo markdowns. */
export function pseudoOriginalPrice(product) {
  if (product?.originalPrice && product.originalPrice > product.price) return product.originalPrice;
  const seed = (product?.id ?? 7) % 5;
  const bump = [1.32, 1.18, 1.42, 1.25, 1.36][seed];
  return Math.round(product.price * bump * 100) / 100;
}

/** Locale-aware date, e.g. "12 Mar 2026". */
export function formatDate(input, locale = 'en-US') {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return cachedFormatter(Intl.DateTimeFormat, locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  } catch {
    return date.toDateString();
  }
}

/** Human-friendly relative time (minutes/hours/days ago). */
export function timeAgo(input, locale = 'en-US') {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const rtf = cachedFormatter(Intl.RelativeTimeFormat, locale, { numeric: 'auto' });
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs) return rtf.format(-Math.round(seconds / secs), unit);
  }
  return rtf.format(-seconds, 'second');
}

/** Slugify a title for URLs / anchors. */
export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Truncate long copy while preserving whole words. */
export function truncate(text = '', length = 120) {
  if (text.length <= length) return text;
  const cut = text.lastIndexOf(' ', length);
  // No space found (one very long word): hard-cut instead of slice(0, -1).
  return `${text.slice(0, cut > 0 ? cut : length).trimEnd()}…`;
}

/** Round to 2 decimals without float noise. */
export function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  // Number.EPSILON nudges values like 1.005 (stored as 1.00499999…) to the right side.
  return Math.round(((Number(value) || 0) + Number.EPSILON) * factor) / factor;
}

/** Initials for avatar fallbacks. */
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
