import { get } from './apiClient';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from './mockProducts';
import { CATEGORY_ORDER, PRODUCT_COLORS, SIZES, USE_REMOTE_API } from '../utils/constants';
import { slugify } from '../utils/format';

/**
 * Products API service — the ONLY place that knows about the remote provider.
 * Every function degrades gracefully to the curated local catalogue so the UI
 * always has something meaningful to render.
 */

/** Axios (CanceledError) and fetch (AbortError) both signal cancellation. */
const isAbort = (error) => error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError' || error?.name === 'AbortError';

const COLOR_PALETTE = ['Black', 'Ivory', 'Cream', 'Camel', 'Gold', 'Silver', 'Chocolate', 'Navy', 'Forest', 'Stone'];

/** Deterministic small hash so "random" attributes stay stable between renders. */
function hash(value) {
  let h = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const SIZE_MAP = {
  'mens-shirts': SIZES.apparel,
  'womens-dresses': SIZES.apparel,
  tops: SIZES.apparel,
  'mens-shoes': SIZES.shoes,
  'womens-shoes': SIZES.shoes,
  'womens-jewellery': SIZES.jewellery,
  'womens-watches': SIZES.jewellery,
  'mens-watches': SIZES.jewellery,
};

function deriveColors(raw) {
  const count = 2 + (hash(raw.title) % 2);
  const start = hash(raw.sku || raw.title) % COLOR_PALETTE.length;
  return Array.from({ length: count }, (_, i) => {
    const name = COLOR_PALETTE[(start + i * 3) % COLOR_PALETTE.length];
    return { name, value: PRODUCT_COLORS[name.toLowerCase()] ?? PRODUCT_COLORS.black };
  });
}

function normalizeReview(review, index) {
  return {
    id: review.id ?? `rev-${index}`,
    rating: review.rating ?? 5,
    title: review.title ?? 'Verified review',
    comment: review.comment ?? '',
    date: review.date ?? new Date().toISOString(),
    reviewerName: review.reviewerName ?? 'LUXORA client',
    reviewerEmail: review.reviewerEmail ?? '',
    verified: review.verified ?? true,
    helpful: review.helpful ?? 0,
  };
}

/** Map a raw API product into the LUXORA product model. */
export function normalizeProduct(raw) {
  // Already normalised (local catalogue) — return as-is.
  if (Array.isArray(raw.colors) && raw.colors[0] && typeof raw.colors[0] === 'object') {
    return raw;
  }

  const discount = Number(raw.discountPercentage) || 0;
  const rawOriginal = raw.price / (1 - discount / 100);
  const originalPrice = discount > 0 ? (Number.isInteger(raw.price) ? Math.round(rawOriginal) : Math.round(rawOriginal * 100) / 100) : null;

  const createdAt = raw.meta?.createdAt ?? null;
  const isNew = createdAt ? Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 30 : false;

  const images = Array.isArray(raw.images) && raw.images.length ? raw.images : [raw.thumbnail].filter(Boolean);
  const sizes = SIZE_MAP[raw.category] ?? [];

  return {
    id: raw.id,
    title: raw.title,
    // Title alone is not unique (and used to leave a trailing dash), so the id is part of the slug.
    slug: `${slugify(raw.title) || 'product'}-${raw.id}`,
    brand: raw.brand || 'LUXORA Atelier',
    category: raw.category,
    price: Number(raw.price) || 0,
    originalPrice,
    discountPercentage: Math.round(discount),
    rating: Number(raw.rating) || 0,
    reviewCount: Array.isArray(raw.reviews) && raw.reviews.length ? raw.reviews.length * 7 : (hash(raw.title) % 30) + 8,
    stock: Number(raw.stock) || 0,
    sku: raw.sku || `LUX-${raw.id}`,
    material: raw.tags?.length ? `${raw.tags.join(', ')}` : 'Premium materials',
    description: raw.description || '',
    colors: deriveColors(raw),
    sizes,
    tags: raw.tags ?? [],
    images,
    thumbnail: raw.thumbnail || images[0],
    weight: raw.weight ?? null,
    dimensions: raw.dimensions ?? null,
    warrantyInformation: raw.warrantyInformation || '2-year house guarantee on craftsmanship',
    shippingInformation: raw.shippingInformation || 'Dispatched within 24 hours',
    returnPolicy: raw.returnPolicy || 'Complimentary returns within 30 days',
    availabilityStatus: raw.availabilityStatus || (raw.stock > 0 ? 'In Stock' : 'Out of Stock'),
    minimumOrderQuantity: raw.minimumOrderQuantity ?? 1,
    reviews: Array.isArray(raw.reviews) ? raw.reviews.map(normalizeReview) : [],
    // No invented timestamps: fabricating "now" on every load made 'Newest' sorting and the 'New' badge unstable.
    meta: { ...(raw.meta ?? {}), createdAt },
    badge: discount >= 15 ? 'Sale' : isNew ? 'New' : null,
  };
}

/** Returns `{ products, total, source }` — `source` tells the UI whether we are offline. */
export async function fetchAllProducts({ signal } = {}) {
  if (!USE_REMOTE_API) {
    return { products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, source: 'mock' };
  }
  try {
    const data = await get('/products', { signal, params: { limit: 0, select: 'id,title,description,category,price,discountPercentage,rating,stock,tags,brand,sku,weight,dimensions,warrantyInformation,shippingInformation,availabilityStatus,reviews,returnPolicy,minimumOrderQuantity,meta,images,thumbnail' } });
    const products = (data.products ?? []).map(normalizeProduct);
    if (!products.length) throw new Error('Empty catalogue response');
    return { products, total: data.total ?? products.length, source: 'api' };
  } catch (error) {
    if (isAbort(error)) throw error; // a cancelled request is not an outage — don't swap in mock data
    return { products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, source: 'mock', error };
  }
}

/** Server-side paginated fetch (used by "Load more" when the live feed is healthy). */
export async function fetchProducts({ limit = 12, skip = 0, sortBy = 'title', order = 'asc' } = {}) {
  try {
    const data = await get('/products', { params: { limit, skip, sortBy, order } });
    return {
      products: (data.products ?? []).map(normalizeProduct),
      total: data.total ?? 0,
      source: 'api',
    };
  } catch (error) {
    const slice = MOCK_PRODUCTS.slice(skip, skip + limit);
    return { products: slice, total: MOCK_PRODUCTS.length, source: 'mock', error };
  }
}

export async function fetchProductById(id) {
  try {
    const data = await get(`/products/${id}`);
    return { product: normalizeProduct(data), source: 'api' };
  } catch (error) {
    const product = MOCK_PRODUCTS.find((item) => String(item.id) === String(id)) ?? null;
    if (!product) throw error;
    return { product, source: 'mock', error };
  }
}

/** Live search used by the search overlay (debounced). */
export async function searchProducts(query, { limit = 8, signal } = {}) {
  const term = String(query || '').trim();
  if (!term) return { products: [], total: 0, source: 'api' };

  try {
    const data = await get('/products/search', { signal, params: { q: term, limit } });
    return {
      products: (data.products ?? []).map(normalizeProduct),
      total: data.total ?? 0,
      source: 'api',
    };
  } catch (error) {
    if (isAbort(error)) throw error;
    const lowered = term.toLowerCase();
    const products = MOCK_PRODUCTS.filter(
      (item) =>
        item.title.toLowerCase().includes(lowered) ||
        item.brand.toLowerCase().includes(lowered) ||
        item.category.toLowerCase().includes(lowered) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowered)),
    ).slice(0, limit);
    return { products, total: products.length, source: 'mock' };
  }
}

