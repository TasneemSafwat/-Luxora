import { createContext } from 'react';

/**
 * React Context is used for cross-cutting *preferences* (theme + locale),
 * while Redux Toolkit owns the transactional domain state (cart, wishlist, auth…).
 * This keeps the store lean and avoids serialising UI preferences.
 */

export const ThemeContext = createContext(null);

export const LanguageContext = createContext(null);
