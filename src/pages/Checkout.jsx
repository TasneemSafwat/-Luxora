import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarDays,
  Lock,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  X,
} from 'lucide-react';
import { Seo } from '../components/common/Seo';
import { CartLineItem } from '../components/cart/CartLineItem';
import {
  Breadcrumbs,
  Button,
  EmptyState,
  IconButton,
  Input,
  Radio,
  Select,
  Textarea,
} from '../components/ui';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useI18n } from '../hooks/useI18n';
import { clearCart, removeCoupon, selectCartCoupon, selectCartItems } from '../features/cart/cartSlice';
import { addOrder, selectDefaultAddress } from '../features/orders/ordersSlice';
import { selectAuthUser } from '../features/auth/authSlice';
import { checkoutSchema } from '../utils/validators';
import { computeCartTotals, estimateDelivery } from '../utils/cart';
import { digitsOnly, formatCardNumber, formatExpiry } from '../utils/card';
import { PAYMENT_METHODS, SHIPPING_METHODS } from '../utils/constants';
import { cn, formatDate } from '../utils/format';

const COUNTRIES = [
  'United Kingdom',
  'Italy',
  'France',
  'Germany',
  'United Arab Emirates',
  'Saudi Arabia',
  'Egypt',
  'United States',
];

/** One numbered, bordered form panel — shared so every section reads as a set. */
function Panel({ index, title, onFocus, children }) {
  return (
    <section
      onFocusCapture={onFocus}
      className="border border-line bg-white p-6 md:p-8 dark:border-night-border dark:bg-night-soft"
    >
      <header className="mb-6 flex items-center gap-3 border-b border-line pb-4 dark:border-night-border">
        <span className="font-display text-sm tabular-nums text-gold">{String(index).padStart(2, '0')}</span>
        <h2 className="font-display text-lg text-ink dark:text-cream">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums text-ink dark:text-cream">{value}</dd>
    </div>
  );
}

