export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function paginationMeta({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Wraps a search term for LIKE, escaping wildcards so it matches literally. */
export function likeTerm(term) {
  return `%${String(term).replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}
