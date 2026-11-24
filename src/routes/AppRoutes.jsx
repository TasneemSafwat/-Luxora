import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { ProductGridSkeleton, Skeleton } from '../components/ui';

/**
 * Every route is code-split. Vite emits a separate chunk per page so the
 * initial payload stays small even as the application grows.
 */
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Account = lazy(() => import('../pages/Account'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const NotFound = lazy(() => import('../pages/NotFound'));

/** Skeleton shown while a route chunk is fetched. */
function RouteFallback() {
  return (
    <div className="lux-container py-16 md:py-24">
      <Skeleton className="h-3 w-28" rounded="rounded-sm" />
      <Skeleton className="mt-5 h-10 w-2/3 max-w-lg" rounded="rounded-sm" />
      <div className="mt-14">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

export function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderConfirmation />} />

            {/* Authentication (demo) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            {/* Legacy aliases + 404 */}
            <Route path="/products" element={<Navigate to="/shop" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;
