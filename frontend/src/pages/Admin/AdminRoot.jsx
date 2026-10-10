import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { Seo } from '../../components/common/Seo.jsx';
import '../../styles/admin.css';

/**
 * Entry point for /admin. Auth state and admin styles load only here, so the
 * public website never calls the session endpoint or ships admin CSS.
 */
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Seo title="Admin" description="ShreeMadhav Overseas Solutions back office" noindex />
      <Outlet />
    </AuthProvider>
  );
}
