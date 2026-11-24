/**
 * Application-wide constants.
 * Keeping magic values (storage keys, option lists, config) in one place keeps
 * components declarative and makes global changes trivial.
 */

export const BRAND = {
  name: 'LUXORA',
  tagline: 'Quiet luxury, considered.',
  taglineAr: 'فخامة هادئة، مدروسة.',
  supportEmail: 'care@luxora.example',
  phone: '+1 (212) 555 0148',
};

export const STORAGE_KEYS = {
  cart: 'luxora.cart',
  wishlist: 'luxora.wishlist',
  auth: 'luxora.auth',
  orders: 'luxora.orders',
  addresses: 'luxora.addresses',
  recentSearches: 'luxora.recentSearches',
  recentlyViewed: 'luxora.recentlyViewed',
  theme: 'luxora.theme',
  lang: 'luxora.lang',
  currency: 'luxora.currency',
  coupon: 'luxora.coupon',
};

/** DummyJSON is used as the product source. Swap `false` to force local mock data. */
export const PRODUCT_API_BASE = 'https://dummyjson.com';
export const USE_REMOTE_API = true;

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar' },
  EGP: { code: 'EGP', symbol: 'E£', rate: 48.6, label: 'Egyptian Pound' },
  AED: { code: 'AED', symbol: 'AED ', rate: 3.67, label: 'UAE Dirham' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro' },
};

/** DummyJSON product prices are in USD. Rates convert to a display currency. */

export const FREE_SHIPPING_THRESHOLD = 250;
export const TAX_RATE = 0.08;

export const SHIPPING_METHODS = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    labelAr: 'توصيل قياسي',
    description: '3 – 5 business days',
    descriptionAr: '٣ – ٥ أيام عمل',
    price: 0,
    freeOver: FREE_SHIPPING_THRESHOLD,
  },
  {
    id: 'express',
    label: 'Express Delivery',
    labelAr: 'توصيل سريع',
    description: '1 – 2 business days',
    descriptionAr: '١ – ٢ يوم عمل',
    price: 18,
    freeOver: FREE_SHIPPING_THRESHOLD,
  },
  {
    id: 'atelier',
    label: 'Atelier Courier',
    labelAr: 'مندوب الأتيليه',
    description: 'Same day, select cities',
    descriptionAr: 'في نفس اليوم داخل مدن مختارة',
    price: 42,
  },
];

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', labelAr: 'بطاقة ائتمان / خصم', hint: 'Visa · Mastercard · Amex' },
  { id: 'wallet', label: 'Digital Wallet', labelAr: 'محفظة رقمية', hint: 'Apple Pay · Google Pay' },
  { id: 'transfer', label: 'Bank Transfer', labelAr: 'تحويل بنكي', hint: 'Manual confirmation' },
  { id: 'cod', label: 'Cash on Delivery', labelAr: 'الدفع عند الاستلام', hint: 'Available in select regions' },
];

export const COUPONS = {
  LUXORA10: { code: 'LUXORA10', type: 'percent', value: 10, label: '10% off your order' },
  ATELIER20: { code: 'ATELIER20', type: 'percent', value: 20, label: '20% off — private client' },
  WELCOME15: { code: 'WELCOME15', type: 'fixed', value: 15, label: '$15 off your first order' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 100, label: 'Complimentary shipping' },
};

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured', labelAr: 'المميزة' },
  { id: 'newest', label: 'Newest arrivals', labelAr: 'الأحدث' },
  { id: 'price-asc', label: 'Price: low to high', labelAr: 'السعر: من الأقل للأعلى' },
  { id: 'price-desc', label: 'Price: high to low', labelAr: 'السعر: من الأعلى للأقل' },
  { id: 'rating', label: 'Top rated', labelAr: 'الأعلى تقييماً' },
  { id: 'popularity', label: 'Best selling', labelAr: 'الأكثر مبيعاً' },
  { id: 'discount', label: 'Biggest saving', labelAr: 'أكبر خصم' },
];

/** Curated DummyJSON category slugs mapped to editorial display names. */
export const CATEGORY_META = {
  'womens-dresses': { en: "Women's Dresses", ar: 'فساتين نسائية' },
  'womens-bags': { en: "Women's Bags", ar: 'حقائب نسائية' },
  'womens-jewellery': { en: 'Fine Jewellery', ar: 'مجوهرات راقية' },
  'womens-shoes': { en: "Women's Shoes", ar: 'أحذية نسائية' },
  'womens-watches': { en: "Women's Watches", ar: 'ساعات نسائية' },
  'mens-shirts': { en: "Men's Shirts", ar: 'قمصان رجالية' },
  'mens-shoes': { en: "Men's Shoes", ar: 'أحذية رجالية' },
  'mens-watches': { en: "Men's Watches", ar: 'ساعات رجالية' },
  sunglasses: { en: 'Sunglasses', ar: 'نظارات شمسية' },
  tops: { en: 'Tops & Knitwear', ar: 'قطع علوية وتريكو' },
  beauty: { en: 'Beauty', ar: 'الجمال' },
  fragrances: { en: 'Fragrance', ar: 'العطور' },
  'skin-care': { en: 'Skincare', ar: 'العناية بالبشرة' },
  'home-decoration': { en: 'Home Objects', ar: 'قطع منزلية' },
  'kitchen-accessories': { en: 'Kitchen & Table', ar: 'المطبخ والمائدة' },
  furniture: { en: 'Furniture', ar: 'الأثاث' },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_META);

export const PRODUCT_COLORS = {
  black: '#171717',
  white: '#F7F7F5',
  cream: '#EDE6DA',
  beige: '#D9C9AE',
  gold: '#B89B72',
  silver: '#C7C9CC',
  brown: '#7A5B45',
  navy: '#28313F',
  green: '#4A5A45',
  red: '#8E3B34',
  pink: '#D9A9AE',
  blue: '#4A637C',
  grey: '#9AA0A6',
  purple: '#6B5B7B',
};

export const SIZES = {
  apparel: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  jewellery: ['One Size'],
  watches: ['One Size'],
};

export const NAV_LINKS = [
  { to: '/', label: 'Home', labelAr: 'الرئيسية' },
  { to: '/shop', label: 'Shop', labelAr: 'المتجر' },
  { to: '/shop?category=womens-dresses', label: 'Women', labelAr: 'نساء' },
  { to: '/shop?category=mens-shirts', label: 'Men', labelAr: 'رجال' },
  { to: '/shop?category=fragrances', label: 'Fragrance', labelAr: 'العطور' },
  { to: '/shop?collection=new', label: 'New In', labelAr: 'وصل حديثاً' },
];

export const ACCENT_SWATCHES = ['#B89B72', '#171717', '#EDE6DA'];
