import { useLanguage } from '../context/LanguageContext.jsx';
import { publicService } from '../services/publicService.js';
import { useAsync } from './useAsync.js';

/** Active services in the current language (refetched when it changes). */
export function useServices() {
  const { language } = useLanguage();
  return useAsync((signal) => publicService.services(language, { signal }), [language], { initialData: [] });
}
