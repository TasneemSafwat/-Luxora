import { STORAGE_KEYS } from '../utils/constants';

/**
 * Recently viewed products — a tiny localStorage-backed list.
 * Kept as plain functions (not redux) because it is a write-mostly,
 * per-visitor concern that never drives cross-app state.
 */

const LIMIT = 8;

export function getRecentlyViewed() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.recentlyViewed);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product) {
  if (!product?.id || typeof window === 'undefined') return;
  try {
    const entry = {
      id: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      discountPercentage: product.discountPercentage ?? 0,
      rating: product.rating ?? 0,
      reviewCount: product.reviewCount ?? 0,
      stock: product.stock ?? 0,
      thumbnail: product.thumbnail || product.images?.[0],
    };

    const current = getRecentlyViewed().filter((item) => String(item.id) !== String(product.id));
    const next = [entry, ...current].slice(0, LIMIT);
    window.localStorage.setItem(STORAGE_KEYS.recentlyViewed, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function clearRecentlyViewed() {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.recentlyViewed);
  } catch {
    /* noop */
  }
}
