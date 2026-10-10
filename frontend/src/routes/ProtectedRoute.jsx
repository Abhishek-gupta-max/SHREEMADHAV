import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PATHS } from '../constants/publicRoutes.js';
import { PageLoader } from '../components/common/Spinner.jsx';

/**
 * Gate for the back office. The real protection is server-side (every admin
 * API checks the session); this only decides what to render.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <PageLoader label="Checking your session" />;
  if (status === 'anonymous') {
    return <Navigate to={PATHS.adminLogin} replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
