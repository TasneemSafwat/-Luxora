import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

/**
 * Demo route guard.
 * Unauthenticated visitors are redirected to /login, carrying the intended
 * destination so they land there after signing in.
 */
export function ProtectedRoute({ children, redirectTo = '/login' }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
}

export default ProtectedRoute;
