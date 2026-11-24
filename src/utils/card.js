/**
 * Payment-card helpers. Pure functions only, so the checkout schema, the input
 * masks and any future tests can all share them.
 * NOTE: this is client-side *format* validation for a demo checkout. Real card
 * data must never touch your own servers — use a hosted field from a PSP.
 */

/** Strip everything that is not a digit (also converts Arabic-Indic digits). */
export function digitsOnly(value = '') {
  return String(value)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '');
}

/** Luhn checksum — catches the vast majority of mistyped card numbers. */
export function luhnCheck(number) {
  const digits = digitsOnly(number);
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export function cardBrand(number) {
  const digits = digitsOnly(number);
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

/** "4242424242424242" -> "4242 4242 4242 4242" (Amex: 4-6-5). */
export function formatCardNumber(value) {
  const digits = digitsOnly(value);
  if (/^3[47]/.test(digits)) {
    const d = digits.slice(0, 15);
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
  }
  return digits
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/** "1228" -> "12/28". Fixes a leading 2-9 month ("4" -> "04/"). */
export function formatExpiry(value) {
  let digits = digitsOnly(value).slice(0, 4);
  if (digits.length === 1 && Number(digits) > 1) digits = `0${digits}`;
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

/** Parse "MM/YY" or "MM/YYYY" -> { month, year } (4-digit year) or null. */
export function parseExpiry(value = '') {
  const match = String(value).trim().match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return null;
  const month = Number(match[1]);
  let year = Number(match[2]);
  if (month < 1 || month > 12) return null;
  if (year < 100) year += 2000;
  return { month, year };
}

/** A card is valid through the last day of its expiry month. */
export function isExpiryInFuture(value, now = new Date()) {
  const parsed = parseExpiry(value);
  if (!parsed) return false;
  const endOfMonth = new Date(parsed.year, parsed.month, 0, 23, 59, 59, 999);
  return endOfMonth.getTime() >= now.getTime();
}

/** Expiry more than 20 years out is almost certainly a typo. */
export function isExpiryPlausible(value, now = new Date()) {
  const parsed = parseExpiry(value);
  return Boolean(parsed) && parsed.year <= now.getFullYear() + 20;
}
