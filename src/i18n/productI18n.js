/**
 * Arabic localisation for catalogue content (names, brands, descriptions, materials, colours,
 * warranty / shipping / return copy and review comments).
 *
 * Two layers:
 *   1. CURATED  – hand-written Arabic for the built-in catalogue (exact title match).
 *   2. A rule-based engine for everything else (the live product feed): glossaries for brands,
 *      colours, product nouns and adjectives, plus Arabic grammar rules — the noun comes first,
 *      adjectives follow and agree in gender, colours are joined with "و".
 *      Words the glossary doesn't know (model names such as "Submariner") are kept as they are.
 *
 * Product DESCRIPTIONS from the live feed are free-form English marketing copy and can't be
 * translated by rules, so for those the engine composes Arabic copy from the product's name,
 * brand and category. To give any specific product a hand-written translation, add it to
 * `OVERRIDES` below (keyed by the exact English title) — no other change needed.
 */

/* ———————————————————————————— helpers ———————————————————————————— */

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toArabicDigits = (value) => String(value).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
const norm = (text) => String(text ?? '').trim();
const key = (text) => norm(text).toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');

/* ———————————————————————————— brands ———————————————————————————— */

const BRANDS = {
  'luxora atelier': 'لوكسورا أتيليه',
  'maison lune': 'ميزون لون',
  aurelia: 'أوريليا',
  'costa atelier': 'كوستا أتيليه',
  'ferro & co.': 'فيرو آند كو.',
  marchetti: 'مارشيتي',
  'cortina time': 'كورتينا تايم',
  'vela eyewear': 'فيلا أيويير',
  herbier: 'هربييه',
  'terra studio': 'تيرا ستوديو',
  'nord atelier': 'نورد أتيليه',
  essence: 'إيسنس',
  'glamour beauty': 'غلامور بيوتي',
  'velvet touch': 'فيلفيت تاتش',
  'chic cosmetics': 'شيك كوزمتكس',
  'nail couture': 'نيل كوتور',
  'calvin klein': 'كالفن كلاين',
  chanel: 'شانيل',
  dior: 'ديور',
  'dolce & gabbana': 'دولتشي آند غابانا',
  dolce: 'دولتشي',
  gucci: 'غوتشي',
  'annibale colombo': 'أنيبالي كولومبو',
  'furniture co.': 'فرنيتشر كو.',
  knoll: 'كنول',
  'bath trends': 'باث تريندز',
  nike: 'نايك',
  puma: 'بوما',
  rolex: 'رولكس',
  longines: 'لونجين',
  iwc: 'آي دبليو سي',
  prada: 'برادا',
  marni: 'مارني',
  gigabyte: 'غيغابايت',
  heshe: 'هيشي',
  pampi: 'بامبي',
  'fashion shades': 'فاشن شيدز',
  'fashion express': 'فاشن إكسبرس',
  'fashion trends': 'فاشن تريندز',
  'fashion co.': 'فاشن كو.',
  attitude: 'أتيتيود',
  olay: 'أولاي',
  vaseline: 'فازلين',
  amazon: 'أمازون',
  apple: 'آبل',
  'rolex cellini': 'رولكس سيليني',
  'ray-ban': 'راي بان',
  'ray ban': 'راي بان',
  gap: 'غاب',
  zara: 'زارا',
  'h&m': 'إتش آند إم',
  adidas: 'أديداس',
  'louis vuitton': 'لويس فيتون',
  hermès: 'هيرميس',
  hermes: 'هيرميس',
  versace: 'فيرساتشي',
  armani: 'أرماني',
  burberry: 'بربري',
  cartier: 'كارتييه',
  omega: 'أوميغا',
  tissot: 'تيسوت',
  casio: 'كاسيو',
};

/** Longest-prefix brand match — returns { ar, rest } or null. */
function matchLeadingBrand(title) {
  const words = norm(title).split(/\s+/);
  for (let n = Math.min(3, words.length); n >= 1; n -= 1) {
    const candidate = key(words.slice(0, n).join(' '));
    if (BRANDS[candidate]) return { ar: BRANDS[candidate], rest: words.slice(n) };
  }
  return null;
}

export function translateBrand(brand) {
  const found = BRANDS[key(brand)];
  return found ?? norm(brand);
}

/* ———————————————————————————— colours ———————————————————————————— */

// name -> [masculine, feminine]
const COLORS = {
  black: ['أسود', 'سوداء'],
  white: ['أبيض', 'بيضاء'],
  'off white': ['عاجي', 'عاجية'],
  offwhite: ['عاجي', 'عاجية'],
  red: ['أحمر', 'حمراء'],
  blue: ['أزرق', 'زرقاء'],
  green: ['أخضر', 'خضراء'],
  yellow: ['أصفر', 'صفراء'],
  pink: ['وردي', 'وردية'],
  brown: ['بني', 'بنية'],
  grey: ['رمادي', 'رمادية'],
  gray: ['رمادي', 'رمادية'],
  golden: ['ذهبي', 'ذهبية'],
  gold: ['ذهبي', 'ذهبية'],
  silver: ['فضي', 'فضية'],
  navy: ['كحلي', 'كحلية'],
  orange: ['برتقالي', 'برتقالية'],
  purple: ['بنفسجي', 'بنفسجية'],
  beige: ['بيج', 'بيج'],
  cream: ['كريمي', 'كريمية'],
  ivory: ['عاجي', 'عاجية'],
  camel: ['جملي', 'جملية'],
  chocolate: ['شوكولاتة', 'شوكولاتة'],
  forest: ['أخضر غابي', 'خضراء غابية'],
  stone: ['حجري', 'حجرية'],
  champagne: ['شامبانيا', 'شامبانيا'],
  rose: ['وردي', 'وردية'],
  burgundy: ['عنابي', 'عنابية'],
  slate: ['رمادي أردوازي', 'رمادية أردوازية'],
  cognac: ['كونياك', 'كونياك'],
  tan: ['أسمر فاتح', 'سمراء فاتحة'],
  maroon: ['بورغندي', 'بورغندية'],
  turquoise: ['فيروزي', 'فيروزية'],
  teal: ['تركوازي', 'تركوازية'],
  multicolor: ['متعدد الألوان', 'متعددة الألوان'],
};

/** Stand-alone colour label (swatches, cart lines). */
export function translateColor(name) {
  const pair = COLORS[key(name)];
  return pair ? pair[0] : norm(name);
}

/* ———————————————————————————— nouns ———————————————————————————— */

