import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { removeItem, setQuantity } from '../../features/cart/cartSlice';
import { pushToast } from '../../features/ui/uiSlice';
import { useI18n } from '../../hooks/useI18n';
import { cn } from '../../utils/format';
import { SmartImage } from '../common/SmartImage';
import { QuantityStepper } from '../ui/QuantityStepper';
import { IconButton } from '../ui/IconButton';

/**
 * One cart row. Shared by the cart drawer and the full cart page so the
 * behaviour (quantity clamping, removal, stock limits) stays identical.
 */
export function CartLineItem({ item, onNavigate, size = 'md', className }) {
  const dispatch = useAppDispatch();
  const { t, formatPrice, localize, localizeColor } = useI18n();

  const handleRemove = () => {
    dispatch(removeItem(item.key));
    dispatch(pushToast({ type: 'info', title: t('toast.removedFromCart'), message: localize(item).title }));
  };

  const isCompact = size === 'sm';
  const view = localize(item);

  return (
    <article className={cn('flex gap-4 border-b border-line py-5 last:border-b-0 dark:border-night-border', className)}>
      <Link
        to={`/product/${item.id}`}
        onClick={onNavigate}
        className={cn('shrink-0 overflow-hidden bg-cream-soft dark:bg-night-card', isCompact ? 'h-24 w-20' : 'h-32 w-24')}
      >
        <SmartImage
          src={item.thumbnail}
          alt={view.title}
          prompt={`${item.title} luxury product photography`}
          wrapperClassName="h-full w-full"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs uppercase tracking-wide text-muted">{view.brand}</p>
            <h3 className="mt-1 text-sm font-medium leading-snug text-ink dark:text-cream">
              <Link to={`/product/${item.id}`} onClick={onNavigate} className="transition-colors hover:text-gold">
                {view.title}
              </Link>
            </h3>

            <dl className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {item.color && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">{t('product.color')}</dt>
                  <dd>{localizeColor(item.color)}</dd>
                </div>
              )}
              {item.size && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">{t('product.size')}</dt>
                  <dd>{t('product.size')} {item.size}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="shrink-0 text-end">
            <p className="text-sm font-medium tabular-nums text-ink dark:text-cream">
              {formatPrice(item.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="mt-0.5 text-2xs tabular-nums text-muted">{t('cart.each', { price: formatPrice(item.price) })}</p>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={item.stock || 99}
            label={t('product.quantity')}
            // Dispatch the exact quantity: typing "5" used to add just one (the handler only
            // knew "up" or "down" by one step).
            onChange={(quantity) => dispatch(setQuantity({ key: item.key, quantity }))}
          />

          <IconButton
            label={t('common.remove')}
            size="sm"
            onClick={handleRemove}
            className="text-muted hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

export default CartLineItem;
