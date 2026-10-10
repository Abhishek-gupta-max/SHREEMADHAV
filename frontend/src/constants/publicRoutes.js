// Single source of truth for public URLs. Used by the router, navigation and
// the build-time sitemap (build/seo-files.js). Keep this file free of imports.

export const PATHS = {
  home: '/',
  about: '/about',
  services: '/services',
  process: '/process',
  whyUs: '/why-us',
  requirements: '/requirements',
  contact: '/contact',
  apply: '/apply',
  privacy: '/privacy-policy',
  terms: '/terms-and-conditions',
  admin: '/admin',
  adminLogin: '/admin/login',

  // Earlier URLs, kept as redirects so existing links keep working.
  legacyEducation: '/overseas-education',
  legacyOpportunities: '/international-opportunities',
  legacyCareers: '/careers',
};

export const PUBLIC_ROUTES = [
  { path: PATHS.home, priority: '1.0', changefreq: 'weekly' },
  { path: PATHS.about, priority: '0.8', changefreq: 'monthly' },
  { path: PATHS.services, priority: '0.9', changefreq: 'monthly' },
  { path: PATHS.process, priority: '0.7', changefreq: 'monthly' },
  { path: PATHS.whyUs, priority: '0.7', changefreq: 'monthly' },
  { path: PATHS.requirements, priority: '0.8', changefreq: 'daily' },
  { path: PATHS.contact, priority: '0.7', changefreq: 'yearly' },
  { path: PATHS.apply, priority: '0.9', changefreq: 'monthly' },
  { path: PATHS.privacy, priority: '0.3', changefreq: 'yearly' },
  { path: PATHS.terms, priority: '0.3', changefreq: 'yearly' },
];
