import { createSelector, createSlice } from '@reduxjs/toolkit';
import { resolveCoupon } from '../../utils/cart';
import { loadCatalog } from '../products/productsSlice';

/** Highest quantity a line may hold. Unknown / zero stock falls back to a sane ceiling. */
const MAX_PER_LINE = 99;
const stockCap = (stock) => (Number.isFinite(stock) && stock > 0 ? Math.min(stock, MAX_PER_LINE) : MAX_PER_LINE);

/** A line item is unique per product + colour + size combination. */
const lineKey = ({ id, color, size }) => `${id}::${color ?? 'default'}::${size ?? 'default'}`;

const initialState = {
  items: [],
  coupon: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: {
      reducer(state, action) {
        const incoming = action.payload;
        const existing = state.items.find((item) => item.key === incoming.key);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + incoming.quantity, stockCap(incoming.stock));
        } else {
          state.items.unshift(incoming);
        }
      },
      prepare({ product, quantity = 1, color = null, size = null }) {
        return {
          payload: {
            key: lineKey({ id: product.id, color, size }),
            id: product.id,
            slug: product.slug,
            title: product.title,
            brand: product.brand,
            category: product.category,
            price: product.price,
            originalPrice: product.originalPrice,
            thumbnail: product.thumbnail || product.images?.[0],
            color,
            size,
            stock: product.stock ?? 99,
            quantity,
          },
        };
      },
    },
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.key !== action.payload);
    },
    setQuantity(state, action) {
      const { key, quantity } = action.payload;
      const item = state.items.find((line) => line.key === key);
      if (!item) return;
      const next = Math.max(1, Math.min(Math.floor(Number(quantity)) || 1, stockCap(item.stock)));
      item.quantity = next;
    },
    incrementItem(state, action) {
      const item = state.items.find((line) => line.key === action.payload);
      if (item) item.quantity = Math.min(item.quantity + 1, stockCap(item.stock));
    },
    decrementItem(state, action) {
      const item = state.items.find((line) => line.key === action.payload);
      if (item) item.quantity = Math.max(item.quantity - 1, 1);
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
    },
    applyCouponCode(state, action) {
      state.coupon = resolveCoupon(action.payload);
    },
    removeCoupon(state) {
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    /**
     * A bag persisted yesterday holds yesterday's prices and stock. When fresh
     * catalogue data arrives, reconcile every line with it so the shopper never
     * checks out at a stale price or buys more than is actually available.
     *
     * Guards: only live API data is trusted (the offline fallback catalogue uses
     * different ids), and a line is only touched when the title still matches
     * the product with that id.
     */
    builder.addCase(loadCatalog.fulfilled, (state, action) => {
      if (action.payload.source !== 'api') return;
      const byId = new Map(action.payload.products.map((product) => [String(product.id), product]));

      state.items.forEach((line) => {
        const fresh = byId.get(String(line.id));
        if (!fresh || fresh.title !== line.title) return;
        line.price = fresh.price;
        line.originalPrice = fresh.originalPrice;
        line.stock = fresh.stock ?? line.stock;
        line.thumbnail = fresh.thumbnail || line.thumbnail;
        if (line.stock > 0) line.quantity = Math.min(line.quantity, stockCap(line.stock));
      });
    });
  },
});

export const {
  addItem,
  removeItem,
  setQuantity,
  incrementItem,
  decrementItem,
  clearCart,
  applyCouponCode,
  removeCoupon,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCoupon = (state) => state.cart.coupon;
export const selectCartCount = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0),
);
// Summed in cents so 3 × 19.99 is exactly 59.97, never 59.970000000000006.
export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100,
);
export const selectCartLine = (key) => (state) => state.cart.items.find((item) => item.key === key) ?? null;

export default cartSlice.reducer;