// head nouns: english -> [arabic, gender]  (plural nouns are treated as feminine, as Arabic does for non-human plurals)
const NOUNS = {
  dress: ['فستان', 'm'],
  dresses: ['فساتين', 'f'],
  gown: ['فستان سهرة', 'm'],
  frock: ['فستان', 'm'],
  corset: ['كورسيه', 'm'],
  skirt: ['تنورة', 'f'],
  suit: ['بدلة', 'f'],
  shirt: ['قميص', 'm'],
  shirts: ['قمصان', 'f'],
  tshirt: ['تيشيرت', 'm'],
  't-shirt': ['تيشيرت', 'm'],
  blouse: ['بلوزة', 'f'],
  top: ['توب', 'm'],
  sweater: ['سترة صوفية', 'f'],
  knit: ['تريكو', 'm'],
  cardigan: ['كارديغان', 'm'],
  camisole: ['كاميزول', 'm'],
  coat: ['معطف', 'm'],
  jacket: ['جاكيت', 'm'],
  hoodie: ['هودي', 'm'],
  jeans: ['جينز', 'm'],
  trousers: ['بنطال', 'm'],
  pants: ['بنطال', 'm'],
  shorts: ['شورت', 'm'],
  scarf: ['وشاح', 'm'],
  belt: ['حزام', 'm'],
  bag: ['حقيبة', 'f'],
  handbag: ['حقيبة يد', 'f'],
  backpack: ['حقيبة ظهر', 'f'],
  tote: ['حقيبة توت', 'f'],
  purse: ['حقيبة صغيرة', 'f'],
  clutch: ['حقيبة كلاتش', 'f'],
  wallet: ['محفظة', 'f'],
  shoes: ['أحذية', 'f'],
  shoe: ['حذاء', 'm'],
  heel: ['حذاء بكعب', 'm'],
  heels: ['أحذية بكعب', 'f'],
  sneakers: ['أحذية رياضية', 'f'],
  sneaker: ['حذاء رياضي', 'm'],
  trainers: ['أحذية رياضية', 'f'],
  cleats: ['حذاء بمسامير', 'm'],
  slipper: ['شبشب', 'm'],
  slippers: ['شباشب', 'f'],
  sandal: ['صندل', 'm'],
  sandals: ['صنادل', 'f'],
  boot: ['بوت', 'm'],
  boots: ['أحذية بوت', 'f'],
  loafer: ['لوفر', 'm'],
  derby: ['حذاء ديربي', 'm'],
  watch: ['ساعة', 'f'],
  earring: ['قرط', 'm'],
  earrings: ['أقراط', 'f'],
  necklace: ['عقد', 'm'],
  ring: ['خاتم', 'm'],
  bracelet: ['سوار', 'm'],
  pendant: ['قلادة', 'f'],
  chain: ['سلسلة', 'f'],
  sunglasses: ['نظارة شمسية', 'f'],
  glasses: ['نظارة', 'f'],
  mascara: ['ماسكارا', 'f'],
  lipstick: ['أحمر شفاه', 'm'],
  'nail polish': ['طلاء أظافر', 'm'],
  eyeshadow: ['ظلال عيون', 'm'],
  palette: ['باليت', 'm'],
  powder: ['بودرة', 'f'],
  foundation: ['كريم أساس', 'm'],
  blush: ['أحمر خدود', 'm'],
  perfume: ['عطر', 'm'],
  cologne: ['كولونيا', 'f'],
  lotion: ['لوشن', 'm'],
  'body wash': ['غسول الجسم', 'm'],
  soap: ['صابون', 'm'],
  cream: ['كريم', 'm'],
  serum: ['سيروم', 'm'],
  bed: ['سرير', 'm'],
  sofa: ['أريكة', 'f'],
  chair: ['كرسي', 'm'],
  table: ['طاولة', 'f'],
  lamp: ['مصباح', 'm'],
  vanity: ['تسريحة', 'f'],
  vase: ['مزهرية', 'f'],
  swing: ['أرجوحة', 'f'],
  frame: ['إطار', 'm'],
  pot: ['أصيص', 'm'],
  plant: ['نبتة', 'f'],
  showpiece: ['قطعة ديكور', 'f'],
  knife: ['سكين', 'f'],
  spatula: ['سباتولا', 'f'],
  'rolling pin': ['نشابة', 'f'],
  knives: ['سكاكين', 'f'],
  spoon: ['ملعقة', 'f'],
  fork: ['شوكة', 'f'],
  cup: ['كوب', 'm'],
  mug: ['مج', 'm'],
  pan: ['مقلاة', 'f'],
  plate: ['طبق', 'm'],
  bowl: ['وعاء', 'm'],
  grater: ['مبشرة', 'f'],
  strainer: ['مصفاة', 'f'],
  tongs: ['ملقط', 'm'],
  whisk: ['خفّاقة', 'f'],
  peeler: ['مقشرة', 'f'],
  juicer: ['عصّارة', 'f'],
  squeezer: ['عصّارة', 'f'],
  board: ['لوح تقطيع', 'm'],
  tray: ['صينية', 'f'],
  bottle: ['زجاجة', 'f'],
  set: ['طقم', 'm'],
  gloves: ['قفازات', 'f'],
  hat: ['قبعة', 'f'],
  cap: ['قبعة', 'f'],
};

/* ———————————————————————————— adjectives ———————————————————————————— */

