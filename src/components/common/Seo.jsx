import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'LUXORA';

/** Lightweight SEO head manager — updates title + key meta tags per route. */
export function Seo({ title, description, image, type = 'website', noIndex = false }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Quiet Luxury, Considered`;
    document.title = fullTitle;

    const setMeta = (attr, key, content) => {
      if (!content) return;
      let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', window.location.href);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);

    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:card', 'summary_large_image');
    }
  }, [title, description, image, type, noIndex, pathname]);

  return null;
}

export default Seo;
