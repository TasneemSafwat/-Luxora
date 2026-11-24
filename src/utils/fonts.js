const ARABIC_FONT_ID = 'font-arabic';
const ARABIC_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600&display=swap';

/**
 * Load Cairo only for Arabic visitors. English users never download it,
 * which removes a whole font family from the critical path.
 * (index.html performs the same injection before first paint when Arabic is the stored language.)
 */
export function ensureArabicFont() {
  if (typeof document === 'undefined' || document.getElementById(ARABIC_FONT_ID)) return;
  const link = document.createElement('link');
  link.id = ARABIC_FONT_ID;
  link.rel = 'stylesheet';
  link.href = ARABIC_FONT_HREF;
  document.head.appendChild(link);
}
