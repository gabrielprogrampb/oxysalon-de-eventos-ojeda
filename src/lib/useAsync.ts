/**
 * Hook de carga de datos con estados explícitos (loading / error / vacío).
 * Evita el patrón repetido de useState + useEffect en cada pantalla y
 * descarta respuestas de peticiones antiguas (race conditions).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  /** true solo en la primera carga (para mostrar esqueletos, no spinners) */
  initial: boolean;
  reload: () => void;
}

export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(true);
  const [tick, setTick] = useState(0);
  const runId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoLoader = useCallback(loader, deps);

  useEffect(() => {
    const id = ++runId.current;
    setLoading(true);
    setError(null);

    memoLoader()
      .then((result) => {
        if (id !== runId.current) return; // respuesta obsoleta
        setData(result);
      })
      .catch((err: unknown) => {
        if (id !== runId.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (id !== runId.current) return;
        setLoading(false);
        setInitial(false);
      });
  }, [memoLoader, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, error, loading, initial, reload };
}

/** Debounce simple para el buscador (300 ms). */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
