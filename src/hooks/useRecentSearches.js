import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

const EMPTY = [];

/** Persisted recent-search list (most recent first, de-duplicated, capped). */
export function useRecentSearches(limit = 6) {
  const [recent, setRecent, clear] = useLocalStorage(STORAGE_KEYS.recentSearches, EMPTY);

  // Stable identities: consumers can safely list these in effect dependency arrays.
  const record = useCallback(
    (term) => {
      const value = String(term || '').trim();
      if (value.length < 2) return;
      setRecent((current) => {
        const list = Array.isArray(current) ? current : [];
        return [value, ...list.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, limit);
      });
    },
    [limit, setRecent],
  );

  const removeOne = useCallback(
    (term) => setRecent((current) => (Array.isArray(current) ? current : []).filter((item) => item !== term)),
    [setRecent],
  );

  return { recent: Array.isArray(recent) ? recent : EMPTY, record, removeOne, clear };
}

export default useRecentSearches;
