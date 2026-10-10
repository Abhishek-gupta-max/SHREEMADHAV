import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * List state (search, filters, sort, page) stored in the URL, so filtered
 * views survive refreshes and can be shared or bookmarked.
 */
export function useListQuery(defaults = {}) {
  const [params, setParams] = useSearchParams();

  const query = useMemo(() => {
    const result = { page: 1, ...defaults };
    params.forEach((value, key) => {
      result[key] = key === 'page' ? Math.max(1, Number(value) || 1) : value;
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  /** Updates keys; any change other than `page` resets to page 1. */
  const update = useCallback(
    (changes) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined || value === defaults[key]) next.delete(key);
            else next.set(key, value);
          });
          if (!('page' in changes)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  return { query, update, reset };
}