export async function fetchCategories({ signal } = {}) {
  try {
    const list = await get('/products/category-list', { signal });
    const slugs = Array.isArray(list) ? list : [];
    const curated = CATEGORY_ORDER.filter((slug) => slugs.includes(slug) || MOCK_CATEGORIES.includes(slug));
    return { categories: curated.length ? curated : CATEGORY_ORDER, source: 'api' };
  } catch (error) {
    if (isAbort(error)) throw error;
    return { categories: CATEGORY_ORDER, source: 'mock' };
  }
}

export async function fetchProductsByCategory(slug, { limit = 6 } = {}) {
  try {
    const data = await get(`/products/category/${encodeURIComponent(slug)}`, { params: { limit } });
    return {
      products: (data.products ?? []).map(normalizeProduct),
      total: data.total ?? 0,
      source: 'api',
    };
  } catch {
    const products = MOCK_PRODUCTS.filter((item) => item.category === slug).slice(0, limit);
    return { products, total: products.length, source: 'mock' };
  }
}

export async function fetchProductsByIds(ids = []) {
  const unique = [...new Set(ids.map(String))];
  if (!unique.length) return { products: [] };

  // allSettled, not all: one missing product must not throw away the other seven.
  const settled = await Promise.allSettled(unique.map((id) => get(`/products/${id}`)));
  const products = settled.flatMap((result, index) => {
    if (result.status === 'fulfilled') return [normalizeProduct(result.value)];
    const fallback = MOCK_PRODUCTS.find((item) => String(item.id) === unique[index]);
    return fallback ? [fallback] : [];
  });

  return { products, source: settled.every((result) => result.status === 'fulfilled') ? 'api' : 'mixed' };
}
