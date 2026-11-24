import { COUPONS, FREE_SHIPPING_THRESHOLD, TAX_RATE } from './constants';

/** Resolve a promo code into a normalised coupon object (or null). */
export function resolveCoupon(code) {
  if (!code) return null;
  const normalized = String(code).trim().toUpperCase();
  return COUPONS[normalized] ? { ...COUPONS[normalized] } : null;
}

/*
 * All money maths runs on integer cents. Summing floats (19.99 * 3, 0.1 + 0.2…)
 * drifts by a cent in surprising places, and a total that is a cent off is
 * the kind of bug customers screenshot.
 */
const toCents = (value) => Math.round((Number(value) || 0) * 100);
const fromCents = (cents) => cents / 100;

/**
 * Normalise the shipping argument.
 *  - a number            → legacy "flat cost" call (cart page / drawer previews),
 *                          where the global free-shipping threshold applies.
 *  - `{ price, freeOver }` → a real shipping method from SHIPPING_METHODS, so each
 *                          method decides for itself whether it can be free.
 */
function resolveShipping(shipping) {
  if (shipping && typeof shipping === 'object') {
    return { price: Number(shipping.price) || 0, freeOver: shipping.freeOver ?? null };
  }
  return { price: Number(shipping) || 0, freeOver: FREE_SHIPPING_THRESHOLD };
}

/**
 * Single source of truth for all money maths.
 * Pure and side-effect free so it can be memoised in any component.
 */
export function computeCartTotals(items = [], coupon = null, shipping = 0) {
  const method = resolveShipping(shipping);

  const subtotalCents = items.reduce((sum, item) => sum + toCents(item.price) * (Number(item.quantity) || 0), 0);

  let discountCents = 0;
  let couponFreeShipping = false;

  if (coupon) {
    if (coupon.type === 'percent') discountCents = Math.round((subtotalCents * coupon.value) / 100);
    else if (coupon.type === 'fixed') discountCents = Math.min(toCents(coupon.value), subtotalCents);
    else if (coupon.type === 'shipping') couponFreeShipping = true;
  }

  const taxableCents = Math.max(subtotalCents - discountCents, 0);
  const qualifiesFreeShipping = method.freeOver != null && subtotalCents >= toCents(method.freeOver);
  const freeShippingApplied = couponFreeShipping || qualifiesFreeShipping;
  const shippingCents = freeShippingApplied ? 0 : toCents(method.price);
  const taxCents = Math.round(taxableCents * TAX_RATE);
  const totalCents = taxableCents + shippingCents + taxCents;

  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    shipping: fromCents(shippingCents),
    tax: fromCents(taxCents),
    total: fromCents(totalCents),
    freeShippingApplied,
    amountToFreeShipping: fromCents(Math.max(toCents(FREE_SHIPPING_THRESHOLD) - subtotalCents, 0)),
  };
}

/** Estimated delivery date used across cart + checkout. */
export function estimateDelivery(minDays = 3, maxDays = 5) {
  const from = new Date(Date.now() + minDays * 86400000);
  const to = new Date(Date.now() + maxDays * 86400000);
  return { from, to };
}
