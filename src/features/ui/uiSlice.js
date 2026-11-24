import { createSlice, nanoid } from '@reduxjs/toolkit';

/**
 * Ephemeral UI state (overlays + notifications). Kept out of component state so
 * any part of the app can raise a toast or open the search overlay.
 */
const initialState = {
  toasts: [],
  searchOpen: false,
  mobileNavOpen: false,
  mobileFiltersOpen: false,
  cartDrawerOpen: false,
  quickViewProduct: null,
  authPrompt: null, // 'login' | 'register' | null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
        if (state.toasts.length > 4) state.toasts.shift();
      },
      prepare({ type = 'info', title, message = '', duration = 3800 }) {
        return { payload: { id: nanoid(), type, title, message, duration } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    setSearchOpen(state, action) {
      state.searchOpen = action.payload;
      if (action.payload) {
        state.mobileNavOpen = false;
        state.mobileFiltersOpen = false;
      }
    },
    setMobileNavOpen(state, action) {
      state.mobileNavOpen = action.payload;
      if (action.payload) state.searchOpen = false;
    },
    setMobileFiltersOpen(state, action) {
      state.mobileFiltersOpen = action.payload;
    },
    setCartDrawerOpen(state, action) {
      state.cartDrawerOpen = action.payload;
      if (action.payload) state.mobileNavOpen = false;
    },
    setQuickViewProduct(state, action) {
      state.quickViewProduct = action.payload;
    },
    setAuthPrompt(state, action) {
      state.authPrompt = action.payload;
    },
  },
});

export const {
  pushToast,
  dismissToast,
  setSearchOpen,
  setMobileNavOpen,
  setMobileFiltersOpen,
  setCartDrawerOpen,
  setQuickViewProduct,
  setAuthPrompt,
} = uiSlice.actions;

export const selectToasts = (state) => state.ui.toasts;
export const selectSearchOpen = (state) => state.ui.searchOpen;
export const selectMobileNavOpen = (state) => state.ui.mobileNavOpen;
export const selectMobileFiltersOpen = (state) => state.ui.mobileFiltersOpen;
export const selectCartDrawerOpen = (state) => state.ui.cartDrawerOpen;
export const selectQuickViewProduct = (state) => state.ui.quickViewProduct;
export const selectAuthPrompt = (state) => state.ui.authPrompt;

export default uiSlice.reducer;
