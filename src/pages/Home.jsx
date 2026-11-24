import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Gift,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { useAppSelector } from '../app/hooks';
import { selectAllProducts, selectCatalogStatus } from '../features/products/productsSlice';
import { Button, SectionHeading } from '../components/ui';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGrid } from '../components/product/ProductGrid';
import { SmartImage } from '../components/common/SmartImage';
import { BannerArt } from '../components/banners/BannerArt';
import { Seo } from '../components/common/Seo';
import { useI18n } from '../hooks/useI18n';
import { ATELIER_PHOTOS, HERO_PHOTOS } from '../utils/bannerPhotos';
import { CATEGORY_META } from '../utils/constants';

const EASE = [0.22, 1, 0.36, 1];

const TILE_HUES = [18, 205, 30, 340];

const BENEFITS = [
  { icon: Truck, key: 'product.shipsIn' },
  { icon: RotateCcw, key: 'product.freeReturns' },
  { icon: ShieldCheck, key: 'product.authentic' },
  { icon: Gift, key: 'home.promo.eyebrow' },
];

/** Editorial section wrapper with a scroll-reveal. */
function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Home() {
  const { t, lang } = useI18n();
  const products = useAppSelector(selectAllProducts);
  const status = useAppSelector(selectCatalogStatus);

  const loading = (status === 'loading' || status === 'idle') && products.length === 0;
  const isAr = lang === 'ar';

  const bestSellers = useMemo(
    () => [...products].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)).slice(0, 8),
    [products],
  );

  const newArrivals = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.meta?.createdAt ?? 0) - new Date(a.meta?.createdAt ?? 0))
        .slice(0, 8),
    [products],
  );

  const trending = useMemo(
    () => [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 8),
    [products],
  );

  // The season's best-rated piece, presented in an arch frame beside the headline.
  const spotlight = useMemo(
    () => trending.find((item) => item.thumbnail || item.images?.[0]) ?? null,
    [trending],
  );

  // Three best-rated pieces from three different categories — real catalogue photography for the hero edit.
  const heroEdit = useMemo(() => {
    const seen = new Set();
    return [...products]
      .filter((item) => item.thumbnail || item.images?.[0])
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .filter((item) => (seen.has(item.category) ? false : seen.add(item.category)))
      .slice(0, 3);
  }, [products]);

  const featuredCollections = useMemo(() => {
    const preferred = ['womens-dresses', 'mens-shirts', 'womens-bags', 'fragrances', 'womens-jewellery', 'mens-watches'];
    const present = new Set(products.map((item) => item.category));
    const chosen = preferred.filter((slug) => present.size === 0 || present.has(slug));
    const list = (chosen.length >= 4 ? chosen : [...preferred]).slice(0, 4);
    return list.map((slug) => {
      // A real product picture from the category when we have one; artwork otherwise.
      const sample = products
        .filter((item) => item.category === slug)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
      return { slug, ...CATEGORY_META[slug], photo: sample?.images?.[0] ?? sample?.thumbnail ?? null };
    });
  }, [products]);

  const heroStats = [
    { value: '48', label: t('home.hero.stat1') },
    { value: '19', label: t('home.hero.stat2') },
    { value: '4.9', label: t('home.hero.stat3') },
  ];

  return (
    <>
      <Seo
        title="Quiet Luxury, Considered"
        description="LUXORA — a curated house of enduring pieces, crafted from the finest materials and made to be worn for decades, not seasons."
      />

      {/* ————————————————— Hero ————————————————— */}
      <section className="relative isolate overflow-hidden bg-ink text-cream">
        <div className="absolute inset-0">
          <BannerArt variant="hero" src={HERO_PHOTOS} alt="" priority imgClassName="object-[68%_22%]" />
          {/* Legibility: darken the text side (flips automatically in RTL) and the bottom edge */}
          <span
            className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-ink/5 rtl:bg-gradient-to-l"
            aria-hidden="true"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/25" aria-hidden="true" />
          <span className="absolute inset-0 grain" aria-hidden="true" />
        </div>

        <div className="lux-container relative flex min-h-[86vh] flex-col justify-end pb-16 pt-32 md:min-h-[92vh] md:pb-24">
          <div className="xl:max-w-[44rem]">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="max-w-3xl"
            >
              <p className="text-2xs font-medium uppercase tracking-eyebrow text-cream/70">
                <span className="me-3 inline-block h-px w-8 bg-gold align-middle" aria-hidden="true" />
                {t('home.hero.eyebrow')}
              </p>

              <h1 className="mt-6 font-display text-[clamp(2.5rem,5.6vw,5rem)] font-normal leading-[1] text-cream text-balance">
                {t('home.hero.title')}
              </h1>

              <p className="mt-7 max-w-xl text-base leading-relaxed text-cream/75 md:text-lg">
                {t('home.hero.subtitle')}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button to="/shop" variant="gold" size="lg" iconRight={ArrowRight}>
                  {t('home.hero.cta')}
                </Button>
                <Button to="/shop?collection=new" variant="outlineLight" size="lg" className="text-cream">
                  {t('home.hero.secondary')}
                </Button>
              </div>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-cream/15 pt-8"
            >
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-3xl text-cream md:text-4xl">{stat.value}</dt>
                  <dd className="mt-1.5 text-2xs uppercase tracking-wide text-cream/60">{stat.label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <HeroFeaturedCard product={spotlight} />
          <HeroEdit items={heroEdit} />
        </div>
      </section>

      {/* ————————————————— Benefits strip ————————————————— */}
      <section className="border-b border-line bg-cream-soft dark:border-night-border dark:bg-night-soft">
        <div className="lux-container">
          <ul className="grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x dark:divide-night-border">
            {BENEFITS.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-center gap-3 py-5 md:justify-center md:py-6">
                <Icon className="h-4.5 w-4.5 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-2xs uppercase tracking-wide text-ash dark:text-cream">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ————————————————— Featured collections ————————————————— */}
      <section className="section">
        <div className="lux-container">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.collections.eyebrow')}
              title={t('home.collections.title')}
              subtitle={t('home.collections.subtitle')}
              align="between"
              action={
                <Button to="/shop" variant="link" iconRight={ArrowRight} className="text-2xs uppercase tracking-wide">
                  {t('common.viewAll')}
                </Button>
              }
            />
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 md:mt-14 lg:grid-cols-4">
            {featuredCollections.map((collection, index) => (
              <Reveal key={collection.slug} delay={index * 0.06}>
                <Link
                  to={`/shop?category=${collection.slug}`}
                  className="group block"
                  aria-label={isAr ? collection.ar : collection.en}
                >
                  <div className="zoom-media relative aspect-[3/4] overflow-hidden bg-cream-soft dark:bg-night-card">
                    <BannerArt
                      variant="tile"
                      hue={TILE_HUES[index % TILE_HUES.length]}
                      src={collection.photo}
                      alt={isAr ? collection.ar : collection.en}
                      imgClassName="object-cover"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" aria-hidden="true" />

                    <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-5 sm:bottom-5 sm:gap-3">
                      <h3 className="font-display text-base font-normal leading-tight text-cream sm:text-xl">
                        {isAr ? collection.ar : collection.en}
                      </h3>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream/15 text-cream backdrop-blur-md transition-colors duration-300 group-hover:bg-gold group-hover:text-ink sm:h-9 sm:w-9">
                        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ————————————————— Best sellers ————————————————— */}
      <section className="section bg-cream-soft dark:bg-night-soft">
        <div className="lux-container">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.best.eyebrow')}
              title={t('home.best.title')}
              subtitle={t('home.best.subtitle')}
              align="between"
              action={
                <Button to="/shop" variant="outline" size="sm" iconRight={ArrowRight}>
                  {t('common.viewAll')}
                </Button>
              }
            />
          </Reveal>

          <div className="mt-14">
            <ProductGrid
              products={bestSellers}
              columns={4}
              loading={loading}
              skeletonCount={4}
              emptyState={null}
            />
          </div>
        </div>
      </section>

      {/* ————————————————— Promo / Atelier ————————————————— */}
      <section className="section">
        <div className="lux-container">
          <Reveal>
            <div className="grid items-stretch gap-0 overflow-hidden border border-line dark:border-night-border lg:grid-cols-[1fr_1.05fr]">
              <div className="relative min-h-[22rem] bg-cream-soft dark:bg-night-card lg:min-h-[34rem]">
                <BannerArt variant="atelier" src={ATELIER_PHOTOS} alt={t('home.promo.title')} imgClassName="object-[50%_35%]" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" aria-hidden="true" />

                <div className="absolute inset-x-5 bottom-14 flex items-center gap-3 bg-white/90 px-5 py-4 text-ink backdrop-blur-md dark:bg-night-card/90 dark:text-cream sm:inset-x-auto sm:start-8 sm:max-w-xs">
                  <MapPin className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <p className="text-2xs uppercase tracking-wide text-muted">{t('home.promo.locationLabel')}</p>
                    <p className="mt-0.5 text-sm font-medium">{t('home.promo.location')}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center bg-ink px-8 py-14 text-cream md:px-14 md:py-20">
                <p className="text-2xs font-medium uppercase tracking-eyebrow text-gold">{t('home.promo.eyebrow')}</p>
                <h2 className="mt-5 font-display text-3xl font-normal leading-tight text-cream md:text-4xl">
                  {t('home.promo.title')}
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70 md:text-base">
                  {t('home.promo.body')}
                </p>

                <ul className="mt-8 space-y-3.5">
                  {['home.promo.p1', 'home.promo.p2', 'home.promo.p3'].map((key) => (
                    <li key={key} className="flex items-start gap-3 text-sm text-cream/85">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold">
                        <Check className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                      </span>
                      {t(key)}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Button to="/shop" variant="gold" size="lg" icon={Sparkles}>
                    {t('home.promo.cta')}
                  </Button>
                  <Button to="/shop?collection=new" variant="outlineLight" size="lg" className="text-cream">
                    {t('home.hero.secondary')}
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————————————————— New arrivals ————————————————— */}
      <section className="section bg-cream-soft dark:bg-night-soft">
        <div className="lux-container">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.new.eyebrow')}
              title={t('home.new.title')}
              subtitle={t('home.new.subtitle')}
              align="between"
              action={
                <Button to="/shop?collection=new" variant="outline" size="sm" iconRight={ArrowRight}>
                  {t('common.viewAll')}
                </Button>
              }
            />
          </Reveal>

          <div className="mt-14">
            <ProductGrid
              products={newArrivals}
              columns={4}
              loading={loading}
              skeletonCount={4}
              emptyState={null}
            />
          </div>
        </div>
      </section>

      {/* ————————————————— Trending rail ————————————————— */}
      <section className="section">
        <div className="lux-container">
          <Reveal>
            <SectionHeading
              eyebrow={t('home.trending.eyebrow')}
              title={t('home.trending.title')}
              subtitle={t('home.trending.subtitle')}
              align="between"
            />
          </Reveal>

          <div className="mt-14">
            {loading ? (
              <ProductGrid loading columns={4} skeletonCount={4} />
            ) : (
              <div className="snap-rail no-scrollbar -mx-1 px-1">
                {trending.map((product, index) => (
                  <div key={product.id} className="w-[16rem] shrink-0 sm:w-[18rem]">
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ————————————————— Story ————————————————— */}
      <section className="section bg-ink text-cream">
        <div className="lux-container">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <p className="text-2xs font-medium uppercase tracking-eyebrow text-gold">{t('home.story.eyebrow')}</p>
              <h2 className="mt-5 font-display text-3xl font-normal leading-tight text-cream md:text-headline">
                {t('home.story.title')}
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/70 md:text-base">
                {t('home.story.body')}
              </p>
              <div className="mt-9">
                <Button to="/shop" variant="outlineLight" size="lg" className="text-cream">
                  {t('home.story.cta')}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <figure className="relative overflow-hidden border border-cream/15 bg-cream/5 p-10 md:p-14">
                <span className="pointer-events-none absolute -end-12 -top-4 h-56 w-40 rounded-t-full border border-gold/20" aria-hidden="true" />
                <span className="pointer-events-none absolute -end-6 top-2 h-52 w-28 rounded-t-full border border-gold/10" aria-hidden="true" />
                <Sparkles className="h-6 w-6 text-gold" strokeWidth={1.25} aria-hidden="true" />
                <blockquote className="mt-7 font-display text-2xl font-normal leading-snug text-cream md:text-3xl">
                  “{t('home.story.quote')}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 text-2xs uppercase tracking-wide text-cream/55">
                  <BadgeCheck className="h-4 w-4 text-gold" aria-hidden="true" />
                  LUXORA — Milano, est. 1994
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ————————————————— Newsletter ————————————————— */}
      <section className="section">
        <div className="lux-container">
          <Reveal>
            <NewsletterBanner />
          </Reveal>
        </div>
      </section>
    </>
  );
}

/**
 * "The edit": three arch-framed catalogue pieces on the hero's trailing side (xl and up).
 * Real product photography, so the banner always shows fashion — the satin photograph stays the backdrop.
 */
function HeroEdit({ items }) {
  const { t, formatPrice, localize } = useI18n();
  if (items.length < 3) return null;

  // Staggered heights give the trio a gallery rhythm instead of a rigid row.
  const offsets = ['mt-10', 'mt-0', 'mt-16'];

  return (
    // Centering is done with flex, not a translate class: framer-motion writes an inline `transform`
    // that would silently override any Tailwind translate utility.
    <div className="pointer-events-none absolute inset-y-0 end-8 hidden items-center pt-8 xl:flex">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
      className="pointer-events-auto"
      aria-label={t('home.hero.spotlight')}
    >
      <p className="mb-5 text-2xs font-medium uppercase tracking-eyebrow text-cream/70">
        <span className="me-3 inline-block h-px w-8 bg-gold align-middle" aria-hidden="true" />
        {t('home.hero.spotlight')}
      </p>

      <ul className="flex items-start gap-5">
        {items.map((item, index) => (
          <li key={item.id} className={offsets[index]}>
            <Link to={`/product/${item.id}`} className="group block w-[11.5rem]" aria-label={localize(item).title}>
              <span className="block rounded-t-full border border-cream/30 bg-cream/10 p-2 backdrop-blur-sm transition-colors duration-300 group-hover:border-gold/70">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-t-full bg-white">
                  <SmartImage
                    src={item.images?.[0] ?? item.thumbnail}
                    alt=""
                    wrapperClassName="h-full w-full"
                    className="h-full w-full object-contain p-3 transition-transform duration-700 ease-editorial group-hover:scale-105"
                  />
                </span>
              </span>
              <span className="mt-3 block truncate text-xs text-cream">{localize(item).title}</span>
              <span className="mt-0.5 block text-2xs tabular-nums tracking-wide text-cream/60">{formatPrice(item.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
    </div>
  );
}

/** Compact "piece of the season" card tucked into the hero's corner — the photograph stays the hero. */
function HeroFeaturedCard({ product }) {
  const { t, formatPrice, localize } = useI18n();
  if (!product) return null;
  const photo = product.thumbnail ?? product.images?.[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
      className="absolute bottom-10 end-4 hidden w-80 md:bottom-16 lg:block xl:hidden"
    >
      <Link
        to={`/product/${product.id}`}
        aria-label={`${t('home.hero.spotlight')}: ${localize(product).title}`}
        className="group flex items-stretch gap-4 border border-cream/20 bg-ink/55 p-3 backdrop-blur-md transition-colors duration-300 hover:border-gold/60 hover:bg-ink/70"
      >
        <span className="relative block h-24 w-20 shrink-0 overflow-hidden bg-cream-soft">
          <SmartImage
            src={photo}
            alt=""
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="text-2xs uppercase tracking-eyebrow text-gold">{t('home.hero.spotlight')}</span>
          <span className="mt-1.5 truncate text-sm text-cream">{localize(product).title}</span>
          <span className="mt-1 flex items-center justify-between gap-3 text-xs text-cream/70">
            <span className="tabular-nums">{formatPrice(product.price)}</span>
            <span className="flex items-center gap-1 uppercase tracking-wide text-cream transition-colors group-hover:text-gold">
              {t('home.hero.shopPiece')}
              <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
            </span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

/** Inline newsletter capture — validation only, no network call. */
function NewsletterBanner() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    setDone(true);
    setEmail('');
  };

  return (
    <div className="relative grid gap-10 overflow-hidden border border-line bg-cream-soft px-8 py-14 md:grid-cols-2 md:items-center md:px-16 md:py-20 dark:border-night-border dark:bg-night-soft">
      <span className="pointer-events-none absolute -end-16 -top-10 h-72 w-52 rounded-t-full border border-gold/25" aria-hidden="true" />
      <span className="pointer-events-none absolute -end-6 top-4 h-64 w-40 rounded-t-full border border-gold/15" aria-hidden="true" />
      <div>
        <p className="text-2xs font-medium uppercase tracking-eyebrow text-gold">{t('home.newsletter.eyebrow')}</p>
        <h2 className="mt-5 font-display text-3xl font-normal leading-tight text-ink dark:text-cream md:text-4xl">
          {t('home.newsletter.title')}
        </h2>
        <p className="prose-lux mt-5 max-w-md">{t('home.newsletter.body')}</p>
        <ul className="mt-7 space-y-2.5">
          {['home.newsletter.perk1', 'home.newsletter.perk2', 'home.newsletter.perk3'].map((key) => (
            <li key={key} className="flex items-center gap-3 text-sm text-ash dark:text-cream/85">
              <Check className="h-4 w-4 shrink-0 text-gold" strokeWidth={2} aria-hidden="true" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        {done ? (
          <p className="flex items-center gap-3 border border-success/30 bg-success/5 px-5 py-4 text-sm text-success">
            <BadgeCheck className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {t('home.newsletter.success')}
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">{t('auth.email')}</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('auth.email')}
                className="field"
              />
            </label>
            <Button type="submit" className="shrink-0">
              {t('home.newsletter.cta')}
            </Button>
          </form>
        )}
        <p className="mt-4 text-xs text-muted">{t('home.newsletter.privacy')}</p>
      </div>
    </div>
  );
}

export default Home;
