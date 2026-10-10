import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader and tracks { data, error, loading }.
 * The loader receives an AbortSignal; re-runs when `deps` change and aborts
 * stale requests so late responses never overwrite newer ones.
 */
export function useAsync(loader, deps = [], { enabled = true, initialData = null } = {}) {
  const [state, setState] = useState({ data: initialData, error: null, loading: enabled });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const controllerRef = useRef(null);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await loaderRef.current(controller.signal);
      if (!controller.signal.aborted) setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (error.name === 'AbortError' || controller.signal.aborted) return undefined;
      setState((previous) => ({ ...previous, error, loading: false }));
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    run();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  const setData = useCallback((updater) => {
    setState((previous) => ({
      ...previous,
      data: typeof updater === 'function' ? updater(previous.data) : updater,
    }));
  }, []);

  return { ...state, reload: run, setData };
}
