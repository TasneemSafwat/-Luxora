import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './contexts';
import { LANGUAGES, interpolate, translations } from '../i18n/translations';
import { CURRENCIES, STORAGE_KEYS } from '../utils/constants';
import { ensureArabicFont } from '../utils/fonts';
import { localizeProduct, localizeReview, translateColor } from '../i18n/productI18n';
import { formatPrice as formatPriceUtil } from '../utils/format';

function getInitialLang() {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.lang);
    if (stored && translations[stored]) return stored;
  } catch {
    /* noop */
  }
  return 'en';
}

function getInitialCurrency() {
  if (typeof window === 'undefined') return 'USD';
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.currency);
    // Only accept currencies we can actually convert (a stale/edited value used to fall through silently).
    if (stored && CURRENCIES[stored]) return stored;
  } catch {
    /* noop */
  }
  return 'USD';
}

const pluralRulesCache = new Map();
function pluralRules(locale) {
  if (!pluralRulesCache.has(locale)) pluralRulesCache.set(locale, new Intl.PluralRules(locale));
  return pluralRulesCache.get(locale);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);
  const [currency, setCurrencyState] = useState(getInitialCurrency);

  const language = LANGUAGES.find((item) => item.code === lang) ?? LANGUAGES[0];
  const dir = language.dir;
  const locale = language.locale;
  const isRTL = dir === 'rtl';

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    if (lang === 'ar') ensureArabicFont();
    try {
      localStorage.setItem(STORAGE_KEYS.lang, lang);
    } catch {
      /* noop */
    }
  }, [lang, dir]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.currency, currency);
    } catch {
      /* noop */
    }
  }, [currency]);

  const setLang = useCallback((next) => {
    if (translations[next]) setLangState(next);
  }, []);

  const toggleLang = useCallback(() => setLangState((prev) => (prev === 'en' ? 'ar' : 'en')), []);
  const setCurrency = useCallback((next) => {
    if (CURRENCIES[next]) setCurrencyState(next);
  }, []);

  /** Translate a dotted key with optional `{token}` interpolation. */
  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] ?? translations.en;
      // Plural-aware: when `count` is passed and "<key>.<one|two|few|many|other>" exists, use the
      // form the language's own plural rules pick. ("3 item(s)" read like a template left behind.)
      let template = dict[key] ?? translations.en[key] ?? key;
      if (typeof vars?.count === 'number') {
        const category = pluralRules(locale).select(vars.count);
        template = dict[`${key}.${category}`] ?? dict[`${key}.other`] ?? template;
      }
      return interpolate(template, vars);
    },
    [lang, locale],
  );

  /** Currency-aware price formatter bound to the active locale. */
  const formatPrice = useCallback(
    (amount) => formatPriceUtil(amount, { currency, locale }),
    [currency, locale],
  );

  /*
   * Catalogue content is stored in English; these return an Arabic *view* of it when the language
   * is Arabic (and the very same object in English). Display only — never dispatch the result into
   * the store, or the cart would remember Arabic names after switching back to English.
   */
  const localize = useCallback((product) => (lang === 'ar' ? localizeProduct(product) : product), [lang]);
  const localizeColor = useCallback((name) => (lang === 'ar' ? translateColor(name) : name), [lang]);
  const localizeReviewText = useCallback((review) => (lang === 'ar' ? localizeReview(review) : review), [lang]);

  const value = useMemo(
    () => ({
      lang,
      dir,
      locale,
      isRTL,
      language,
      languages: LANGUAGES,
      setLang,
      toggleLang,
      currency,
      setCurrency,
      t,
      formatPrice,
      localize,
      localizeColor,
      localizeReview: localizeReviewText,
    }),
    [lang, dir, locale, isRTL, language, setLang, toggleLang, currency, setCurrency, t, formatPrice, localize, localizeColor, localizeReviewText],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
