import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCartCount, selectCartCoupon, selectCartItems, selectCartSubtotal } from '../../features/cart/cartSlice';
import { selectCartDrawerOpen, setCartDrawerOpen } from '../../features/ui/uiSlice';
import { useI18n } from '../../hooks/useI18n';
import { computeCartTotals } from '../../utils/cart';
import { FREE_SHIPPING_THRESHOLD } from '../../utils/constants';
import { Button, Drawer, EmptyState, ProgressBar } from '../ui';
import { CartLineItem } from '../cart/CartLineItem';

/** Slide-over bag — always one click away from anywhere in the store. */
export function CartDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, formatPrice } = useI18n();

  const open = useAppSelector(selectCartDrawerOpen);
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const coupon = useAppSelector(selectCartCoupon);
  const { amountToFreeShipping, freeShippingApplied } = computeCartTotals(items, coupon, 0);

  const close = () => dispatch(setCartDrawerOpen(false));

  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <Drawer
      open={open}
      onClose={close}
      title={`${t('cart.title')} (${count})`}
      size="md"
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">{t('cart.subtotal')}</span>
              <span className="font-medium tabular-nums text-ink dark:text-cream">{formatPrice(subtotal)}</span>
            </div>

            <p className="text-xs text-muted">{t('cart.shippingNote')}</p>

            <div className="grid gap-2.5">
              <Button fullWidth onClick={() => go('/checkout')}>
                {t('cart.checkout')}
              </Button>
              <Button variant="subtle" fullWidth onClick={() => go('/cart')}>
                {t('cart.title')}
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          compact
          icon={ShoppingBag}
          title={t('cart.empty')}
          description={t('cart.emptyBody')}
          action={
            <Button variant="outline" size="sm" onClick={() => go('/shop')}>
              {t('common.continueShopping')}
            </Button>
          }
        />
      ) : (
        <>
          {!freeShippingApplied && (
            <div className="mb-5 border border-line bg-cream-soft p-4 dark:border-night-border dark:bg-night-card">
              <p className="flex items-center gap-2 text-xs text-ash dark:text-cream">
                <Truck className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                {t('cart.freeShippingProgress', { amount: formatPrice(amountToFreeShipping) })}
              </p>
              <ProgressBar value={subtotal} max={FREE_SHIPPING_THRESHOLD} tone="gold" className="mt-3" />
            </div>
          )}

          <div className="divide-y divide-line dark:divide-night-border">
            {items.map((item) => (
              <CartLineItem key={item.key} item={item} size="sm" onNavigate={close} />
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

export default CartDrawer;
