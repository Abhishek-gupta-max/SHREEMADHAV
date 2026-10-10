// Normalises free text before it is stored. Output escaping is the client's
// job (React escapes by default); here we only strip what never belongs in
// stored text: control characters and HTML tags.

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAGS = /<\/?[a-z][^>]*>/gi;

export function cleanText(value) {
  if (typeof value !== 'string') return value;
  return value.replace(CONTROL_CHARS, '').replace(HTML_TAGS, '').trim();
}

export function cleanSingleLine(value) {
  if (typeof value !== 'string') return value;
  return cleanText(value).replace(/\s+/g, ' ');
}

/** ASCII-only file name for the legacy Content-Disposition `filename` parameter. */
export function safeFileName(name) {
  return (
    String(name)
      .normalize('NFKD')
      .replace(/[^\w.\- ]+/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 120) || 'document'
  );
}