export function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, formatPrice, locale } = useI18n();

  const items = useAppSelector(selectCartItems);
  const coupon = useAppSelector(selectCartCoupon);
  const user = useAppSelector(selectAuthUser);
  const defaultAddress = useAppSelector(selectDefaultAddress);

  const [activeStep, setActiveStep] = useState(1);

  const [addrFirst = '', addrLast = ''] = (defaultAddress?.fullName ?? '').split(' ');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      email: user?.email ?? '',
      firstName: user?.firstName ?? addrFirst,
      lastName: user?.lastName ?? addrLast,
      phone: user?.phone ?? defaultAddress?.phone ?? '',
      address1: defaultAddress?.line1 ?? '',
      address2: defaultAddress?.line2 ?? '',
      city: defaultAddress?.city ?? '',
      state: defaultAddress?.state ?? '',
      postalCode: defaultAddress?.postalCode ?? '',
      country: defaultAddress?.country ?? 'United Kingdom',
      shippingMethod: 'standard',
      paymentMethod: 'card',
      notes: '',
      cardName: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    },
  });

  const shippingMethod = watch('shippingMethod');
  const paymentMethod = watch('paymentMethod');

  // Pass the whole method, not just its price: each method decides for itself whether the
  // free-shipping threshold applies (same-day courier used to turn free at the threshold too).
  const selectedShipping = useMemo(
    () => SHIPPING_METHODS.find((method) => method.id === shippingMethod) ?? SHIPPING_METHODS[0],
    [shippingMethod],
  );

  const totals = useMemo(() => computeCartTotals(items, coupon, selectedShipping), [items, coupon, selectedShipping]);

  /** Register a field whose text is reformatted as the shopper types (card number, expiry…). */
  const masked = (name, format) => {
    const field = register(name);
    return {
      ...field,
      onChange: (event) => {
        event.target.value = format(event.target.value);
        return field.onChange(event);
      },
    };
  };

  const delivery = useMemo(() => estimateDelivery(3, 5), []);

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const action = dispatch(
      addOrder({
        items,
        totals,
        shippingMethod: values.shippingMethod,
        paymentMethod: values.paymentMethod,
        shippingAddress: {
          fullName: `${values.firstName} ${values.lastName}`.trim(),
          line1: values.address1,
          line2: values.address2 || '',
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          phone: values.phone,
        },
        email: values.email,
        notes: values.notes || '',
      }),
    );

    dispatch(clearCart());
    navigate(`/order/${action.payload.id}`);
  });

  const steps = [
    { n: 1, label: t('checkout.contact') },
    { n: 2, label: t('checkout.delivery') },
    { n: 3, label: t('checkout.payment') },
  ];

  if (items.length === 0) {
    return (
      <div className="lux-container py-10 md:py-16">
        <Seo title={t('checkout.title')} description={t('checkout.secured')} />
        <Breadcrumbs items={[{ label: t('cart.title'), to: '/cart' }, { label: t('checkout.title') }]} />
        <EmptyState
          className="mt-8"
          icon={ShoppingBag}
          title={t('checkout.empty')}
          action={
            <Button to="/shop" variant="primary">
              {t('common.continueShopping')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="lux-container py-10 md:py-16">
      <Seo title={t('checkout.title')} description={t('checkout.secured')} />

      <Breadcrumbs items={[{ label: t('cart.title'), to: '/cart' }, { label: t('checkout.title') }]} />

      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-2xl border-b border-line pb-6 dark:border-night-border"
      >
        <h1 className="display-title">{t('checkout.title')}</h1>
        <p className="prose-lux mt-4">{t('checkout.secured')}</p>
      </motion.header>

      {/* Step indicator */}
      <ol className="mt-10 flex items-center md:mt-12">
        {steps.map((step, index) => {
          const isActive = activeStep === step.n;
          const isDone = activeStep > step.n;
          return (
            <li key={step.n} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center border text-2xs font-medium tabular-nums transition-colors duration-300',
                    isActive
                      ? 'border-ink bg-ink text-white dark:border-cream dark:bg-cream dark:text-ink'
                      : isDone
                        ? 'border-gold text-gold-700 dark:text-gold'
                        : 'border-line text-muted dark:border-night-border',
                  )}
                >
                  {step.n}
                </span>
                <span
                  className={cn(
                    'hidden text-2xs uppercase tracking-wide sm:block',
                    isActive ? 'text-ink dark:text-cream' : 'text-muted',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn('mx-3 h-px flex-1 sm:mx-4', isDone ? 'bg-gold/60' : 'bg-line dark:bg-night-border')}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-12 md:mt-12 lg:grid-cols-[1fr_23rem]">
        {/* -------- LEFT: the form -------- */}
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <Panel index={1} title={t('checkout.contact')} onFocus={() => setActiveStep(1)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                className="sm:col-span-2"
                type="email"
                autoComplete="email"
                label={t('auth.email')}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                autoComplete="given-name"
                label={t('auth.firstName')}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                autoComplete="family-name"
                label={t('auth.lastName')}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
              <Input
                className="sm:col-span-2"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                label="Phone"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
          </Panel>

          <Panel index={2} title={t('checkout.shippingAddress')} onFocus={() => setActiveStep(1)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                className="sm:col-span-2"
                autoComplete="address-line1"
                label="Street address"
                error={errors.address1?.message}
                {...register('address1')}
              />
              <Input
                className="sm:col-span-2"
                autoComplete="address-line2"
                label={`Address line 2 · ${t('common.optional')}`}
                error={errors.address2?.message}
                {...register('address2')}
              />
              <Input autoComplete="address-level2" label="City" error={errors.city?.message} {...register('city')} />
              <Input
                autoComplete="address-level1"
                label="State / Region"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                autoComplete="postal-code"
                label="Postal code"
                error={errors.postalCode?.message}
                {...register('postalCode')}
              />
              <Select
                className="[&_select]:text-ink dark:[&_select]:text-cream"
                autoComplete="country-name"
                label="Country"
                options={COUNTRIES.map((country) => ({ value: country, label: country }))}
                error={errors.country?.message}
                {...register('country')}
              />
            </div>
          </Panel>

          <Panel index={3} title={t('checkout.delivery')} onFocus={() => setActiveStep(2)}>
            <div className="space-y-3">
              {SHIPPING_METHODS.map((method) => (
                <Radio
                  key={method.id}
                  value={method.id}
                  label={
                    <span className="flex items-center justify-between gap-3">
                      <span>{method.label}</span>
                      <span className="tabular-nums text-muted">
                        {method.price === 0 ? t('cart.free') : formatPrice(method.price)}
                      </span>
                    </span>
                  }
                  description={method.description}
                  {...register('shippingMethod')}
                />
              ))}
              {errors.shippingMethod?.message && (
                <p role="alert" className="field-error">
                  {errors.shippingMethod.message}
                </p>
              )}
            </div>
          </Panel>

          <Panel index={4} title={t('checkout.payment')} onFocus={() => setActiveStep(3)}>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <Radio
                  key={method.id}
                  value={method.id}
                  label={method.label}
                  description={method.hint}
                  {...register('paymentMethod')}
                />
              ))}
              {errors.paymentMethod?.message && (
                <p role="alert" className="field-error">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            {paymentMethod === 'card' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 border border-line p-5 md:p-6 dark:border-night-border"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    className="sm:col-span-2"
                    autoComplete="cc-name"
                    label={t('checkout.cardName')}
                    error={errors.cardName?.message}
                    {...register('cardName')}
                  />
                  <Input
                    className="sm:col-span-2"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    label={t('checkout.cardNumber')}
                    error={errors.cardNumber?.message}
                    {...masked('cardNumber', formatCardNumber)}
                  />
                  <Input
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                    placeholder="MM/YY"
                    label={t('checkout.expiry')}
                    error={errors.cardExpiry?.message}
                    {...masked('cardExpiry', formatExpiry)}
                  />
                  <Input
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    placeholder="123"
                    label={t('checkout.cvc')}
                    error={errors.cardCvc?.message}
                    {...masked('cardCvc', (value) => digitsOnly(value).slice(0, 4))}
                  />
                </div>
                <p className="mt-5 flex items-center gap-2 text-xs text-muted">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
                  {t('checkout.secured')}
                </p>
              </motion.div>
            )}

            <div className="mt-6">
              <Textarea
                label={t('checkout.notes')}
                placeholder={t('checkout.notesPlaceholder')}
                error={errors.notes?.message}
                {...register('notes')}
              />
            </div>
          </Panel>

          <Button type="submit" variant="primary" size="lg" fullWidth icon={Lock} loading={isSubmitting}>
            {isSubmitting ? t('checkout.processing') : t('checkout.placeOrder')}
          </Button>
        </form>

        {/* -------- RIGHT: order summary -------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-cream-soft/60 p-6 dark:border-night-border dark:bg-night-soft">
            <h2 className="font-display text-lg text-ink dark:text-cream">{t('checkout.summary')}</h2>

            {coupon && (
              <div className="mt-4 flex items-center justify-between gap-3 border border-dashed border-gold/50 bg-gold-50/50 px-3 py-2 dark:bg-gold/10">
                <span className="flex items-center gap-2 text-2xs font-medium uppercase tracking-wide text-ink dark:text-cream">
                  <Tag className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                  {coupon.code}
                </span>
                <IconButton
                  size="sm"
                  label={t('common.remove')}
                  className="-me-1 h-7 w-7 text-muted hover:text-danger"
                  onClick={() => dispatch(removeCoupon())}
                >
                  <X className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            )}

            <div className="mt-4 divide-y divide-line dark:divide-night-border">
              {items.map((item) => (
                <CartLineItem key={item.key} item={item} size="sm" />
              ))}
            </div>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm dark:border-night-border">
              <SummaryRow label={t('cart.subtotal')} value={formatPrice(totals.subtotal)} />
              {totals.discount > 0 && (
                <SummaryRow label={t('cart.discount')} value={`− ${formatPrice(totals.discount)}`} />
              )}
              <SummaryRow
                label={t('cart.shipping')}
                value={totals.freeShippingApplied ? t('cart.free') : formatPrice(totals.shipping)}
              />
              <SummaryRow label={t('cart.tax')} value={formatPrice(totals.tax)} />
              <div className="flex items-baseline justify-between border-t border-line pt-3 dark:border-night-border">
                <dt className="text-sm font-medium text-ink dark:text-cream">{t('cart.total')}</dt>
                <dd className="font-display text-xl tabular-nums text-ink dark:text-cream">
                  {formatPrice(totals.total)}
                </dd>
              </div>
            </dl>

            <p className="mt-5 flex items-center gap-2 text-xs text-muted">
              <CalendarDays className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              {t('cart.shipping')}: {formatDate(delivery.from, locale)} – {formatDate(delivery.to, locale)}
            </p>

            <div className="mt-6 grid gap-3 border-t border-line pt-5 text-xs text-muted dark:border-night-border">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {t('footer.payments')}
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {t('product.freeReturns')}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
