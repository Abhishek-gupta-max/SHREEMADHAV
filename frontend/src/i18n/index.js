import en from './locales/en.js';

export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY = 'smos.language';

// `font` is a Google Fonts family loaded on demand for non-Latin scripts.
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', short: 'EN', font: null },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', short: 'HI', font: 'Noto+Sans+Devanagari:wght@400;500;600' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', short: 'PA', font: 'Noto+Sans+Gurmukhi:wght@400;500;600' },
];

// Non-English dictionaries are split into their own chunks and fetched on demand.
const loaders = {
  hi: () => import('./locales/hi.js'),
  pa: () => import('./locales/pa.js'),
};

export const fallbackDictionary = en;

export async function loadDictionary(code) {
  if (code === DEFAULT_LANGUAGE || !loaders[code]) return en;
  const module = await loaders[code]();
  return module.default;
}

export function isSupported(code) {
  return LANGUAGES.some((language) => language.code === code);
}

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

/** Resolves a dotted key, falling back to English, and fills {placeholders}. */
export function translate(dictionary, key, vars) {
  let value = lookup(dictionary, key);
  if (value === undefined) value = lookup(en, key);
  if (value === undefined) {
    if (import.meta.env.DEV) console.warn(`[i18n] Missing key: ${key}`);
    return key;
  }
  if (typeof value === 'string' && vars) {
    return value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match).toString());
  }
  return value;
}

/** Loads the font for a script once, the first time that language is used. */
export function ensureLanguageFont(code) {
  const language = LANGUAGES.find((item) => item.code === code);
  if (!language?.font) return;
  const id = `font-${code}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${language.font}&display=swap`;
  document.head.appendChild(link);
}
