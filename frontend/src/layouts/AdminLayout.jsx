import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PATHS } from '../constants/publicRoutes.js';
import { ROLE_LABELS } from '../constants/admin.js';
import { initials } from '../utils/format.js';
import { Logo } from '../components/common/Logo.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { PageLoader } from '../components/common/Spinner.jsx';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';
import { BreadcrumbProvider, Breadcrumbs } from '../components/admin/Breadcrumbs.jsx';

const NAV = [
  {
    label: 'Overview',
    items: [{ to: '', label: 'Dashboard', icon: 'dashboard', end: true }],
  },
  {
    label: 'Candidates',
    items: [
      { to: 'applications', label: 'Applications', icon: 'users' },
      { to: 'documents', label: 'Documents', icon: 'file' },
      { to: 'enquiries', label: 'Enquiries', icon: 'inbox' },
    ],
  },
  {
    label: 'Website',
    items: [
      { to: 'services', label: 'Services', icon: 'layers' },
      { to: 'openings', label: 'Openings', icon: 'briefcase' },
      { to: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

function UserMenu() {
  const { admin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => !ref.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const signOut = async () => {
    await logout();
    toast.info('You have been signed out.');
    navigate(PATHS.adminLogin, { replace: true });
  };

  return (
    <div className="admin-topbar__user" ref={ref}>
      <button type="button" className="admin-user-button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="avatar" aria-hidden="true">
          {initials(admin?.name)}
        </span>
        <span className="admin-user-button__text">
          <span className="admin-user-button__name">{admin?.name}</span>
          <span className="admin-user-button__role">{ROLE_LABELS[admin?.role]}</span>
        </span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <Link role="menuitem" to="profile" onClick={() => setOpen(false)}>
            <Icon name="user" size={16} /> Profile
          </Link>
          <Link role="menuitem" to="settings" onClick={() => setOpen(false)}>
            <Icon name="settings" size={16} /> Settings
          </Link>
          <hr />
          <button role="menuitem" type="button" onClick={signOut}>
            <Icon name="logout" size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <BreadcrumbProvider>
      <div className={`admin ${navOpen ? 'is-nav-open' : ''}`}>
        <a className="skip-link" href="#admin-main">
          Skip to content
        </a>
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <div className="admin-sidebar__brand">
            <Logo tone="light" size="sm" to={PATHS.admin} />
          </div>
          <nav>
            {NAV.map((group) => (
              <div key={group.label} className="admin-sidebar__group">
                <p className="admin-sidebar__label">{group.label}</p>
                <ul role="list">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <NavLink to={item.to ? `${PATHS.admin}/${item.to}` : PATHS.admin} end={item.end} className="admin-nav-link">
                        <Icon name={item.icon} size={18} />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="admin-sidebar__footer">
            <a className="admin-sidebar__site" href={PATHS.home} target="_blank" rel="noopener noreferrer">
              <Icon name="external" size={14} /> View website
            </a>
          </div>
        </aside>
        {navOpen && <div className="admin-scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}

        <div className="admin-main">
          <header className="admin-topbar">
            <button type="button" className="admin-topbar__menu" aria-label="Open navigation" onClick={() => setNavOpen(true)}>
              <Icon name="menu" size={22} />
            </button>
            <Breadcrumbs />
            <UserMenu />
          </header>
          <main id="admin-main" className="admin-content" tabIndex={-1}>
            <ErrorBoundary key={pathname}>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
