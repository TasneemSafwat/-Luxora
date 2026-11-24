import { memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addItem } from '../../features/cart/cartSlice';
import { selectIsWishlisted, toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { pushToast, setQuickViewProduct } from '../../features/ui/uiSlice';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';
import { ProductFlag, PriceWithFallback, Rating } from '../ui';
import { IconButton } from '../ui/IconButton';
import { SmartImage } from '../common/SmartImage';

/**
 * The catalogue's primary visual unit.
 * Memoised — the grid can render dozens of these and only re-renders the card
 * whose wishlist state actually changed.
 */
function ProductCardBase({ product, priority = false, className, index = 0 }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, localize } = useI18n();
  const isWishlisted = useAppSelector(selectIsWishlisted(product.id));
  // Display-only Arabic view; dispatches below keep using the original (English) product.
  const view = localize(product);

  const primaryImage = product.thumbnail || product.images?.[0];
  const hoverImage = product.images?.[1] || primaryImage;
  const hasVariants = Boolean(product.sizes?.length);
  const isAvailable = product.stock > 0;

  const handleWishlist = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      dispatch(toggleWishlist(product));
      dispatch(
        pushToast({
          type: 'success',
          title: isWishlisted ? t('product.unwishlisted') : t('product.wishlisted'),
        }),
      );
    },
    [dispatch, product, isWishlisted, t],
  );

  const handleQuickView = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      dispatch(setQuickViewProduct(product));
    },
    [dispatch, product],
  );

  const handleAdd = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (hasVariants) {
        navigate(`/product/${product.id}`);
        return;
      }
      dispatch(addItem({ product, quantity: 1, color: product.colors?.[0]?.name ?? null }));
      dispatch(pushToast({ type: 'success', title: t('toast.addedToCart'), message: view.title }));
    },
    [dispatch, navigate, product, hasVariants, t, view.title],
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn('group relative flex flex-col', className)}
    >
      {/*
        The image link and the action buttons are siblings. They used to be nested
        inside one <a>, which is invalid HTML (interactive content inside a link) and
        confuses keyboard + screen-reader users.
      */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-cream-soft dark:bg-night-card">
        <Link to={`/product/${product.id}`} className="absolute inset-0 block" aria-label={view.title}>
          <SmartImage
            src={primaryImage}
            alt={view.title}
            prompt={`${product.title} luxury product photography, neutral warm studio backdrop, editorial still life`}
            loading={priority ? 'eager' : 'lazy'}
            wrapperClassName="absolute inset-0 h-full w-full"
            className="transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.05]"
          />

          {/* Secondary image crossfade */}
          {hoverImage !== primaryImage && (
            <SmartImage
              src={hoverImage}
              alt=""
              aria-hidden="true"
              prompt={`${product.title} alternate angle, luxury editorial photography`}
              wrapperClassName="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ease-editorial group-hover:opacity-100"
            />
          )}
        </Link>

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
            <ProductFlag product={product} />
            <IconButton
              label={isWishlisted ? t('common.removeFromWishlist') : t('common.addToWishlist')}
              size="sm"
              active={isWishlisted}
              onClick={handleWishlist}
              className="pointer-events-auto bg-white/85 backdrop-blur-md hover:bg-white dark:bg-night-card/85 dark:hover:bg-night-card"
            >
              <Heart className={cn('h-4 w-4', isWishlisted && 'fill-danger text-danger')} strokeWidth={1.5} />
            </IconButton>
          </div>

          {/* Quick actions */}
          <div className="absolute inset-x-3.5 bottom-3.5 flex translate-y-3 gap-2 opacity-0 transition-all duration-400 ease-editorial focus-within:translate-y-0 focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:justify-end max-md:opacity-100">
            <button
              type="button"
              onClick={handleQuickView}
              aria-label={t('common.quickView')}
              className="flex h-10 flex-1 items-center justify-center gap-2 bg-white/92 text-2xs font-medium uppercase tracking-wide text-ink backdrop-blur-md transition-colors hover:bg-white max-md:hidden dark:bg-night-card/92 dark:text-cream dark:hover:bg-night-card"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {t('common.quickView')}
            </button>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!isAvailable}
              aria-label={t('common.addToCart')}
              className="flex h-10 w-12 items-center justify-center bg-ink text-white transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:bg-cream dark:text-ink dark:hover:bg-gold/90"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-2xs uppercase tracking-wide text-muted">{view.brand}</p>

        <h3 className="mt-1.5 text-sm font-medium leading-snug text-ink dark:text-cream">
          <Link to={`/product/${product.id}`} className="transition-colors hover:text-gold">
            {view.title}
          </Link>
        </h3>

        <div className="mt-2 flex items-center gap-3">
          <Rating value={product.rating} count={product.reviewCount} size="xs" />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <PriceWithFallback product={product} size="sm" />

          {product.colors?.length > 0 && (
            <div className="flex items-center gap-1.5" aria-label={t('product.color')}>
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  className="h-3 w-3 rounded-full border border-line dark:border-night-border"
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export const ProductCard = memo(ProductCardBase);
export default ProductCard;
