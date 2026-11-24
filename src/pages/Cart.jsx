import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, ShieldCheck, ShoppingBag, Truck, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { CartLineItem } from '../components/cart/CartLineItem';
import { Seo } from '../components/common/Seo';
import { Breadcrumbs, Button, ConfirmDialog, EmptyState, IconButton, Input, ProgressBar } from '../components/ui';
import {
  applyCouponCode,
  clearCart,
  removeCoupon,
  selectCartCount,
  selectCartCoupon,
  selectCartItems,
} from '../features/cart/cartSlice';
import { pushToast } from '../features/ui/uiSlice';
import { useI18n } from '../hooks/useI18n';
import { computeCartTotals, resolveCoupon } from '../utils/cart';
import { COUPONS, FREE_SHIPPING_THRESHOLD } from '../utils/constants';
import { cn } from '../utils/format';

const BENEFITS = [
  { icon: Truck, key: 'product.shipsIn' },
  { icon: RotateCcw, key: 'product.freeReturns' },
  { icon: ShieldCheck, key: 'product.authentic' },
];

/** Full shopping bag page — line items, promotional codes and an order summary. */
export function Cart() {
  const dispatch = useAppDispatch();
  const { t, formatPrice } = useI18n();

  const items = useAppSelector(selectCartItems);
  const coupon = useAppSelector(selectCartCoupon);
  const count = useAppSelector(selectCartCount);

  const [couponValue, setCouponValue] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totals = useMemo(() => computeCartTotals(items, coupon, 0), [items, coupon]);

  const applyCode = (raw) => {
    const value = String(raw ?? '').trim();
    if (!value) return;
    const resolved = resolveCoupon(value);
    if (!resolved) {
      dispatch(pushToast({ type: 'error', title: t('cart.couponInvalid') }));
      return;
    }
    dispatch(applyCouponCode(value));
    setCouponValue('');
    dispatch(pushToast({ type: 'success', title: t('toast.couponApplied', { code: resolved.code }) }));
  };

  const handleSubmitCoupon = (event) => {
    event.preventDefault();
    applyCode(couponValue);
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    dispatch(pushToast({ type: 'info', title: t('cart.couponRemoved') }));
  };

  const handleClear = () => {
    dispatch(clearCart());
    dispatch(pushToast({ type: 'info', title: t('toast.cartCleared') }));
  };

  return (
    <>
      <Seo
        title={t('cart.title')}
        description="Review the pieces in your bag, apply a promotional code and proceed to a secure checkout."
      />

      <div className="lux-container py-10 md:py-16">
        <Breadcrumbs items={[{ label: t('cart.title') }]} />

        <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 dark:border-night-border">
          <div>
            <p className="eyebrow">{t('eyebrow.yourBag')}</p>
            <h1 className="display-title mt-3">{t('cart.title')}</h1>
            <p className="mt-2 text-sm text-muted">{t('cart.itemCount', { count })}</p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="link-underline text-xs uppercase tracking-wide text-muted transition-colors hover:text-danger"
            >
              {t('cart.clear')}
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <EmptyState
              icon={ShoppingBag}
              title={t('cart.empty')}
              description={t('cart.emptyBody')}
              action={
                <Button to="/shop" variant="outline">
                  {t('common.continueShopping')}
                </Button>
              }
            />
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
            {/* Line items */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              aria-label={t('cart.title')}
            >
              <div className="border-t border-line dark:border-night-border">
                {/* The old "Product / Quantity / Total" header row was English-only and its columns
                    didn't line up with the stacked line items, so it was removed. */}
                {items.map((item) => (
                  <CartLineItem key={item.key} item={item} />
                ))}
              </div>
            </motion.section>

            {/* Summary */}
            <motion.aside
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-24 lg:w-[22rem] lg:self-start"
              aria-label={t('checkout.summary')}
            >
              <div className="border border-line bg-cream-soft/50 p-6 dark:border-night-border dark:bg-night-card">
                <h2 className="font-display text-lg font-normal text-ink dark:text-cream">{t('checkout.summary')}</h2>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">{t('cart.subtotal')}</dt>
                    <dd className="tabular-nums text-ash dark:text-cream">{formatPrice(totals.subtotal)}</dd>
                  </div>

                  {totals.discount > 0 && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted">
                        {t('cart.discount')}
                        {coupon ? ` · ${coupon.code}` : ''}
                      </dt>
                      <dd className="tabular-nums text-success">−{formatPrice(totals.discount)}</dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <dt className="text-muted">{t('cart.shipping')}</dt>
                    <dd
                      className={cn(
                        'tabular-nums',
                        totals.freeShippingApplied ? 'text-success' : 'text-ash dark:text-cream',
                      )}
                    >
                      {totals.freeShippingApplied ? t('cart.free') : t('cart.calculatedAtCheckout')}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-muted">{t('cart.tax')}</dt>
                    <dd className="tabular-nums text-ash dark:text-cream">{formatPrice(totals.tax)}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5 dark:border-night-border">
                  <span className="text-sm font-medium uppercase tracking-wide text-ink dark:text-cream">
                    {t('cart.total')}
                  </span>
                  <span className="text-lg font-medium tabular-nums text-ink dark:text-cream">
                    {formatPrice(totals.total)}
                  </span>
                </div>

                {/* Coupon */}
                {coupon ? (
                  <div className="mt-6 border border-line bg-white p-4 dark:border-night-border dark:bg-night-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-2xs uppercase tracking-wide text-muted">{t('cart.coupon')}</p>
                        <p className="mt-1 text-sm font-medium text-ink dark:text-cream">{coupon.code}</p>
                        {coupon.label && <p className="mt-0.5 text-xs text-muted">{coupon.label}</p>}
                      </div>
                      <IconButton
                        label={t('common.remove')}
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="shrink-0 text-muted hover:text-danger"
                      >
                        <X className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitCoupon} className="mt-6 space-y-3">
                    <div className="flex items-end gap-2">
                      <Input
                        name="coupon"
                        label={t('cart.coupon')}
                        placeholder={t('cart.couponPlaceholder')}
                        value={couponValue}
                        autoComplete="off"
                        onChange={(event) => setCouponValue(event.target.value)}
                      />
                      <Button type="submit" variant="subtle" className="shrink-0">
                        {t('common.apply')}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Object.keys(COUPONS).map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => applyCode(code)}
                          className="border border-line px-2.5 py-1 text-2xs uppercase tracking-wide text-muted transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:hover:border-cream/50 dark:hover:text-cream"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </form>
                )}

                {/* Free shipping progress */}
                {!totals.freeShippingApplied && (
                  <div className="mt-6 border-t border-line pt-5 dark:border-night-border">
                    <p className="flex items-start gap-2 text-xs text-ash dark:text-cream">
                      <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                      {t('cart.freeShippingProgress', { amount: formatPrice(totals.amountToFreeShipping) })}
                    </p>
                    <ProgressBar value={totals.subtotal} max={FREE_SHIPPING_THRESHOLD} tone="gold" className="mt-3" />
                  </div>
                )}

                {/* Call to action */}
                <div className="mt-6 space-y-4">
                  <Button to="/checkout" fullWidth>
                    {t('cart.checkout')}
                  </Button>
                  <Link
                    to="/shop"
                    className="link-underline mx-auto block w-fit text-xs uppercase tracking-wide text-muted transition-colors hover:text-ink dark:hover:text-cream"
                  >
                    {t('common.continueShopping')}
                  </Link>
                </div>
              </div>

              {/* Trust strip */}
              <ul className="mt-6 divide-y divide-line border border-line bg-white dark:divide-night-border dark:border-night-border dark:bg-night-soft">
                {BENEFITS.map(({ icon: Icon, key }) => (
                  <li key={key} className="flex items-center gap-3 px-4 py-3 text-xs text-muted">
                    <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </motion.aside>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleClear}
        title={t('cart.clear')}
        description="Remove every piece from your bag? This cannot be undone."
        confirmLabel={t('cart.clear')}
      />
    </>
  );
}

export default Cart;
