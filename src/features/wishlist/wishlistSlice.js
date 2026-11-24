import { createSelector, createSlice } from '@reduxjs/toolkit';

/**
 * Wishlist stores a lightweight snapshot of each product so the favourite
 * grid renders instantly, even before the catalogue finishes loading.
 */
const snapshot = (product) => ({
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
  addedAt: new Date().toISOString(),
});

const initialState = { items: [] };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload;
      const index = state.items.findIndex((item) => String(item.id) === String(product.id));
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.unshift(snapshot(product));
      }
    },
    removeFromWishlist(state, action) {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = createSelector([selectWishlistItems], (items) => items.length);
/** Memoised id set → membership checks are O(1) instead of a scan per product card. */
export const selectWishlistIdSet = createSelector(
  [selectWishlistItems],
  (items) => new Set(items.map((item) => String(item.id))),
);
export const selectIsWishlisted = (id) => (state) => selectWishlistIdSet(state).has(String(id));

export default wishlistSlice.reducer;
