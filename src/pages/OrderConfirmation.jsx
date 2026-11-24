import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, PackageX } from 'lucide-react';
import { Seo } from '../components/common/Seo';
import { SmartImage } from '../components/common/SmartImage';
import { Badge, Button, EmptyState } from '../components/ui';
import { useAppSelector } from '../app/hooks';
import { selectOrderById } from '../features/orders/ordersSlice';
import { useI18n } from '../hooks/useI18n';
import { PAYMENT_METHODS, SHIPPING_METHODS } from '../utils/constants';
import { cn, formatDate } from '../utils/format';

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums text-ink dark:text-cream">{value}</dd>
    </div>
  );
}

function MetaItem({ label, children }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-sm text-ink dark:text-cream">{children}</dd>
    </div>
  );
}

export function OrderConfirmation() {
  const { id } = useParams();
  const order = useAppSelector(selectOrderById(id));
  const { t, formatPrice, locale, lang, localize, localizeColor } = useI18n();

  if (!order) {
    return (
      <div className="lux-container py-10 md:py-16">
        <Seo title={t('checkout.success.title')} noIndex />
        <EmptyState
          icon={PackageX}
          title={t('state.notFound')}
          description={t('state.notFoundBody')}
          action={
            <Button to="/shop" variant="primary">
              {t('common.continueShopping')}
            </Button>
          }
        />
      </div>
    );
  }

  const shipping = SHIPPING_METHODS.find((method) => method.id === order.shippingMethod);
  const payment = PAYMENT_METHODS.find((method) => method.id === order.paymentMethod);
  const shippingLabel = (lang === 'ar' ? shipping?.labelAr : shipping?.label) ?? order.shippingMethod;
  const paymentLabel = (lang === 'ar' ? payment?.labelAr : payment?.label) ?? order.paymentMethod;

  const statusTone =
    order.status === 'Delivered' ? 'success' : order.status === 'In transit' ? 'gold' : 'outline';

  const { shippingAddress, totals } = order;

  return (
    <div className="lux-container py-10 md:py-16">
      <Seo title={t('checkout.success.title')} noIndex />

      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-2xl flex-col items-center text-center"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gold/5 text-gold">
          <CheckCircle2 className="h-9 w-9" strokeWidth={1.25} aria-hidden="true" />
        </span>
        <h1 className="display-title mt-8 text-balance">{t('checkout.success.title')}</h1>
        <p className="prose-lux mt-4 text-pretty">
          {t('checkout.success.body', { email: order.email ?? 'your email' })}
        </p>
      </motion.header>

      <dl className="mt-14 grid gap-x-8 gap-y-6 border border-line p-6 sm:grid-cols-2 md:p-8 lg:grid-cols-5 dark:border-night-border dark:bg-night-soft">
        <MetaItem label={t('checkout.success.order')}>
          <span className="font-display text-lg tabular-nums">{order.number}</span>
        </MetaItem>
        <MetaItem label="Date">{formatDate(order.createdAt, locale)}</MetaItem>
        <MetaItem label={t('checkout.delivery')}>{shippingLabel}</MetaItem>
        <MetaItem label={t('checkout.payment')}>{paymentLabel}</MetaItem>
        <MetaItem label="Status">
          <Badge tone={statusTone}>{order.status}</Badge>
        </MetaItem>
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        {/* -------- LEFT -------- */}
        <div className="space-y-10">
          <section>
            <h2 className="eyebrow mb-6">{t('account.orderDetails')}</h2>
            <ol className="mt-2">
              {order.timeline.map((step, index) => {
                const last = index === order.timeline.length - 1;
                return (
                  <li key={`${step.label}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute start-[6px] top-4 h-full w-px',
                          step.done ? 'bg-gold/60' : 'bg-line dark:bg-night-border',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border',
                        step.done
                          ? 'border-gold bg-gold'
                          : 'border-line bg-white dark:border-night-border dark:bg-night-soft',
                      )}
                    />
                    <div className="flex-1">
                      <p
                        className={cn(
                          'text-sm leading-none',
                          step.done ? 'font-medium text-ink dark:text-cream' : 'text-muted',
                        )}
                      >
                        {step.label}
                      </p>
                      {step.date && <p className="mt-1.5 text-xs text-muted">{formatDate(step.date, locale)}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="border border-line p-6 md:p-8 dark:border-night-border dark:bg-night-soft">
            <h2 className="eyebrow mb-4">{t('checkout.summary')}</h2>

            <ul className="divide-y divide-line dark:divide-night-border">
              {order.items.map((item, index) => (
                <li key={`${item.id}-${index}`} className="flex gap-4 py-5 first:pt-0">
                  <span className="h-20 w-16 shrink-0 overflow-hidden bg-cream-soft dark:bg-night-card">
                    <SmartImage
                      src={item.thumbnail}
                      alt={localize(item).title}
                      prompt={`${item.title} luxury product photography`}
                      wrapperClassName="h-full w-full"
                    />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-2xs uppercase tracking-wide text-muted">{localize(item).brand}</p>
                    <p className="mt-1 text-sm font-medium text-ink dark:text-cream">{localize(item).title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {[item.color && localizeColor(item.color), item.size && `${t('product.size')} ${item.size}`].filter(Boolean).join(' · ')}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {t('product.quantity')}: {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-ink dark:text-cream">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm dark:border-night-border">
              <SummaryRow label={t('cart.subtotal')} value={formatPrice(totals.subtotal)} />
              {totals.discount > 0 && (
                <SummaryRow label={t('cart.discount')} value={`− ${formatPrice(totals.discount)}`} />
              )}
              <SummaryRow
                label={t('cart.shipping')}
                value={totals.shipping === 0 ? t('cart.free') : formatPrice(totals.shipping)}
              />
              <SummaryRow label={t('cart.tax')} value={formatPrice(totals.tax)} />
              <div className="flex items-baseline justify-between border-t border-line pt-3 dark:border-night-border">
                <dt className="text-sm font-medium text-ink dark:text-cream">{t('cart.total')}</dt>
                <dd className="font-display text-xl tabular-nums text-ink dark:text-cream">
                  {formatPrice(totals.total)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        {/* -------- RIGHT -------- */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line p-6 dark:border-night-border">
            <h2 className="eyebrow mb-4 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              {t('checkout.shippingAddress')}
            </h2>
            <address className="text-sm not-italic leading-relaxed text-muted">
              <span className="block font-medium text-ink dark:text-cream">{shippingAddress.fullName}</span>
              <span className="block">{shippingAddress.line1}</span>
              {shippingAddress.line2 && <span className="block">{shippingAddress.line2}</span>}
              <span className="block">
                {[shippingAddress.city, shippingAddress.state, shippingAddress.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
              <span className="block">{shippingAddress.country}</span>
              {shippingAddress.phone && <span className="mt-1 block">{shippingAddress.phone}</span>}
            </address>
          </div>

          <div className="flex flex-col gap-3">
            <Button to="/shop" variant="primary" size="lg" fullWidth>
              {t('checkout.success.back')}
            </Button>
            <Button to="/account?tab=orders" variant="outline" size="lg" fullWidth>
              {t('checkout.success.track')}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default OrderConfirmation;
