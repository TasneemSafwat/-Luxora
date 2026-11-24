import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './contexts';
import { STORAGE_KEYS } from '../utils/constants';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** The shopper's explicit choice ('light' | 'dark'), or null if they never made one. */
function readStoredTheme() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

const readSystemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

/**
 * Two independent inputs decide the theme:
 *   stored  – an explicit choice made with the toggle (persisted)
 *   system  – the OS preference (never persisted, always tracked)
 * The explicit choice wins; otherwise the app follows the OS live.
 *
 * (Previously the effect that persisted the theme also ran on first mount, so the
 * "has the user chosen?" check that followed it was always true and the app could
 * never follow the OS setting.)
 */
export function ThemeProvider({ children }) {
  const [stored, setStored] = useState(readStoredTheme);
  const [system, setSystem] = useState(readSystemTheme);

  const theme = stored ?? system;
  const isDark = theme === 'dark';

  // Reflect the theme on <html> so Tailwind's `dark:` variant and CSS vars react.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  // Persist only deliberate choices.
  useEffect(() => {
    if (!stored) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, stored);
    } catch {
      /* noop */
    }
  }, [stored]);

  // Always track the OS preference; it is simply ignored while an explicit choice exists.
  useEffect(() => {
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (event) => setSystem(event.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next) => {
    if (next === 'light' || next === 'dark') setStored(next);
  }, []);
  const toggleTheme = useCallback(() => setStored(isDark ? 'light' : 'dark'), [isDark]);

  const value = useMemo(() => ({ theme, isDark, setTheme, toggleTheme }), [theme, isDark, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
