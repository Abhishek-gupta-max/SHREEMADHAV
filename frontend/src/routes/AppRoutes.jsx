import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { PATHS } from '../constants/publicRoutes.js';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { PageLoader } from '../components/common/Spinner.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Every page is its own chunk; the admin area is never downloaded by
// ordinary visitors.
const HomePage = lazy(() => import('../pages/Home/HomePage.jsx'));
const AboutPage = lazy(() => import('../pages/About/AboutPage.jsx'));
const ServicesPage = lazy(() => import('../pages/Services/ServicesPage.jsx'));
const ProcessPage = lazy(() => import('../pages/Process/ProcessPage.jsx'));
const WhyUsPage = lazy(() => import('../pages/WhyUs/WhyUsPage.jsx'));
const RequirementsPage = lazy(() => import('../pages/Requirements/RequirementsPage.jsx'));
const JobDetailPage = lazy(() => import('../pages/Requirements/JobDetailPage.jsx'));
const ApplyPage = lazy(() => import('../pages/Apply/ApplyPage.jsx'));
const ContactPage = lazy(() => import('../pages/Contact/ContactPage.jsx'));
const PrivacyPage = lazy(() => import('../pages/Legal/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('../pages/Legal/TermsPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage.jsx'));

const AdminRoot = lazy(() => import('../pages/Admin/AdminRoot.jsx'));
const AdminLoginPage = lazy(() => import('../pages/Admin/Login/AdminLoginPage.jsx'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout.jsx'));
const DashboardPage = lazy(() => import('../pages/Admin/Dashboard/DashboardPage.jsx'));
const ApplicationsPage = lazy(() => import('../pages/Admin/Applications/ApplicationsPage.jsx'));
const ApplicationDetailPage = lazy(() => import('../pages/Admin/Applications/ApplicationDetailPage.jsx'));
const DocumentsPage = lazy(() => import('../pages/Admin/Documents/DocumentsPage.jsx'));
const EnquiriesPage = lazy(() => import('../pages/Admin/Enquiries/EnquiriesPage.jsx'));
const AdminServicesPage = lazy(() => import('../pages/Admin/Content/AdminServicesPage.jsx'));
const ServiceEditorPage = lazy(() => import('../pages/Admin/Content/ServiceEditorPage.jsx'));
const AdminJobsPage = lazy(() => import('../pages/Admin/Content/AdminJobsPage.jsx'));
const JobEditorPage = lazy(() => import('../pages/Admin/Content/JobEditorPage.jsx'));
const SettingsPage = lazy(() => import('../pages/Admin/Settings/SettingsPage.jsx'));
const ProfilePage = lazy(() => import('../pages/Admin/Profile/ProfilePage.jsx'));

/** Old /careers/:slug links now live under /requirements/:slug. */
function LegacyJobRedirect() {
  const { slug } = useParams();
  return <Navigate to={`${PATHS.requirements}/${slug}`} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path={PATHS.about} element={<AboutPage />} />
        <Route path={PATHS.services} element={<ServicesPage />} />
        <Route path={PATHS.process} element={<ProcessPage />} />
        <Route path={PATHS.whyUs} element={<WhyUsPage />} />
        <Route path={PATHS.requirements} element={<RequirementsPage />} />
        <Route path={`${PATHS.requirements}/:slug`} element={<JobDetailPage />} />

        {/* Earlier URLs (pages merged into Services and Requirements) */}
        <Route path={PATHS.legacyEducation} element={<Navigate to={`${PATHS.services}#education`} replace />} />
        <Route path={PATHS.legacyOpportunities} element={<Navigate to={`${PATHS.services}#opportunities`} replace />} />
        <Route path={PATHS.legacyCareers} element={<Navigate to={`${PATHS.requirements}#openings`} replace />} />
        <Route path={`${PATHS.legacyCareers}/:slug`} element={<LegacyJobRedirect />} />
        <Route path={PATHS.apply} element={<ApplyPage />} />
        <Route path={PATHS.contact} element={<ContactPage />} />
        <Route path={PATHS.privacy} element={<PrivacyPage />} />
        <Route path={PATHS.terms} element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path={`${PATHS.admin}/*`}
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminRoot />
          </Suspense>
        }
      >
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="enquiries" element={<EnquiriesPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="services/new" element={<ServiceEditorPage />} />
            <Route path="services/:id" element={<ServiceEditorPage />} />
            <Route path="openings" element={<AdminJobsPage />} />
            <Route path="openings/new" element={<JobEditorPage />} />
            <Route path="openings/:id" element={<JobEditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to={PATHS.admin} replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
