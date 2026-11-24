import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Seo } from '../components/common/Seo';
import { SmartImage } from '../components/common/SmartImage';
import { Breadcrumbs, Button, ConfirmDialog, EmptyState, IconButton, Price, Rating } from '../components/ui';
import { addItem } from '../features/cart/cartSlice';
import { pushToast } from '../features/ui/uiSlice';
import { clearWishlist, removeFromWishlist, selectWishlistItems } from '../features/wishlist/wishlistSlice';
import { useI18n } from '../hooks/useI18n';

/** A saved piece — image, quick facts and a move-to-bag action. */
function WishlistCard({ item, index, t, onRemove, onMove }) {
  const { localize } = useI18n();
  const outOfStock = item.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <Link
        to={`/product/${item.id}`}
        className="relative block overflow-hidden bg-cream-soft dark:bg-night-card"
        aria-label={localize(item).title}
      >
        <div className="relative aspect-[3/4] w-full">
          <SmartImage
            src={item.thumbnail}
            alt={localize(item).title}
            prompt={`${item.title} luxury product photography`}
            wrapperClassName="absolute inset-0 h-full w-full"
            className="transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.05]"
          />
        </div>
      </Link>

      <IconButton
        label={t('common.removeFromWishlist')}
        size="sm"
        onClick={() => onRemove(item)}
        className="absolute end-3 top-3 z-10 bg-white/85 backdrop-blur-md hover:bg-white dark:bg-night-card/85 dark:hover:bg-night-card"
      >
        <X className="h-4 w-4" />
      </IconButton>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-2xs uppercase tracking-wide text-muted">{localize(item).brand}</p>

        <h3 className="mt-1.5 text-sm font-medium leading-snug text-ink dark:text-cream">
          <Link to={`/product/${item.id}`} className="transition-colors hover:text-gold">
            {localize(item).title}
          </Link>
        </h3>

        <div className="mt-2">
          <Rating value={item.rating} count={item.reviewCount} size="xs" />
        </div>

        <div className="mt-2.5">
          <Price price={item.price} originalPrice={item.originalPrice} size="sm" />
        </div>

        <div className="mt-auto pt-5">
          {outOfStock ? (
            <span className="inline-flex w-full items-center justify-center border border-line px-4 py-2.5 text-2xs font-medium uppercase tracking-wide text-muted dark:border-night-border">
              {t('common.outOfStock')}
            </span>
          ) : (
            <Button variant="outline" size="sm" fullWidth icon={ShoppingBag} onClick={() => onMove(item)}>
              {t('wishlist.moveToCart')}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Saved products page. */
export function Wishlist() {
  const dispatch = useAppDispatch();
  const { t, localize } = useI18n();

  const items = useAppSelector(selectWishlistItems);
  const count = items.length;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleRemove = (item) => {
    dispatch(removeFromWishlist(item.id));
    dispatch(pushToast({ type: 'info', title: t('product.unwishlisted') }));
  };

  const handleMove = (item) => {
    dispatch(addItem({ product: item, quantity: 1, color: null, size: null }));
    dispatch(removeFromWishlist(item.id));
    dispatch(pushToast({ type: 'success', title: t('wishlist.moved'), message: localize(item).title }));
  };

  const handleClear = () => {
    dispatch(clearWishlist());
  };

  return (
    <>
      <Seo
        title={t('wishlist.title')}
        description="Your saved pieces — revisit the favourites you love and move them to your bag."
      />

      <div className="lux-container py-10 md:py-16">
        <Breadcrumbs items={[{ label: t('wishlist.title') }]} />

        <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 dark:border-night-border">
          <div>
            <p className="eyebrow">{t('eyebrow.savedPieces')}</p>
            <h1 className="display-title mt-3">{t('wishlist.title')}</h1>
            <p className="mt-2 text-sm text-muted">{t('wishlist.itemCount', { count })}</p>
          </div>

          {count > 0 && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="link-underline text-xs uppercase tracking-wide text-muted transition-colors hover:text-danger"
            >
              Clear wishlist
            </button>
          )}
        </header>

        {count === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <EmptyState
              icon={Heart}
              title={t('wishlist.empty')}
              description={t('wishlist.emptyBody')}
              action={
                <Button to="/shop" variant="outline">
                  {t('common.shopNow')}
                </Button>
              }
            />
          </motion.div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {items.map((item, index) => (
              <WishlistCard
                key={item.id}
                item={item}
                index={index}
                t={t}
                onRemove={handleRemove}
                onMove={handleMove}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleClear}
        title="Clear wishlist"
        description="Remove every saved piece from your wishlist? This cannot be undone."
        confirmLabel="Clear wishlist"
      />
    </>
  );
}

export default Wishlist;
