const LOCALE_TAGS = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN' };
const DISPLAY_TIME_ZONE = 'Asia/Kolkata';

// The API returns UTC timestamps as "YYYY-MM-DD HH:mm:ss" strings.
export function parseUtc(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}${value.length > 10 ? 'Z' : 'T00:00:00Z'}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, language = 'en', options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const date = parseUtc(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat(LOCALE_TAGS[language] || 'en-IN', { timeZone: DISPLAY_TIME_ZONE, ...options }).format(date);
}

export function formatDateTime(value, language = 'en') {
  return formatDate(value, language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "3 hours ago" style label, falling back to a date after a week. */
export function formatRelative(value) {
  const date = parseUtc(value);
  if (!date) return '—';
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 60) return 'just now';
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(seconds / 86400), 'day');
  return formatDate(value);
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function telHref(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`;
}

export function whatsappHref(phone) {
  return `https://wa.me/${String(phone).replace(/\D/g, '')}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function humanize(value = '') {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
