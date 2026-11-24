import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Heart,
  PackageX,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  ThumbsUp,
  Truck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addItem } from '../features/cart/cartSlice';
import { selectIsWishlisted, toggleWishlist } from '../features/wishlist/wishlistSlice';
import { setCartDrawerOpen, pushToast } from '../features/ui/uiSlice';
import { selectAllProducts, selectCatalogStatus, selectProductById } from '../features/products/productsSlice';
import {
  Accordion,
  Badge,
  Breadcrumbs,
  Button,
  EmptyState,
  Modal,
  PriceWithFallback,
  QuantityStepper,
  Rating,
  RatingInput,
  StockIndicator,
} from '../components/ui';
import { IconButton } from '../components/ui/IconButton';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductGrid } from '../components/product/ProductGrid';
import { ColorPicker, SizePicker } from '../components/product/VariantPicker';
import { ProductCard } from '../components/product/ProductCard';
import { Seo } from '../components/common/Seo';
import { useI18n } from '../hooks/useI18n';
import { addRecentlyViewed, getRecentlyViewed } from '../services/recentlyViewed';
import { CATEGORY_META } from '../utils/constants';
import { cn, formatDate, initials } from '../utils/format';

const EASE = [0.22, 1, 0.36, 1];

const BENEFITS = [
  { icon: Truck, key: 'product.shipsIn' },
  { icon: RotateCcw, key: 'product.freeReturns' },
  { icon: ShieldCheck, key: 'product.authentic' },
];