// kind: 'audience' | 'style' | 'material' ; english -> [masc, fem, kind]
const ADJECTIVES = {
  women: ['نسائي', 'نسائية', 'audience'],
  womens: ['نسائي', 'نسائية', 'audience'],
  "women's": ['نسائي', 'نسائية', 'audience'],
  woman: ['نسائي', 'نسائية', 'audience'],
  female: ['نسائي', 'نسائية', 'audience'],
  ladies: ['نسائي', 'نسائية', 'audience'],
  girl: ['للبنات', 'للبنات', 'for'],
  girls: ['للبنات', 'للبنات', 'for'],
  men: ['رجالي', 'رجالية', 'audience'],
  mens: ['رجالي', 'رجالية', 'audience'],
  "men's": ['رجالي', 'رجالية', 'audience'],
  man: ['رجالي', 'رجالية', 'audience'],
  male: ['رجالي', 'رجالية', 'audience'],
  boys: ['للأولاد', 'للأولاد', 'for'],
  unisex: ['للجنسين', 'للجنسين', 'audience'],
  leather: ['جلدي', 'جلدية', 'material'],
  faux: ['صناعي', 'صناعية', 'material'],
  suede: ['سويد', 'سويد', 'material'],
  silk: ['حريري', 'حريرية', 'material'],
  cotton: ['قطني', 'قطنية', 'material'],
  wool: ['صوفي', 'صوفية', 'material'],
  woolen: ['صوفي', 'صوفية', 'material'],
  cashmere: ['كشمير', 'كشمير', 'material'],
  linen: ['كتاني', 'كتانية', 'material'],
  denim: ['جينز', 'جينز', 'material'],
  velvet: ['مخملي', 'مخملية', 'material'],
  satin: ['ساتان', 'ساتان', 'material'],
  lace: ['دانتيل', 'دانتيل', 'material'],
  wooden: ['خشبي', 'خشبية', 'material'],
  wood: ['خشبي', 'خشبية', 'material'],
  bamboo: ['خيزران', 'خيزران', 'material'],
  steel: ['ستانلس ستيل', 'ستانلس ستيل', 'material'],
  stainless: ['ستانلس ستيل', 'ستانلس ستيل', 'material'],
  aluminium: ['ألومنيوم', 'ألومنيوم', 'material'],
  aluminum: ['ألومنيوم', 'ألومنيوم', 'material'],
  copper: ['نحاسي', 'نحاسية', 'material'],
  ceramic: ['سيراميك', 'سيراميك', 'material'],
  glass: ['زجاجي', 'زجاجية', 'material'],
  plastic: ['بلاستيكي', 'بلاستيكية', 'material'],
  crystal: ['كريستال', 'كريستال', 'material'],
  pearl: ['لؤلؤ', 'لؤلؤ', 'material'],
  diamond: ['ألماس', 'ألماس', 'material'],
  classic: ['كلاسيكي', 'كلاسيكية', 'style'],
  elegant: ['أنيق', 'أنيقة', 'style'],
  casual: ['كاجوال', 'كاجوال', 'style'],
  formal: ['رسمي', 'رسمية', 'style'],
  sports: ['رياضي', 'رياضية', 'style'],
  sport: ['رياضي', 'رياضية', 'style'],
  slim: ['نحيف', 'نحيفة', 'style'],
  oversized: ['واسع', 'واسعة', 'style'],
  vintage: ['عتيق', 'عتيقة', 'style'],
  modern: ['عصري', 'عصرية', 'style'],
  stylish: ['عصري', 'عصرية', 'style'],
  luxury: ['فاخر', 'فاخرة', 'style'],
  premium: ['فاخر', 'فاخرة', 'style'],
  fancy: ['أنيق', 'أنيقة', 'style'],
  party: ['للحفلات', 'للحفلات', 'style'],
  evening: ['سهرة', 'سهرة', 'style'],
  summer: ['صيفي', 'صيفية', 'style'],
  winter: ['شتوي', 'شتوية', 'style'],
  check: ['كاروهات', 'كاروهات', 'style'],
  checked: ['كاروهات', 'كاروهات', 'style'],
  plaid: ['كاروهات', 'كاروهات', 'style'],
  tartan: ['كاروهات', 'كاروهات', 'style'],
  striped: ['مخطط', 'مخططة', 'style'],
  printed: ['مطبوع', 'مطبوعة', 'style'],
  floral: ['بنقشة زهور', 'بنقشة زهور', 'style'],
  tropical: ['استوائي', 'استوائية', 'style'],
  automatic: ['أوتوماتيكي', 'أوتوماتيكية', 'style'],
  small: ['صغير', 'صغيرة', 'style'],
  large: ['كبير', 'كبيرة', 'style'],
  big: ['كبير', 'كبيرة', 'style'],
  mini: ['صغير', 'صغيرة', 'style'],
  long: ['طويل', 'طويلة', 'style'],
  short: ['قصير', 'قصيرة', 'style'],
  sleeveless: ['بدون أكمام', 'بدون أكمام', 'style'],
  round: ['دائري', 'دائرية', 'style'],
  oval: ['بيضاوي', 'بيضاوية', 'style'],
  square: ['مربع', 'مربعة', 'style'],
  hand: ['يدوي', 'يدوية', 'style'],
  handmade: ['صناعة يدوية', 'صناعة يدوية', 'style'],
  waterproof: ['مقاوم للماء', 'مقاومة للماء', 'style'],
  portable: ['محمول', 'محمولة', 'style'],
  adjustable: ['قابل للتعديل', 'قابلة للتعديل', 'style'],
  new: ['جديد', 'جديدة', 'style'],
  pea: ['بازلائي', 'بازلائية', 'style'],
};

/** multi-word phrases, matched before single words */
const PHRASES = [
  { re: /\bshort sleeves?\b/i, ar: 'بأكمام قصيرة', post: true },
  { re: /\blong sleeves?\b/i, ar: 'بأكمام طويلة', post: true },
  { re: /\bsun ?glasses\b/i, noun: ['نظارة شمسية', 'f'] },
  { re: /\bnail polish\b/i, noun: ['طلاء أظافر', 'm'] },
  { re: /\bbody wash\b/i, noun: ['غسول الجسم', 'm'] },
  { re: /\beau de parfum\b/i, noun: ['ماء عطر', 'm'] },
  { re: /\beau de toilette\b/i, noun: ['ماء تواليت', 'm'] },
  { re: /\beau de\b/i, noun: ['ماء عطر', 'm'] },
  { re: /\bhand soap\b/i, noun: ['صابون اليدين', 'm'] },
  { re: /\bphoto frame\b/i, noun: ['إطار صور', 'm'] },
  { re: /\bplant pot\b/i, noun: ['أصيص نبات', 'm'] },
  { re: /\btable lamp\b/i, noun: ['مصباح طاولة', 'm'] },
  { re: /\bbedside table\b/i, noun: ['طاولة جانبية للسرير', 'f'] },
  { re: /\bconference chair\b/i, noun: ['كرسي اجتماعات', 'm'] },
  { re: /\bbathroom vanity\b/i, noun: ['تسريحة حمام', 'f'] },
  { re: /\bbody (?:and|&) face\b/i, ar: 'للجسم والوجه', post: true },
  { re: /\bshea butter\b/i, ar: 'بزبدة الشيا', post: true },
  { re: /\bultra moisture\b/i, ar: 'فائق الترطيب', post: true },
  { re: /\brolling pin\b/i, noun: ['نشابة', 'f'] },
  { re: /\bair jordan\b/i, keep: 'إير جوردان' },
  { re: /\boff white\b/i, color: 'off white' },
];

