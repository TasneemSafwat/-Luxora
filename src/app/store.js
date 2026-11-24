import { combineReducers, configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productsSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import authReducer from '../features/auth/authSlice';
import ordersReducer from '../features/orders/ordersSlice';
import uiReducer from '../features/ui/uiSlice';
import { HYDRATE_FROM_STORAGE, attachPersistence, loadPersistedState } from './persistence';

const appReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  auth: authReducer,
  orders: ordersReducer,
  ui: uiReducer,
});

/** Lets the persistence layer swap in slices that changed in another browser tab. */
const rootReducer = (state, action) =>
  action.type === HYDRATE_FROM_STORAGE ? { ...state, ...action.payload } : appReducer(state, action);

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadPersistedState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Redux state stays lean; these guard against accidental non-serialisable
      // values (e.g. Date objects) creeping into the store during development.
      serializableCheck: {
        ignoredActionPaths: ['payload.error', 'meta.arg'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

attachPersistence(store);

export default store;