export function ProductDetails() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { t, lang, localize } = useI18n();

  const product = useAppSelector(selectProductById(id));
  const allProducts = useAppSelector(selectAllProducts);
  const status = useAppSelector(selectCatalogStatus);
  const isWishlisted = useAppSelector(selectIsWishlisted(product?.id ?? -1));

  const isAr = lang === 'ar';
  const loading = (status === 'loading' || status === 'idle') && !product;

  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Reset the selection whenever we navigate to a new product.
  useEffect(() => {
    if (!product) return;
    setColor(product.colors?.[0]?.name ?? null);
    setSize(null);
    setQuantity(1);
    setErrors({});
    setReviews(Array.isArray(product.reviews) ? product.reviews : []);
    dispatch(setCartDrawerOpen(false));
    addRecentlyViewed(product);
  }, [product, dispatch]);

  const categoryLabel = useMemo(() => {
    if (!product) return '';
    const meta = CATEGORY_META[product.category];
    return meta ? (isAr ? meta.ar : meta.en) : product.category;
  }, [product, isAr]);

  const related = useMemo(() => {
    if (!product) return [];
    const sameCategory = allProducts.filter(
      (item) => item.category === product.category && String(item.id) !== String(product.id),
    );
    const pool = sameCategory.length >= 4 ? sameCategory : allProducts.filter((item) => String(item.id) !== String(product.id));
    return pool.slice(0, 4);
  }, [allProducts, product]);

  const recentlyViewed = useMemo(() => {
    return getRecentlyViewed().filter((item) => String(item.id) !== String(id)).slice(0, 4);
  }, [id]);

  const ratingBreakdown = useMemo(() => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const bucket = Math.round(review.rating) || 5;
      if (buckets[bucket] !== undefined) buckets[bucket] += 1;
    });
    return buckets;
  }, [reviews]);

  // ————— Loading / not-found states —————
  if (loading) {
    return (
      <div className="lux-container py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="aspect-[4/5] w-full skeleton" aria-hidden="true" />
          <div className="space-y-5">
            <div className="skeleton h-3 w-24" aria-hidden="true" />
            <div className="skeleton h-10 w-3/4" aria-hidden="true" />
            <div className="skeleton h-4 w-32" aria-hidden="true" />
            <div className="skeleton h-8 w-40" aria-hidden="true" />
            <div className="skeleton h-24 w-full" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="lux-container py-20">
        <EmptyState
          icon={PackageX}
          title={t('state.notFound')}
          description={t('state.notFoundBody')}
          action={<Button to="/shop">{t('shop.title')}</Button>}
        />
      </div>
    );
  }

  const hasSizes = Boolean(product.sizes?.length);
  const isAvailable = product.stock > 0;

  const handleAddToBag = () => {
    const nextErrors = {};
    if (product.colors?.length && !color) nextErrors.color = t('product.selectColor');
    if (hasSizes && !size) nextErrors.size = t('product.selectSize');

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      dispatch(pushToast({ type: 'warning', title: t('toast.selectionRequired') }));
      return;
    }

    dispatch(addItem({ product, quantity, color, size }));
    dispatch(pushToast({ type: 'success', title: t('product.addedToBag'), message: localize(product).title }));
    dispatch(setCartDrawerOpen(true));
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    dispatch(
      pushToast({
        type: 'success',
        title: isWishlisted ? t('product.unwishlisted') : t('product.wishlisted'),
      }),
    );
  };

  // Display-only Arabic view of the product. Cart / wishlist dispatches keep using `product` (English).
  const view = localize(product);

  return (
    <>
      <Seo
        title={view.title}
        description={view.description?.slice(0, 155)}
        image={product.thumbnail}
        type="product"
      />

      <div className="lux-container py-8 md:py-12">
        <Breadcrumbs
          items={[
            { label: t('shop.title'), to: '/shop' },
            { label: categoryLabel, to: `/shop?category=${product.category}` },
            { label: view.title },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ————— Gallery ————— */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <ProductGallery images={product.images ?? [product.thumbnail]} title={view.title} />
          </motion.div>

          {/* ————— Buy box ————— */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-2xs uppercase tracking-wide text-muted">{view.brand}</p>
              <p className="text-2xs tabular-nums text-muted">
                {t('product.sku')} · {product.sku}
              </p>
            </div>

            <h1 className="mt-3 font-display text-3xl font-normal leading-tight text-ink dark:text-cream md:text-[2.5rem]">
              {view.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Rating value={product.rating} count={reviews.length || product.reviewCount} showValue size="md" />
              <StockIndicator stock={product.stock} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <PriceWithFallback product={product} size="xl" />
              {product.discountPercentage >= 15 && (
                <Badge tone="danger">{isAr ? `وفّر ${product.discountPercentage}%` : `Save ${product.discountPercentage}%`}</Badge>
              )}
            </div>

            <p className="prose-lux mt-6">{view.description}</p>

            {/* Variants */}
            <div className="mt-8 space-y-7">
              <ColorPicker
                colors={product.colors}
                value={color}
                onChange={(value) => {
                  setColor(value);
                  setErrors((current) => ({ ...current, color: undefined }));
                }}
                label={t('product.color')}
                error={errors.color}
              />

              {hasSizes && (
                <div>
                  <SizePicker
                    sizes={product.sizes}
                    value={size}
                    onChange={(value) => {
                      setSize(value);
                      setErrors((current) => ({ ...current, size: undefined }));
                    }}
                    label={t('product.size')}
                    error={errors.size}
                  />
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="link-underline mt-3 inline-flex items-center gap-2 text-2xs uppercase tracking-wide text-muted hover:text-ink dark:hover:text-cream"
                  >
                    <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('product.sizeGuide')}
                  </button>
                </div>
              )}
            </div>

            {/* Add to bag */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={product.stock || 99}
                label={t('product.quantity')}
              />
              <Button
                size="lg"
                className="flex-1"
                icon={ShoppingBag}
                onClick={handleAddToBag}
                disabled={!isAvailable}
              >
                {isAvailable ? t('common.addToCart') : t('common.outOfStock')}
              </Button>
              <IconButton
                size="iconSm"
                label={isWishlisted ? t('common.removeFromWishlist') : t('common.addToWishlist')}
                active={isWishlisted}
                onClick={handleWishlist}
                className="h-14 w-14"
              >
                <Heart className={cn('h-5 w-5', isWishlisted && 'fill-danger text-danger')} strokeWidth={1.5} />
              </IconButton>
            </div>

            {/* Benefits */}
            <ul className="mt-8 divide-y divide-line border-y border-line dark:divide-night-border dark:border-night-border">
              {BENEFITS.map(({ icon: Icon, key }) => (
                <li key={key} className="flex items-center gap-3 py-3.5 text-xs text-muted">
                  <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  {t(key)}
                </li>
              ))}
            </ul>

            {/* Detail accordion */}
            {/* The lead paragraph above already shows the description, so open "Details & care" first
                instead of repeating the same text twice in a row. */}
            <Accordion
              className="mt-4"
              defaultOpen={1}
              items={[
                { id: 'description', title: t('product.description'), content: view.description },
                {
                  id: 'details',
                  title: t('product.details'),
                  content: (
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                        {view.material}
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                        {isAr ? 'تنظيف جاف فقط. يُحفظ بعيداً عن أشعة الشمس المباشرة.' : 'Dry clean only. Store away from direct sunlight.'}
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                        {view.warrantyInformation}
                      </li>
                    </ul>
                  ),
                },
                {
                  id: 'specs',
                  title: t('product.specs'),
                  content: (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <SpecRow label={t('product.sku')} value={product.sku} />
                      <SpecRow label={t('shop.category')} value={categoryLabel} />
                      <SpecRow label={t('shop.brand')} value={view.brand} />
                      {product.weight && <SpecRow label={isAr ? 'الوزن' : 'Weight'} value={`${product.weight} ${isAr ? 'كجم' : 'kg'}`} />}
                      {product.dimensions && (
                        <SpecRow
                          label={isAr ? 'الأبعاد' : 'Dimensions'}
                          value={`${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} ${isAr ? 'سم' : 'cm'}`}
                        />
                      )}
                      <SpecRow label={t('shop.availability')} value={view.availabilityStatus} />
                    </dl>
                  ),
                },
                {
                  id: 'shipping',
                  title: t('product.shipping'),
                  content: (
                    <ul className="space-y-2">
                      <li>{view.shippingInformation}</li>
                      <li>{view.returnPolicy}</li>
                      <li>{t('product.shipsIn')} · {t('product.freeReturns')}</li>
                    </ul>
                  ),
                },
              ]}
            />
          </motion.div>
        </div>

        {/* ————— Reviews ————— */}
        <section className="mt-20 border-t border-line pt-14 dark:border-night-border md:mt-28">
          <div className="grid gap-12 lg:grid-cols-[20rem_1fr] lg:gap-16">
            {/* Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="eyebrow">{t('product.reviews')}</p>
              <div className="mt-5 flex items-end gap-4">
                <span className="font-display text-5xl text-ink dark:text-cream">{product.rating.toFixed(1)}</span>
                <div className="pb-1.5">
                  <Rating value={product.rating} size="md" />
                  <p className="mt-1 text-xs text-muted">
                    {reviews.length || product.reviewCount} {t('common.reviews')}
                  </p>
                </div>
              </div>

              <ul className="mt-7 space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const total = reviews.length || 1;
                  const pct = Math.round(((ratingBreakdown[star] ?? 0) / total) * 100);
                  return (
                    <li key={star} className="flex items-center gap-3 text-xs text-muted">
                      <span className="w-8 shrink-0 tabular-nums">{star} ★</span>
                      <span className="h-1.5 flex-1 overflow-hidden bg-line dark:bg-night-border">
                        <span className="block h-full bg-gold" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-8 shrink-0 text-end tabular-nums">{pct}%</span>
                    </li>
                  );
                })}
              </ul>

              <WriteReview
                onSubmit={(review) => setReviews((current) => [review, ...current])}
              />
            </div>

            {/* Review list */}
            <div>
              {reviews.length === 0 ? (
                <EmptyState
                  compact
                  icon={ThumbsUp}
                  title={t('product.reviews')}
                  description={t('product.writeReview')}
                />
              ) : (
                <ul className="divide-y divide-line dark:divide-night-border">
                  {reviews.map((review, index) => (
                    <ReviewRow key={review.id ?? index} review={review} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ————— Related ————— */}
        {related.length > 0 && (
          <section className="mt-20 md:mt-28">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-6 dark:border-night-border">
              <h2 className="display-title text-title">{t('product.related')}</h2>
              <Button to={`/shop?category=${product.category}`} variant="link" iconRight={ArrowRight} className="text-2xs uppercase tracking-wide">
                {t('common.viewAll')}
              </Button>
            </div>
            <div className="mt-10">
              <ProductGrid products={related} columns={4} />
            </div>
          </section>
        )}

        {/* ————— Recently viewed ————— */}
        {recentlyViewed.length > 0 && (
          <section className="mt-20 md:mt-28">
            <h2 className="display-title text-title">{t('product.recentlyViewed')}</h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
              {recentlyViewed.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ————— Size guide ————— */}
      <Modal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} title={t('product.sizeGuide')} size="md">
        <p className="prose-lux mb-6">
          {isAr
            ? 'قياسات إرشادية بالسنتيمتر. لخياطة حسب المقاس، تواصل مع أتيليه الدار.'
            : 'Indicative measurements in centimetres. For made-to-measure, contact the house atelier.'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-start text-2xs uppercase tracking-wide text-muted dark:border-night-border">
                <th className="py-3 text-start font-medium">{t('product.size')}</th>
                <th className="py-3 text-start font-medium">{isAr ? 'الصدر' : 'Bust'}</th>
                <th className="py-3 text-start font-medium">{isAr ? 'الخصر' : 'Waist'}</th>
                <th className="py-3 text-start font-medium">{isAr ? 'الأرداف' : 'Hips'}</th>
              </tr>
            </thead>
            <tbody className="tabular-nums text-ash dark:text-cream">
              {[
                ['XS', 80, 62, 86],
                ['S', 84, 66, 90],
                ['M', 88, 70, 94],
                ['L', 94, 76, 100],
                ['XL', 100, 82, 106],
                ['XXL', 106, 88, 112],
              ].map(([label, bust, waist, hips]) => (
                <tr key={label} className="border-b border-line/70 dark:border-night-border/70">
                  <td className="py-3">{label}</td>
                  <td className="py-3">{bust}</td>
                  <td className="py-3">{waist}</td>
                  <td className="py-3">{hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}

function SpecRow({ label, value }) {
  return (
    <div>
      <dt className="text-2xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ash dark:text-cream">{value}</dd>
    </div>
  );
}

/** A single customer review row. */
function ReviewRow({ review: rawReview }) {
  const { t, localizeReview } = useI18n();
  const review = localizeReview(rawReview);
  const [helpful, setHelpful] = useState(review.helpful ?? 0);
  const [voted, setVoted] = useState(false);

  return (
    <li className="py-7">
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream-soft text-xs font-medium text-ink dark:border-night-border dark:bg-night-card dark:text-cream">
          {initials(review.reviewerName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-ink dark:text-cream">{review.reviewerName}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-2xs uppercase tracking-wide text-success">
                <Check className="h-3 w-3" aria-hidden="true" />
                {t('product.verified')}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <Rating value={review.rating} size="xs" />
            <span className="text-xs text-muted">{formatDate(review.date)}</span>
          </div>
        </div>
      </div>

      {review.title && <p className="mt-4 text-sm font-medium text-ink dark:text-cream">{review.title}</p>}
      <p className="mt-2 text-sm leading-relaxed text-muted">{review.comment}</p>

      <button
        type="button"
        disabled={voted}
        onClick={() => {
          setHelpful((count) => count + 1);
          setVoted(true);
        }}
        className={cn(
          'mt-4 inline-flex items-center gap-2 text-2xs uppercase tracking-wide transition-colors',
          voted ? 'text-success' : 'text-muted hover:text-ink dark:hover:text-cream',
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
        {t('product.helpful')} ({helpful})
      </button>
    </li>
  );
}

/** Inline review composer — validation is local, no network call. */
function WriteReview({ onSubmit }) {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  if (!open) {
    return (
      <Button variant="outline" fullWidth className="mt-8" onClick={() => setOpen(true)}>
        {t('product.writeReview')}
      </Button>
    );
  }

  const submit = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    onSubmit({
      id: `local-${Date.now()}`,
      rating,
      title: title.trim() || (isAr ? 'تقييم موثّق' : 'Verified review'),
      comment: comment.trim(),
      date: new Date().toISOString(),
      reviewerName: name.trim() || (isAr ? 'عميل LUXORA' : 'LUXORA client'),
      verified: true,
      helpful: 0,
    });
    setOpen(false);
    setName('');
    setTitle('');
    setComment('');
    setRating(5);
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 border border-line p-5 dark:border-night-border">
      <div>
        <span className="field-label">{t('common.rating')}</span>
        <RatingInput value={rating} onChange={setRating} label={t('common.rating')} />
      </div>

      <label className="block">
        <span className="field-label">{t('auth.firstName')}</span>
        <input value={name} onChange={(event) => setName(event.target.value)} className="field" placeholder={isAr ? 'اسمك' : 'Your name'} />
      </label>

      <label className="block">
        <span className="field-label">{t('product.reviews')}</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="field"
          placeholder={isAr ? 'عنوان التقييم' : 'Review title'}
        />
      </label>

      <label className="block">
        <span className="field-label">{t('checkout.notes')}</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          required
          className="field h-auto resize-none py-3"
          placeholder={isAr ? 'شاركنا رأيك…' : 'Share your thoughts…'}
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm">
          {t('product.writeReview')}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}

export default ProductDetails;