const STOP = new Set(['and', '&', 'with', 'for', 'of', 'the', 'a', 'an', 'in']);

/* ———————————————————————————— title engine ———————————————————————————— */

const TOKEN_RE = /[A-Za-z][A-Za-z'’-]*|\d+|[&]/g;

function classify(word) {
  const w = word.toLowerCase().replace(/’/g, "'");
  if (COLORS[w]) return { type: 'color', value: COLORS[w] };
  if (NOUNS[w]) return { type: 'noun', value: NOUNS[w] };
  if (ADJECTIVES[w]) return { type: 'adj', value: ADJECTIVES[w] };
  return { type: 'other', value: word };
}

function translateSegment(text) {
  // 1. phrases
  const post = [];
  const kept = new Map();
  let working = text;
  let phraseNoun = null;
  const phraseColors = [];
  PHRASES.forEach((phrase) => {
    const match = working.match(phrase.re);
    if (!match) return;
    working = working.replace(phrase.re, ' ');
    if (phrase.post) post.push(phrase.ar);
    else if (phrase.noun) phraseNoun = phrase.noun;
    else if (phrase.color) phraseColors.push(COLORS[phrase.color]);
    else if (phrase.keep) kept.set(match[0], phrase.keep);
  });

  const words = working.match(TOKEN_RE) ?? [];
  const classified = words.map(classify);

  const nouns = classified.filter((c) => c.type === 'noun');
  const head = phraseNoun ?? (nouns.length ? nouns[nouns.length - 1].value : null);
  const gender = head ? head[1] : 'm';
  const form = gender === 'f' ? 1 : 0;

  const audience = [];
  const forWhom = [];
  const styles = [];
  const materials = [];
  const colors = [...phraseColors.map((p) => p[form])];
  const others = [];
  const extraNouns = [];

  classified.forEach((c, index) => {
    if (c.type === 'noun') {
      // every noun except the head becomes an "of"-style attachment (e.g. "Corset Leather With Skirt")
      if (!phraseNoun && c === nouns[nouns.length - 1]) return;
      extraNouns.push(c.value[0]);
    } else if (c.type === 'color') colors.push(c.value[form]);
    else if (c.type === 'adj') {
      const [m, f, kind] = c.value;
      const text2 = form === 1 ? f : m;
      if (kind === 'audience') audience.push(text2);
      else if (kind === 'for') forWhom.push(text2);
      else if (kind === 'material') materials.push(text2);
      else styles.push(text2);
    } else if (!STOP.has(words[index].toLowerCase())) others.push(c.value);
  });

  kept.forEach((ar) => others.unshift(ar));

  if (!head) {
    // No recognisable noun: translate what we can, keep order, never invent a noun.
    const inOrder = classified.map((c) => {
      if (c.type === 'color') return c.value[0];
      if (c.type === 'adj') return c.value[0];
      if (c.type === 'noun') return c.value[0];
      return STOP.has(String(c.value).toLowerCase()) ? '' : c.value;
    });
    return { core: inOrder.filter(Boolean).join(' ').replace(/\s+و\s+/g, ' و'), others: [], hasHead: false };
  }

  const unique = (list) => [...new Set(list)];
  const colorText = colors.length ? unique(colors).join(' و') : '';
  const core = [
    head[0],
    ...unique(extraNouns),
    ...audience,
    ...unique(materials).reverse(),
    ...unique(styles).reverse(),
    colorText,
    ...post,
    ...forWhom,
  ]
    .filter(Boolean)
    .join(' ');
  return { core, others, hasHead: true };
}

/** Compose an Arabic product name from an English one. */
export function translateTitle(title, category) {
  const original = norm(title);
  if (!original) return original;
  if (OVERRIDES[original]) return OVERRIDES[original].title;
  if (CURATED[original]) return CURATED[original].title;

  const lead = matchLeadingBrand(original);
  const body = lead ? lead.rest.join(' ') : original;
  // "X with Y" → two noun phrases joined by "مع"; "Blue & Black" stays one colour group.
  const segments = body.split(/\s+with\s+/i).map((segment) => translateSegment(segment.replace(/\s+(?:&|and)\s+/gi, ' & ')));

  const first = segments[0];
  const rest = segments.slice(1).map((segment) => [segment.core, ...segment.others].filter(Boolean).join(' '));
  // brand sits right after the thing it names; unknown model words (Latin) follow the brand
  const head = [first?.core, lead?.ar, ...(first?.others ?? [])].filter(Boolean).join(' ');
  const result = [head, ...rest].filter(Boolean).join(' مع ').replace(/\s{2,}/g, ' ').trim();

  void category;
  // A title we could not understand at all is better left as the original.
  return /[\u0600-\u06FF]/.test(result) ? result : original;
}

/* ———————————————————————————— description / material ———————————————————————————— */

const CATEGORY_COPY = {
  beauty: 'تركيبة عملية بتغطية مميزة وثبات يدوم طوال اليوم، مصمّمة لتمنحكِ إطلالة متألقة.',
  fragrances: 'عطر بنفحات متوازنة وثبات ممتد يترك أثراً أنيقاً أينما حللت.',
  furniture: 'قطعة أثاث بتصميم متين وخطوط أنيقة تضيف دفئاً وفخامة إلى مساحتك.',
  'home-decoration': 'قطعة ديكور بلمسة راقية تمنح منزلك طابعاً هادئاً وأنيقاً.',
  'kitchen-accessories': 'أداة مطبخ عملية بجودة عالية وتصميم أنيق تسهّل التحضير والتقديم.',
  'mens-shirts': 'قصّة مريحة وخامة ناعمة تناسب الإطلالات اليومية والرسمية على حدٍّ سواء.',
  'mens-shoes': 'راحة تدوم طوال اليوم وتفاصيل متقنة وخامات متينة لإطلالة عملية أنيقة.',
  'mens-watches': 'تصميم كلاسيكي وتفاصيل دقيقة تكمل إطلالتك بأناقة هادئة.',
  'skin-care': 'عناية لطيفة على البشرة بتركيبة متوازنة ترطّب وتغذّي مع الاستخدام اليومي.',
  sunglasses: 'تصميم عصري وعدسات توفّر الحماية والراحة تحت أشعة الشمس.',
  tops: 'خامة مريحة وتصميم عصري يسهل تنسيقه في مختلف المناسبات.',
  'womens-bags': 'تصميم أنيق وتفاصيل متقنة تتّسع لأساسياتك وتكمل إطلالتك.',
  'womens-dresses': 'قصّة أنيقة وانسدال ناعم يمنحكِ إطلالة راقية في كل مناسبة.',
  'womens-jewellery': 'لمعة راقية وتفاصيل دقيقة تضيف لمسة من الفخامة إلى إطلالتك.',
  'womens-shoes': 'تصميم أنيق وراحة تدوم طوال اليوم لخطوة واثقة.',
  'womens-watches': 'تصميم رقيق وتفاصيل أنيقة تضيف لمسة راقية إلى معصمك.',
};
const DEFAULT_COPY = 'مصنوعة بعناية من خامات مختارة، بتصميم أنيق يدوم لسنوات.';

const TAGS = {
  beauty: 'جمال',
  mascara: 'ماسكارا',
  lipstick: 'أحمر شفاه',
  fragrance: 'عطور',
  perfumes: 'عطور',
  fragrances: 'عطور',
  skincare: 'عناية بالبشرة',
  'skin care': 'عناية بالبشرة',
  furniture: 'أثاث',
  'home decor': 'ديكور منزلي',
  'womens dresses': 'فساتين نسائية',
  'mens shirts': 'قمصان رجالية',
  'mens shoes': 'أحذية رجالية',
  'womens shoes': 'أحذية نسائية',
  'womens bags': 'حقائب نسائية',
  'womens jewellery': 'مجوهرات نسائية',
  'womens watches': 'ساعات نسائية',
  'mens watches': 'ساعات رجالية',
  sunglasses: 'نظارات شمسية',
  tops: 'قطع علوية',
  'evening dress': 'فستان سهرة',
  'formal wear': 'ملابس رسمية',
  clothing: 'ملابس',
  fashion: 'موضة',
  accessories: 'إكسسوارات',
  watches: 'ساعات',
  shoes: 'أحذية',
  bags: 'حقائب',
  jewellery: 'مجوهرات',
  silk: 'حرير',
  wool: 'صوف',
  leather: 'جلد',
  cotton: 'قطن',
  cashmere: 'كشمير',
};

export function translateTags(tags = []) {
  return tags.map((tag) => TAGS[key(tag)] ?? norm(tag)).filter(Boolean);
}

const MATERIALS = [
  [/100% mulberry silk/i, 'حرير التوت 100%'],
  [/mulberry silk/i, 'حرير التوت'],
  [/silk/i, 'حرير'],
  [/cashmere/i, 'كشمير'],
  [/leather/i, 'جلد'],
  [/suede/i, 'سويد'],
  [/wool/i, 'صوف'],
  [/cotton/i, 'قطن'],
  [/gold/i, 'ذهب'],
  [/silver/i, 'فضة'],
  [/steel/i, 'ستانلس ستيل'],
  [/copper/i, 'نحاس'],
  [/oak|wood/i, 'خشب'],
  [/ceramic|stoneware/i, 'سيراميك'],
  [/glass|crystal/i, 'زجاج'],
  [/pearl/i, 'لؤلؤ'],
  [/linen/i, 'كتان'],
  [/denim/i, 'جينز'],
];

/** "Details" line: translated tags when we have them, otherwise a neutral Arabic fallback. */
export function translateMaterial(material, tags) {
  const original = norm(material);
  if (!original || original === 'Premium materials') return 'خامات فاخرة مختارة بعناية';
  if (Array.isArray(tags) && tags.length) {
    const translated = translateTags(tags);
    if (translated.some((t) => /[\u0600-\u06FF]/.test(t))) return translated.join('، ');
  }
  const found = MATERIALS.filter(([re]) => re.test(original)).map(([, ar]) => ar);
  return found.length ? [...new Set(found)].join('، ') : original;
}

function buildDescription(product, titleAr, brandAr) {
  const copy = CATEGORY_COPY[product.category] ?? DEFAULT_COPY;
  const from = brandAr && !titleAr.includes(brandAr) && !/^LUXORA/i.test(product.brand ?? '') ? ` من ${brandAr}` : '';
  return `${titleAr}${from}. ${copy}`;
}

/* ———————————————————————————— statements (warranty, shipping, returns…) ———————————————————————————— */

// [singular, dual (genitive), plural 3–10, singular-accusative 11+]
const UNIT = {
  day: ['يوم', 'يومين', 'أيام', 'يوماً'],
  week: ['أسبوع', 'أسبوعين', 'أسابيع', 'أسبوعاً'],
  month: ['شهر', 'شهرين', 'أشهر', 'شهراً'],
  year: ['سنة', 'سنتين', 'سنوات', 'سنة'],
};

/** Counted noun with correct Arabic number agreement (1, 2, 3–10, 11+). */
function amount(n, unit) {
  const forms = UNIT[unit];
  if (!forms) return `${toArabicDigits(n)}`;
  if (n === 1) return forms[0];
  if (n === 2) return forms[1];
  if (n <= 10) return `${toArabicDigits(n)} ${forms[2]}`;
  return `${toArabicDigits(n)} ${forms[3]}`;
}

const normUnit = (u) => u.toLowerCase().replace(/s$/, '').replace('business ', '');

export function translateStatement(text) {
  const t = norm(text);
  if (!t) return t;
  let m;

  if ((m = t.match(/^(\d+)[- ](day|week|month|year)s? (?:return policy|returns?)$/i))) return `سياسة إرجاع لمدة ${amount(Number(m[1]), normUnit(m[2]))}`;
  if (/^no return policy$/i.test(t)) return 'لا يوجد إرجاع';
  if ((m = t.match(/^(\d+)[- ](day|week|month|year)s? warranty$/i))) return `ضمان لمدة ${amount(Number(m[1]), normUnit(m[2]))}`;
  if (/^lifetime warranty$/i.test(t)) return 'ضمان مدى الحياة';
  if (/^no warranty$/i.test(t)) return 'بدون ضمان';
  if ((m = t.match(/^ships in (\d+)\s*-\s*(\d+) (business )?(day|week|month)s?$/i))) {
    const forms = UNIT[normUnit(m[4])];
    const word = Number(m[2]) <= 2 ? forms[0] : forms[2];
    return `يُشحن خلال ${toArabicDigits(m[1])}–${toArabicDigits(m[2])} ${word}${m[3] ? ' عمل' : ''}`;
  }
  if ((m = t.match(/^ships in (\d+) (business )?(day|week|month|year)s?$/i))) return `يُشحن خلال ${amount(Number(m[1]), normUnit(m[3]))}${m[2] ? ' عمل' : ''}`;
  if (/^ships overnight$/i.test(t)) return 'يُشحن خلال الليل';
  if (/^ships in 24 hours$/i.test(t)) return 'يُشحن خلال ٢٤ ساعة';
  if (/^in stock$/i.test(t)) return 'متوفر';
  if (/^low stock$/i.test(t)) return 'كمية محدودة';
  if (/^out of stock$/i.test(t)) return 'غير متوفر';
  if (/^2-year house guarantee on craftsmanship$/i.test(t)) return 'ضمان الدار لمدة سنتين على جودة الصناعة';
  if (/^dispatched within 24 hours( from our regional atelier)?$/i.test(t)) return 'يُشحن خلال ٢٤ ساعة من الأتيليه الإقليمي';
  if (/^complimentary returns within 30 days$/i.test(t)) return 'إرجاع مجاني خلال ٣٠ يوماً';
  return t;
}

/* ———————————————————————————— review comments ———————————————————————————— */

const COMMENTS = {
  'very satisfied!': 'راضٍ جداً!',
  'highly impressed!': 'أنا معجب جداً!',
  'would buy again!': 'سأشتريه مرة أخرى!',
  'highly recommended!': 'أنصح به بشدة!',
  'great product!': 'منتج رائع!',
  'excellent quality!': 'جودة ممتازة!',
  'fast shipping!': 'شحن سريع!',
  'fast delivery!': 'توصيل سريع!',
  'very pleased!': 'سعيد جداً!',
  'very happy with my purchase!': 'سعيد جداً بمشترياتي!',
  'great value for money!': 'قيمة ممتازة مقابل السعر!',
  'awesome product!': 'منتج مذهل!',
  'works great!': 'يعمل بشكل رائع!',
  'poor quality!': 'جودة ضعيفة!',
  'not as described!': 'ليس كما هو موصوف!',
  'very unhappy with my purchase!': 'غير راضٍ إطلاقاً عن مشترياتي!',
  'not worth the price!': 'لا يستحق السعر!',
  'disappointing product!': 'منتج مخيّب للآمال!',
  'would not buy again!': 'لن أشتريه مرة أخرى!',
  'very disappointed!': 'أنا محبط جداً!',
  'terrible product!': 'منتج سيئ!',
  'verified review': 'مراجعة موثّقة',
  'luxora client': 'عميل لوكسورا',
};

export function translateComment(text) {
  const found = COMMENTS[key(text)];
  return found ?? norm(text);
}

/* ———————————————————————————— curated catalogue ———————————————————————————— */

const CURATED = {
  'Silk Column Midi Dress': {
    title: 'فستان ميدي عمودي من الحرير',
    description: 'قصّة مائلة تنساب حتى الأرض من حرير التوت الثقيل. سلسة على الجسد وحادّة عند الكتف — هذا هو تعريف الفخامة الهادئة.',
    material: 'حرير التوت 100%، بلمسة ساتان',
  },
  'Bias-Cut Slip Dress': {
    title: 'فستان سليب بقصّة مائلة',
    description: 'مقصوص بزاوية مائلة لانسدال سائل، ومنتهٍ بخياطة فرنسية رفيعة. ارتديه منفرداً أو فوق تريكو رقيق.',
    material: 'مزيج من الحرير والفسكوز',
  },
  'Wool Crepe Shift Dress': {
    title: 'فستان مستقيم من كريب الصوف',
    description: 'فستان بتصميم معماري من الصوف الخام المزدوج الوجه من مصنع عائلي في بييلا. متين وثقيل الوزن وواثق بهدوء.',
    material: 'كريب صوف إيطالي خام',
  },
  'Pleated Silk Tea Dress': {
    title: 'فستان شاي مطوي من الحرير',
    description: 'ثنيات سكّينية رفيعة تنساب من خصر برباط ذاتي وتلتقط الضوء مع كل حركة. بأزرار مغطّاة.',
    material: 'حرير جورجيت بطيّات يدوية',
  },
  'Structured Leather Tote': {
    title: 'حقيبة توت جلدية مهيكلة',
    description: 'حقيبة توت من النهار إلى المساء من جلد العجل المدبوغ نباتياً، مصقولة الحواف يدوياً ومبطّنة بالسويد. تزداد جمالاً مع الزمن.',
    material: 'جلد عجل مدبوغ نباتياً',
  },
  'Quilted Chain Shoulder Bag': {
    title: 'حقيبة كتف مبطّنة بسلسلة',
    description: 'جلد حمل مبطّن يدوياً مع سلسلة بالاديوم رفيعة. صغيرة بما يكفي لتبدو مدروسة، وكبيرة بما يكفي لكل الأساسيات.',
    material: 'جلد حمل، إكسسوارات بالاديوم',
  },
  'Woven Raffia Bucket Bag': {
    title: 'حقيبة باكيت من الرافيا المنسوجة',
    description: 'منسوجة يدوياً على مدى ثلاثة أيام في ورشة برتغالية. خفيفة ومهيكلة، ومصمّمة لأمسيات الصيف الطويلة.',
    material: 'رافيا منسوجة يدوياً بحواف جلدية',
  },
  '18k Gold Vermeil Chain': {
    title: 'سلسلة ذهب فيرميل عيار 18',
    description: 'سلسلة ثقيلة بحلقات متلاصقة وقفل كلابي، مطلية بالذهب عيار 18 على فضة إسترلينية معاد تدويرها. مضادة للحساسية ومصنوعة لتدوم.',
    material: 'ذهب فيرميل عيار 18 على فضة إسترلينية',
  },
  'Pearl Drop Earrings': {
    title: 'أقراط لؤلؤ متدلية',
    description: 'لآلئ باروكية من المياه العذبة معلّقة بسلك ذهبي مطروق يدوياً. لا يوجد زوجان متطابقان — وهذا هو المقصود.',
    material: 'لؤلؤ المياه العذبة، قواعد ذهب عيار 14',
  },
  'Sculpted Signet Ring': {
    title: 'خاتم ختم منحوت',
    description: 'خاتم ختم جريء بقبّة ناعمة مسبوك من الفضة المعاد تدويرها ومصقول يدوياً بلمسة ساتان. يمكن نقشه عند الطلب.',
    material: 'فضة إسترلينية معاد تدويرها',
  },
  'Leather Slingback Heel': {
    title: 'حذاء سلينغ باك بكعب جلدي',
    description: 'مُنجَز يدوياً في ماركي، بكعب منحوت 65 مم وحشوة داخلية جلدية مبطّنة لأيام العمل الحقيقية.',
    material: 'جلد نابا، نعل جلدي',
  },
  'Suede Ankle Boot': {
    title: 'بوت سويد للكاحل',
    description: 'بوت رشيق للكاحل من السويد الإيطالي المقاوم للماء، بكعب جلدي مرصوص وسحّاب داخلي أنيق.',
    material: 'سويد إيطالي، كعب جلدي مرصوص',
  },
  'Slim Case Leather Watch': {
    title: 'ساعة جلدية بعلبة رفيعة',
    description: 'علبة مصقولة بقطر 32 مم مع زجاج ياقوتي وحركة كوارتز سويسرية، على سوار جلد عجل مخيط يدوياً.',
    material: 'زجاج ياقوت، سوار جلد عجل',
  },
  'Egyptian Cotton Poplin Shirt': {
    title: 'قميص بوبلين من القطن المصري',
    description: 'مصنوع من قطن جيزة ثنائي الخيط بياقة ناعمة وأزرار من عرق اللؤلؤ. القميص الذي يحل كل شيء.',
    material: 'بوبلين قطن جيزة، خيط مزدوج 120',
  },
  'Silk-Blend Camp Collar Shirt': {
    title: 'قميص بياقة مفتوحة من مزيج الحرير',
    description: 'ياقة مفتوحة على طراز المعسكرات من مزيج حرير وقطن سائل. بقصّة مريحة عند الجسد لانسدال سهل غير متكلّف.',
    material: 'مزيج حرير وقطن، قصّة مريحة',
  },
  'Hand-Stitched Derby': {
    title: 'حذاء ديربي مخيط يدوياً',
    description: 'بخياطة غودييير ويلت ويدوية على قالب عمره 90 عاماً. قابل لتبديل النعل، ويصبح أجمل بعد خمس سنوات.',
    material: 'جلد بوكس كالف، خياطة غودييير',
  },
  'Suede Chelsea Boot': {
    title: 'بوت تشيلسي من السويد',
    description: 'بوت تشيلسي أنيق من سويد عجل كثيف بجانبين مطاطيين ونعل مبطّن بالجلد بخياطة بليك.',
    material: 'سويد عجل، جوانب مطاطية',
  },
  'Automatic Steel Watch': {
    title: 'ساعة أوتوماتيكية من الستانلس ستيل',
    description: 'علبة ستانلس ستيل بقطر 39 مم تضم حركة أوتوماتيكية سويسرية باحتياطي طاقة 72 ساعة. زجاج ياقوتي أمامي وخلفي.',
    material: 'ستانلس ستيل 316L، حركة أوتوماتيكية',
  },
  'Acetate Oversized Sunglasses': {
    title: 'نظارة شمسية أسيتات كبيرة',
    description: 'أسيتات إيطالي مصقول يدوياً بعدسات من الفئة 3 وجسر على شكل ثقب المفتاح. تأتي مع علبة جلدية.',
    material: 'أسيتات إيطالي، عدسات CR-39',
  },
  'Titanium Aviator Sunglasses': {
    title: 'نظارة شمسية أفياتور من التيتانيوم',
    description: 'نظارة أفياتور خفيفة كالريشة من بيتا تيتانيوم بعدسات مستقطبة ووسادات أنف سيليكون قابلة للتعديل.',
    material: 'إطار بيتا تيتانيوم، عدسات مستقطبة',
  },
  'Cashmere Ribbed Knit': {
    title: 'تريكو كشمير مضلّع',
    description: 'مغزول من كشمير منغولي درجة أولى بسماكة 12 — رقيق ودافئ وناعم بشكل لا يُصدّق على البشرة.',
    material: 'كشمير منغولي درجة أولى، 12 غيج',
  },
  'Silk Camisole': {
    title: 'كاميزول من الحرير',
    description: 'كاميزول من حرير 22 مومي مغسول بالرمل بأشرطة قابلة للتعديل وحافة مائلة نظيفة. يناسب الطبقات تحت كل شيء.',
    material: 'حرير 22 مومي مغسول بالرمل',
  },
  'Botanical Face Serum': {
    title: 'سيروم نباتي للوجه',
    description: 'سيروم خفيف معصور على البارد من السكوالان وزيت ثمر الورد وفيتامين C. خالٍ من العطور ومُختبَر من أطباء الجلد.',
    material: 'خلاصات نباتية معصورة على البارد، 30 مل',
  },
  'Oud & Amber Eau de Parfum': {
    title: 'ماء عطر عود وعنبر',
    description: 'عود مدخّن ملفوف بالعنبر وخيط من الزعفران. عميق وراتنجي وجذّاب بهدوء. 100 مل.',
    material: 'ماء عطر، 100 مل',
  },
  'Neroli & Vetiver Eau de Parfum': {
    title: 'ماء عطر نيرولي وفيتيفر',
    description: 'نيرولي تونسي مشرق فوق قاعدة فيتيفر هايتية جافة. يُحسّ كقميص أبيض، بأجمل معنى. 100 مل.',
    material: 'ماء عطر، 100 مل',
  },
  'Hydrating Rose Cream': {
    title: 'كريم الورد المرطّب',
    description: 'كريم غني بماء الورد الدمشقي والسيراميدات والسكوالان يرمّم حاجز البشرة طوال الليل.',
    material: 'ورد دمشقي، سيراميدات، 50 مل',
  },
  'Hand-Thrown Ceramic Vase': {
    title: 'مزهرية سيراميك مشغولة يدوياً',
    description: 'مشغولة على عجلة الفخار ومطلية بلمسة حجرية مطفأة ناعمة. تحمل كل قطعة بصمات صانعها.',
    material: 'خزف ستونوير، طلاء مطفأ',
  },
  'Copper Espresso Set': {
    title: 'طقم إسبريسو نحاسي',
    description: 'إبريق إسبريسو من النحاس المطروق مع أربعة فناجين مطابقة، مبطّن بالقصدير الآمن للطعام. صُنع ليُستخدم يومياً.',
    material: 'نحاس مطروق، مقابض نحاسية',
  },
  'Oak Lounge Chair': {
    title: 'كرسي استرخاء من خشب البلوط',
    description: 'كرسي استرخاء منخفض وسخي من خشب البلوط الأوروبي الصلب بمقعد من صوف البوكليه مفصّل يدوياً. صنعه نجّارون لا آلات.',
    material: 'بلوط أوروبي صلب، صوف بوكليه',
  },
};

/**
 * Hand-written translations for specific products of the live feed.
 * Add `'Exact English Title': { title, description?, material? }` — it wins over the engine.
 */
const OVERRIDES = {
  'Essence Mascara Lash Princess': {
    title: 'ماسكارا ليش برنسيس من إيسنس',
    description: 'ماسكارا شهيرة بتأثير الكثافة والتطويل، تمنحكِ رموشاً درامية بتركيبة تدوم طويلاً وخالية من القسوة على الحيوان.',
  },
  'Dress Pea': { title: 'فستان بازلائي' },
  'House Showpiece Plant': { title: 'نبتة ديكور للمنزل' },
  'Red Lipstick': { title: 'أحمر شفاه أحمر' },
  'Red Nail Polish': { title: 'طلاء أظافر أحمر' },
  'Powder Canister': { title: 'علبة بودرة' },
  'Eyeshadow Palette with Mirror': { title: 'باليت ظلال عيون مع مرآة' },
  'Calvin Klein CK One': { title: 'عطر كالفن كلاين سي كي ون' },
  'Chanel Coco Noir Eau De': { title: 'ماء عطر كوكو نوار من شانيل' },
  "Dior J'adore": { title: 'عطر جادور من ديور' },
  'Dolce Shine Eau de': { title: 'ماء عطر شاين من دولتشي' },
  'Gucci Bloom Eau de': { title: 'ماء عطر بلوم من غوتشي' },
  'Corset Leather With Skirt': { title: 'كورسيه جلدي مع تنورة' },
  'Corset With Black Skirt': { title: 'كورسيه مع تنورة سوداء' },
  'Marni Red & Black Suit': { title: 'بدلة حمراء وسوداء من مارني' },
  'Rolex Datejust': { title: 'ساعة رولكس داتجست' },
  'Rolex Submariner Watch': { title: 'ساعة رولكس سابمارينر' },
  'Rolex Cellini Date Black Dial': { title: 'ساعة رولكس سيليني ديت بميناء أسود' },
  'Rolex Cellini Moonphase': { title: 'ساعة رولكس سيليني مون فيز' },
  'IWC Ingenieur Automatic Steel': { title: 'ساعة آي دبليو سي إنجينير أوتوماتيكية من الستانلس ستيل' },
  'Longines Master Collection': { title: 'ساعة لونجين ماستر كوليكشن' },
  'Brown Leather Belt Watch': { title: 'ساعة بسوار حزام جلدي بني' },
  'Nike Baseball Cleats': { title: 'حذاء بيسبول من نايك' },
  'Nike Air Jordan 1 Red And Black': { title: 'نايك إير جوردان 1 أحمر وأسود' },
  'Puma Future Rider Trainers': { title: 'حذاء بوما فيوتشر رايدر الرياضي' },
  'Sports Sneakers Off White & Red': { title: 'حذاء رياضي أبيض عاجي وأحمر' },
  'Sports Sneakers Off White Red': { title: 'حذاء رياضي أبيض عاجي وأحمر' },
  'Gigabyte Aorus Men Tshirt': { title: 'تيشيرت رجالي غيغابايت أوروس' },
  'Calvin Klein Heel Shoes': { title: 'حذاء بكعب من كالفن كلاين' },
  'Heshe Women\'s Leather Bag': { title: 'حقيبة جلدية نسائية من هيشي' },
  'Prada Women Bag': { title: 'حقيبة نسائية من برادا' },
  'Pearl Necklace': { title: 'عقد لؤلؤ' },
  'Green Crystal Earring': { title: 'أقراط كريستال خضراء' },
  'Green Oval Earring': { title: 'أقراط بيضاوية خضراء' },
  'Tropical Earring': { title: 'أقراط استوائية' },
  'Annibale Colombo Bed': { title: 'سرير أنيبالي كولومبو' },
  'Annibale Colombo Sofa': { title: 'أريكة أنيبالي كولومبو' },
  'Bedside Table African Cherry': { title: 'طاولة جانبية من خشب الكرز الأفريقي' },
  'Knoll Saarinen Executive Conference Chair': { title: 'كرسي اجتماعات تنفيذي كنول سارينن' },
  'Wooden Bathroom Vanity': { title: 'تسريحة حمام خشبية' },
};

/* ———————————————————————————— public API ———————————————————————————— */

const cache = new WeakMap();

/**
 * Arabic view of a product-like object (catalogue product, cart line, order line, wishlist item).
 * Only text fields change; ids, prices, stock, colours (use `translateColor`) etc. stay untouched.
 * Never store the result — it is for display only.
 */
export function localizeProduct(product) {
  if (!product || typeof product !== 'object') return product;
  if (cache.has(product)) return cache.get(product);

  const curated = CURATED[product.title];
  const override = OVERRIDES[product.title];
  const brand = product.brand ? translateBrand(product.brand) : product.brand;
  const title = override?.title ?? curated?.title ?? translateTitle(product.title, product.category);

  const localized = {
    ...product,
    title,
    brand,
    ...(product.description !== undefined && {
      description: override?.description ?? curated?.description ?? buildDescription(product, title, brand),
    }),
    ...(product.material !== undefined && {
      material: override?.material ?? curated?.material ?? translateMaterial(product.material, product.tags),
    }),
    ...(product.warrantyInformation !== undefined && { warrantyInformation: translateStatement(product.warrantyInformation) }),
    ...(product.shippingInformation !== undefined && { shippingInformation: translateStatement(product.shippingInformation) }),
    ...(product.returnPolicy !== undefined && { returnPolicy: translateStatement(product.returnPolicy) }),
    ...(product.availabilityStatus !== undefined && { availabilityStatus: translateStatement(product.availabilityStatus) }),
    ...(Array.isArray(product.tags) && { tags: translateTags(product.tags) }),
    ...(Array.isArray(product.reviews) && {
      reviews: product.reviews.map((review) => localizeReview(review)),
    }),
  };

  cache.set(product, localized);
  return localized;
}

export function localizeReview(review) {
  if (!review || typeof review !== 'object') return review;
  return {
    ...review,
    title: review.title ? translateComment(review.title) : review.title,
    comment: review.comment ? translateComment(review.comment) : review.comment,
    reviewerName: review.reviewerName ? translateComment(review.reviewerName) : review.reviewerName,
  };
}

/** Search haystack covering both languages, so Arabic shoppers can search in Arabic. */
export function searchableText(product) {
  const ar = localizeProduct(product);
  return `${product.title} ${product.brand} ${product.category} ${(product.tags ?? []).join(' ')} ${ar.title} ${ar.brand} ${(ar.tags ?? []).join(' ')}`.toLowerCase();
}
