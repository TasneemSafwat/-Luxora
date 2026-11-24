import { STORAGE_KEYS } from '../utils/constants';
import { resolveCoupon } from '../utils/cart';

/**
 * localStorage persistence adapter for the Redux store.
 *
 * Design notes:
 *  - Only slices that should survive a refresh are persisted.
 *  - Every slice is *validated* on the way back in. localStorage is user-editable
 *    and outlives deploys, so we never trust its shape (a corrupt `cart` used to
 *    be able to take the whole app down on boot, and a half-written `auth.status`
 *    of "loading" could leave the login button disabled forever).
 *  - Change detection is by reference (Redux guarantees immutable updates), not by
 *    JSON.stringify-ing every slice on every action.
 *  - Writes are debounced, but flushed when the tab is hidden/closed so the last
 *    action (e.g. "add to bag") is never lost to the debounce window.
 *  - Other tabs are kept in sync through the `storage` event.
 */

export const HYDRATE_FROM_STORAGE = 'persistence/hydrate';
export const hydrateFromStorage = (payload) => ({ type: HYDRATE_FROM_STORAGE, payload });

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const hasKey = (item) => isObject(item) && typeof item.key === 'string';
const hasId = (item) => isObject(item) && item.id !== undefined && item.id !== null;

/** Each entry knows its storage key and how to turn untrusted JSON into valid slice state. */
const SLICES = {
  cart: {
    key: STORAGE_KEYS.cart,
    hydrate(raw) {
      if (!isObject(raw) || !Array.isArray(raw.items)) return undefined;
      const items = raw.items.filter(
        (item) => hasKey(item) && hasId(item) && Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0,
      );
      // Re-resolve the coupon from the catalogue of known codes: a stored coupon
      // object is never trusted as-is (it could be stale, or hand-edited to "100% off").
      const coupon = isObject(raw.coupon) ? resolveCoupon(raw.coupon.code) : null;
      return { items, coupon };
    },
  },
  wishlist: {
    key: STORAGE_KEYS.wishlist,
    hydrate(raw) {
      if (!isObject(raw) || !Array.isArray(raw.items)) return undefined;
      return { items: raw.items.filter(hasId) };
    },
  },
  auth: {
    key: STORAGE_KEYS.auth,
    hydrate(raw) {
      if (!isObject(raw) || !raw.isAuthenticated || !isObject(raw.user)) return undefined;
      // Transient request state is never restored.
      return { user: raw.user, isAuthenticated: true, status: 'idle', error: null };
    },
  },
  orders: {
    key: STORAGE_KEYS.orders,
    hydrate(raw) {
      if (!isObject(raw) || !Array.isArray(raw.orders) || !Array.isArray(raw.addresses)) return undefined;
      return { orders: raw.orders.filter(hasId), addresses: raw.addresses.filter(hasId) };
    },
  },
};

const PERSISTED_SLICES = Object.keys(SLICES);

/** `rawOverride` lets the storage-event path validate exactly the value it was told about. */
function readSlice(slice, rawOverride) {
  try {
    const raw = rawOverride ?? window.localStorage.getItem(SLICES[slice].key);
    return raw ? SLICES[slice].hydrate(JSON.parse(raw)) : undefined;
  } catch {
    return undefined; // corrupt JSON or storage blocked → fall back to the slice's initial state
  }
}

/** Valid persisted slices only — a bad slice no longer discards the good ones. */
export function loadPersistedState() {
  if (typeof window === 'undefined') return undefined;
  return PERSISTED_SLICES.reduce((acc, slice) => {
    const value = readSlice(slice);
    if (value !== undefined) acc[slice] = value;
    return acc;
  }, {});
}

function writeSlice(slice, value) {
  try {
    window.localStorage.setItem(SLICES[slice].key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage disabled — non-fatal */
  }
}

/** Subscribe once; returns a detach function (handy for tests / HMR). */
export function attachPersistence(store, { delay = 250 } = {}) {
  if (typeof window === 'undefined') return () => {};

  let previous = store.getState();
  let timer = null;
  let applyingRemote = false;
  const dirty = new Set();

  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    const state = store.getState();
    dirty.forEach((slice) => writeSlice(slice, state[slice]));
    dirty.clear();
  };

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    if (state === previous) return;

    if (!applyingRemote) {
      PERSISTED_SLICES.forEach((slice) => {
        if (state[slice] !== previous[slice]) dirty.add(slice);
      });
    }
    previous = state;

    if (dirty.size) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, delay);
    }
  });

  // Don't lose the last change to the debounce window.
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') flush();
  };

  // Another tab changed a persisted slice → adopt it (without echoing it back).
  const onStorage = (event) => {
    const slice = PERSISTED_SLICES.find((name) => SLICES[name].key === event.key);
    if (!slice) return;
    let next = event.newValue ? readSlice(slice, event.newValue) : undefined;
    // "Signed out" in another tab is persisted as an invalid/empty auth record, so
    // hydrate() rejects it — treat that as a logout here instead of ignoring it.
    if (next === undefined && slice === 'auth' && event.newValue) {
      next = { user: null, isAuthenticated: false, status: 'idle', error: null };
    }
    if (next === undefined) return;
    applyingRemote = true;
    try {
      store.dispatch(hydrateFromStorage({ [slice]: next }));
    } finally {
      applyingRemote = false;
    }
  };

  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('storage', onStorage);

  return () => {
    unsubscribe();
    flush();
    window.removeEventListener('pagehide', flush);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('storage', onStorage);
  };
}
