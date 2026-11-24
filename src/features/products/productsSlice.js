import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { fetchAllProducts, fetchCategories } from '../../services/productsApi';

/** Loads the full catalogue once and caches it in the store. */
export const loadCatalog = createAsyncThunk(
  'products/loadCatalog',
  async (_arg, { rejectWithValue, signal }) => {
    try {
      const [catalog, categoryResult] = await Promise.all([
        fetchAllProducts({ signal }),
        fetchCategories({ signal }),
      ]);
      return {
        products: catalog.products,
        total: catalog.total,
        source: catalog.source,
        categories: categoryResult.categories,
      };
    } catch (error) {
      return rejectWithValue(error.message ?? 'Unable to load the catalogue');
    }
  },
  {
    // Never start a second request while one is in flight (StrictMode double-effects, retry spam).
    condition: (_arg, { getState }) => getState().products.status !== 'loading',
  },
);

const initialState = {
  items: [],
  categories: [],
  status: 'idle', // idle | loading | succeeded | failed
  source: 'unknown', // api | mock
  error: null,
  loadedAt: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalog.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadCatalog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products;
        state.categories = action.payload.categories;
        state.source = action.payload.source;
        state.loadedAt = Date.now();
      })
      .addCase(loadCatalog.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load the catalogue';
      });
  },
});

export const selectCatalogState = (state) => state.products;
export const selectAllProducts = (state) => state.products.items;
export const selectCatalogStatus = (state) => state.products.status;
export const selectCatalogSource = (state) => state.products.source;
export const selectCategories = (state) => state.products.categories;

/** One Map per catalogue snapshot; every lookup afterwards is O(1). */
const selectProductsById = createSelector(
  [selectAllProducts],
  (items) => new Map(items.map((product) => [String(product.id), product])),
);

export const selectProductById = (id) => (state) => selectProductsById(state).get(String(id)) ?? null;

export const selectProductBySlug = (slug) => (state) =>
  state.products.items.find((product) => product.slug === slug) ?? null;

/** Price bounds + brand list, derived once from the catalogue. */
export const selectCatalogFacets = createSelector([selectAllProducts], (items) => {
  if (!items.length) return { minPrice: 0, maxPrice: 0, brands: [] };
  const prices = items.map((item) => item.price);
  const brands = [...new Set(items.map((item) => item.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  return {
    minPrice: Math.floor(Math.min(...prices)),
    maxPrice: Math.ceil(Math.max(...prices)),
    brands,
  };
});

/** Count per category for the sidebar. */
export const selectCategoryCounts = createSelector([selectAllProducts], (items) =>
  items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {}),
);

export default productsSlice.reducer;
