import { useCallback, useEffect, useRef, useState } from 'react';

function readStored(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item === null ? fallback : JSON.parse(item);
  } catch {
    return fallback;
  }
}

/**
 * Persisted state backed by localStorage.
 *  - Reads lazily so the very first render already has the stored value.
 *  - Writes happen in the setter, never inside a React state-updater function
 *    (updaters must be pure — StrictMode deliberately runs them twice).
 *  - Stays in sync with other tabs, including when the key is removed there.
 */
export function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue);
  const [storedValue, setStoredValue] = useState(() => readStored(key, initialRef.current));
  const valueRef = useRef(storedValue);

  const commit = useCallback((next) => {
    valueRef.current = next;
    setStoredValue(next);
  }, []);

  const setValue = useCallback(
    (value) => {
      // Resolve against the ref so several calls in one tick compose correctly.
      const next = typeof value === 'function' ? value(valueRef.current) : value;
      commit(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage full or unavailable — state still updates in memory */
      }
    },
    [key, commit],
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
    commit(initialRef.current);
  }, [key, commit]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== key) return;
      if (event.newValue === null) {
        commit(initialRef.current);
        return;
      }
      try {
        commit(JSON.parse(event.newValue));
      } catch {
        /* ignore malformed payloads */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, commit]);

  return [storedValue, setValue, remove];
}
