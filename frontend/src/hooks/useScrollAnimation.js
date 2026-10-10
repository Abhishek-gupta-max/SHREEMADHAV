import { useEffect } from 'react';

const SELECTOR = ['.scroll-fade-in', '.scroll-fade-in-left', '.scroll-fade-in-right', '.scroll-scale-in']
  .map((selector) => `${selector}:not(.visible)`)
  .join(',');

/**
 * Adds `visible` to scroll-animated elements as they enter the viewport.
 * Pass deps that change when new animated content renders (e.g. data that
 * arrives from the API) so those elements are picked up too.
 */
export function useScrollAnimation(deps = []) {
  useEffect(() => {
    const elements = document.querySelectorAll(SELECTOR);
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('visible'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
