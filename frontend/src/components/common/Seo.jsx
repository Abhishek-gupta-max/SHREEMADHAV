import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '../../constants/site.js';

// Manages <head> tags for the current page: title, description, canonical,
// Open Graph, Twitter and optional JSON-LD. Tags are updated in place so
// there is never more than one of each.

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function Seo({ title, description, image = SITE.ogImage, noindex = false, jsonLd, type = 'website' }) {
  const { pathname } = useLocation();
  const structuredData = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE.shortName}` : SITE.defaultTitle;
    const url = `${SITE.url}${pathname === '/' ? '' : pathname}`;
    const imageUrl = image.startsWith('http') ? image : `${SITE.url}${image}`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', url || SITE.url);

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:locale', document.documentElement.lang === 'en' ? 'en_IN' : `${document.documentElement.lang}_IN`);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);

    let script;
    if (structuredData) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.page = 'true';
      script.textContent = structuredData;
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, image, noindex, structuredData, type, pathname]);

  return null;
}

/** BreadcrumbList structured data for inner pages. */
export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path === '/' ? '' : item.path}`,
    })),
  };
}
