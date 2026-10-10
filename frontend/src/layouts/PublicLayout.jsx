import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useT } from '../context/LanguageContext.jsx';
import { SettingsProvider } from '../context/SettingsContext.jsx';
import { SiteHeader } from '../components/site/SiteHeader.jsx';
import { SiteFooter } from '../components/site/SiteFooter.jsx';
import { PageLoader } from '../components/common/Spinner.jsx';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';
import '../styles/site.css';

/** Scrolls to the top on navigation, or to the #hash target when present. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Wait a tick so lazily-loaded page content exists before scrolling.
      const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 150);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
  return null;
}

export function PublicLayout() {
  const t = useT();
  const { pathname } = useLocation();

  return (
    <SettingsProvider>
      <div className="site flex flex-col min-h-screen">
        <ScrollManager />
        <a className="skip-link" href="#main">
          {t('common.skipToContent')}
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-grow">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoader label={t('common.loading')} />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <SiteFooter />
      </div>
    </SettingsProvider>
  );
}
