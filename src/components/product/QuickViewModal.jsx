import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addItem } from '../../features/cart/cartSlice';
import { selectIsWishlisted, toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { pushToast, setQuickViewProduct } from '../../features/ui/uiSlice';
import { selectQuickViewProduct } from '../../features/ui/uiSlice';
import { useI18n } from '../../hooks/useI18n';
import { Button, Modal, PriceWithFallback, QuantityStepper, Rating, StockIndicator } from '../ui';
import { IconButton } from '../ui/IconButton';
import { SmartImage } from '../common/SmartImage';
import { ColorPicker, SizePicker } from './VariantPicker';

/**
 * Quick view opened from any product card.
 * Reads the target product straight from the UI slice so it can be triggered
 * from anywhere without prop drilling.
 */
export function QuickViewModal() {
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectQuickViewProduct);
  const { t, localize } = useI18n();

  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});

  const isWishlisted = useAppSelector(selectIsWishlisted(product?.id ?? -1));

  // Reset the form whenever a different product is opened.
  useEffect(() => {
    if (!product) return;
    setColor(product.colors?.[0]?.name ?? null);
    setSize(null);
    setQuantity(1);
    setErrors({});
  }, [product]);

  const close = () => dispatch(setQuickViewProduct(null));

  if (!product) return null;

  const handleAdd = () => {
    const nextErrors = {};
    if (product.colors?.length && !color) nextErrors.color = t('product.selectColor');
    if (product.sizes?.length && !size) nextErrors.size = t('product.selectSize');

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      dispatch(pushToast({ type: 'warning', title: t('toast.selectionRequired') }));
      return;
    }

    dispatch(addItem({ product, quantity, color, size }));
    dispatch(pushToast({ type: 'success', title: t('toast.addedToCart'), message: localize(product).title }));
    close();
  };

  return (
    <Modal open={Boolean(product)} onClose={close} size="lg" hideClose>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-soft dark:bg-night-card">
          <SmartImage
            src={product.thumbnail || product.images?.[0]}
            alt={localize(product).title}
            prompt={`${product.title} luxury product photography, editorial still life`}
            wrapperClassName="h-full w-full"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-2xs uppercase tracking-wide text-muted">{localize(product).brand}</p>
          <h2 className="mt-2 font-display text-2xl font-normal leading-tight text-ink dark:text-cream">
            {localize(product).title}
          </h2>

          <div className="mt-3 flex items-center gap-4">
            <Rating value={product.rating} count={product.reviewCount} showValue />
            <StockIndicator stock={product.stock} />
          </div>

          <PriceWithFallback product={product} size="lg" className="mt-4" />

          <p className="prose-lux mt-4 line-clamp-3">{localize(product).description}</p>

          <div className="mt-6 space-y-5">
            <ColorPicker colors={product.colors} value={color} onChange={setColor} label={t('product.color')} error={errors.color} />
            <SizePicker sizes={product.sizes} value={size} onChange={setSize} label={t('product.size')} error={errors.size} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock || 99} label={t('product.quantity')} />

            <Button
              className="flex-1"
              icon={ShoppingBag}
              onClick={handleAdd}
              disabled={product.stock === 0}
              variant="primary"
            >
              {product.stock === 0 ? t('common.outOfStock') : t('common.addToCart')}
            </Button>

            <IconButton
              label={isWishlisted ? t('common.removeFromWishlist') : t('common.addToWishlist')}
              active={isWishlisted}
              onClick={() => {
                dispatch(toggleWishlist(product));
                dispatch(
                  pushToast({
                    type: 'success',
                    title: isWishlisted ? t('product.unwishlisted') : t('product.wishlisted'),
                  }),
                );
              }}
            >
              <Heart className={isWishlisted ? 'h-4.5 w-4.5 fill-danger text-danger' : 'h-4.5 w-4.5'} strokeWidth={1.5} />
            </IconButton>
          </div>

          <Link
            to={`/product/${product.id}`}
            onClick={close}
            className="link-underline mt-6 inline-flex w-fit items-center gap-2 text-2xs uppercase tracking-wide text-ink dark:text-cream"
          >
            {t('product.description')}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}

export default QuickViewModal;
