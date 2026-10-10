import en from '../i18n/locales/en.js';
import { humanize } from './format.js';

// English labels for form vocabularies, used by the (English-only) admin panel
// regardless of the language chosen on the public site.
export function optionLabel(group, value) {
  if (!value) return '—';
  return en.options[group]?.[value] || humanize(value);
}
