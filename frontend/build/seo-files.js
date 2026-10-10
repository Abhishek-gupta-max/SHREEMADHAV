// Vite plugin: writes robots.txt and sitemap.xml into the build output using
// VITE_SITE_URL, so the production domain is configured in one place.
import { PUBLIC_ROUTES } from '../src/constants/publicRoutes.js';

export function seoFiles({ siteUrl }) {
  const base = (siteUrl || 'http://localhost:5173').replace(/\/+$/, '');

  return {
    name: 'smos-seo-files',
    apply: 'build',
    buildStart() {
      if (!siteUrl) this.warn('VITE_SITE_URL is not set; sitemap.xml and robots.txt will use localhost.');
    },
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = PUBLIC_ROUTES.map(
        ({ path, priority, changefreq }) =>
          `  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>${today}</lastmod>\n` +
          `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
      ).join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`,
      });
    },
  };
}
