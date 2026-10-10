import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  STORAGE_KEY,
  ensureLanguageFont,
  fallbackDictionary,
  isSupported,
  loadDictionary,
  translate,
} from '../i18n/index.js';
import { storage } from '../utils/storage.js';

const LanguageContext = createContext(null);

function initialLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isSupported(fromUrl)) return fromUrl;
  const saved = storage.get(STORAGE_KEY);
  return isSupported(saved) ? saved : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(initialLanguage);
  const [dictionary, setDictionary] = useState(fallbackDictionary);

  useEffect(() => {
    let cancelled = false;
    ensureLanguageFont(language);
    loadDictionary(language)
      .then((loaded) => {
        if (!cancelled) setDictionary(loaded);
      })
      .catch(() => {
        if (!cancelled) setDictionary(fallbackDictionary);
      });

    document.documentElement.lang = language;
    storage.set(STORAGE_KEY, language);
    return () => {
      cancelled = true;
    };
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (isSupported(code)) setLanguageState(code);
  }, []);

  const t = useCallback((key, vars) => translate(dictionary, key, vars), [dictionary]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: LANGUAGES,
      current: LANGUAGES.find((item) => item.code === language),
    }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

/** Shorthand for components that only need the translate function. */
export function useT() {
  return useLanguage().t;
}
