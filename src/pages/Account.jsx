import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import {
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout, selectAuthUser, updateProfile } from '../features/auth/authSlice';
import {
  addAddress,
  removeAddress,
  selectAddresses,
  selectOrders,
  setDefaultAddress,
  updateAddress,
} from '../features/orders/ordersSlice';
import { selectWishlistItems } from '../features/wishlist/wishlistSlice';
import { pushToast } from '../features/ui/uiSlice';
import { useI18n } from '../hooks/useI18n';
import { addressSchema, profileSchema } from '../utils/validators';
import { cn, formatDate, initials } from '../utils/format';
import {
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  Select,
} from '../components/ui';
import { Seo } from '../components/common/Seo';
import { SmartImage } from '../components/common/SmartImage';

const TABS = [
  { id: 'overview', labelKey: 'account.overview', icon: LayoutDashboard },
  { id: 'profile', labelKey: 'account.profile', icon: User },
  { id: 'orders', labelKey: 'account.orders', icon: Package },
  { id: 'addresses', labelKey: 'account.addresses', icon: MapPin },
];

const TAB_IDS = TABS.map((tab) => tab.id);

const COUNTRIES = [
  'United Kingdom',
  'United States',
  'France',
  'Italy',
  'Switzerland',
  'United Arab Emirates',
  'Saudi Arabia',
  'Egypt',
  'Japan',
  'Australia',
];

const EMPTY_ADDRESS = {
  label: '',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

function statusTone(status) {
  if (status === 'Delivered') return 'success';
  if (status === 'In transit') return 'gold';
  return 'outline';
}

/** Derive six monthly spend buckets (oldest → newest) from the order history. */
function buildSpendBuckets(orders, locale) {
  const now = new Date();
  const buckets = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
      total: 0,
    });
  }

  const lookup = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const index = lookup.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (index !== undefined) buckets[index].total += order.totals?.total ?? 0;
  });

  return buckets;
}

function SpendTooltip({ active, payload, label }) {
  const { formatPrice } = useI18n();
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-line bg-white px-3.5 py-2.5 shadow-soft dark:border-night-border dark:bg-night-card">
      <p className="text-2xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-sm text-ink dark:text-cream">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border border-line bg-white p-6 dark:border-night-border dark:bg-night-soft">
      <p className="eyebrow">{label}</p>
      <p className="mt-4 font-display text-3xl text-ink dark:text-cream">{value}</p>
    </div>
  );
}

function OrderTimeline({ timeline, locale }) {
  return (
    <ol className="mt-1">
      {timeline.map((step, index) => (
        <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
          {index < timeline.length - 1 && (
            <span
              className={cn(
                'absolute start-[5px] top-4 bottom-0 w-px',
                step.done ? 'bg-ink/25 dark:bg-cream/25' : 'bg-line dark:bg-night-border',
              )}
              aria-hidden="true"
            />
          )}
          <span
            className={cn(
              'relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border',
              step.done
                ? 'border-ink bg-ink dark:border-cream dark:bg-cream'
                : 'border-line bg-white dark:border-night-border dark:bg-night-soft',
            )}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className={cn('text-sm', step.done ? 'font-medium text-ink dark:text-cream' : 'text-muted')}>
              {step.label}
            </p>
            {step.date && <p className="mt-0.5 text-xs text-muted">{formatDate(step.date, locale)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function OrderCard({ order }) {
  const { t, formatPrice, locale, localize, localizeColor } = useI18n();
  const [open, setOpen] = useState(false);

  const address = order.shippingAddress ?? {};

  return (
    <article className="border border-line bg-white dark:border-night-border dark:bg-night-soft">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 p-5">
        <div className="min-w-0">
          <p className="font-display text-lg text-ink dark:text-cream">{order.number}</p>
          <p className="mt-1 text-xs text-muted">{formatDate(order.createdAt, locale)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Badge tone={statusTone(order.status)}>{order.status}</Badge>
          <p className="text-sm tabular-nums text-ink dark:text-cream">{formatPrice(order.totals?.total ?? 0)}</p>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="inline-flex items-center gap-2 text-2xs font-medium uppercase tracking-wide text-ink transition-colors hover:text-gold dark:text-cream"
          >
            {t('account.viewOrder')}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-10 border-t border-line p-5 md:grid-cols-2 dark:border-night-border">
              <div>
                <p className="eyebrow mb-5">{t('account.orderDetails')}</p>
                <OrderTimeline timeline={order.timeline ?? []} locale={locale} />
              </div>

              <div>
                <p className="eyebrow mb-4">{t('checkout.summary')}</p>
                <ul className="-mt-1">
                  {order.items.map((item) => (
                    <li key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 border-b border-line py-4 last:border-b-0 dark:border-night-border">
                      <Link
                        to={`/product/${item.id}`}
                        className="h-20 w-16 shrink-0 overflow-hidden bg-cream-soft dark:bg-night-card"
                      >
                        <SmartImage
                          src={item.thumbnail}
                          alt={localize(item).title}
                          prompt={`${item.title} luxury product photography`}
                          wrapperClassName="h-full w-full"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <p className="text-2xs uppercase tracking-wide text-muted">{localize(item).brand}</p>
                        <p className="mt-1 truncate text-sm text-ink dark:text-cream">{localize(item).title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {[item.color && localizeColor(item.color), item.size && `${t('product.size')} ${item.size}`, `×${item.quantity}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm tabular-nums text-ink dark:text-cream">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm dark:border-night-border">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{t('cart.subtotal')}</dt>
                    <dd className="tabular-nums text-ash dark:text-cream">{formatPrice(order.totals?.subtotal ?? 0)}</dd>
                  </div>
                  {order.totals?.discount > 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted">{t('cart.discount')}</dt>
                      <dd className="tabular-nums text-success">−{formatPrice(order.totals.discount)}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{t('cart.shipping')}</dt>
                    <dd className="tabular-nums text-ash dark:text-cream">
                      {order.totals?.shipping > 0 ? formatPrice(order.totals.shipping) : t('cart.free')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{t('cart.tax')}</dt>
                    <dd className="tabular-nums text-ash dark:text-cream">{formatPrice(order.totals?.tax ?? 0)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-line pt-2.5 dark:border-night-border">
                    <dt className="font-medium text-ink dark:text-cream">{t('cart.total')}</dt>
                    <dd className="font-display text-base tabular-nums text-ink dark:text-cream">
                      {formatPrice(order.totals?.total ?? 0)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 border-t border-line pt-5 dark:border-night-border">
                  <p className="eyebrow mb-3">{t('checkout.shippingAddress')}</p>
                  <address className="text-sm not-italic leading-relaxed text-muted">
                    <span className="block text-ash dark:text-cream">{address.fullName}</span>
                    <span className="block">{address.line1}</span>
                    {address.line2 && <span className="block">{address.line2}</span>}
                    <span className="block">
                      {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
                    </span>
                    <span className="block">{address.country}</span>
                    {address.phone && <span className="mt-1 block">{address.phone}</span>}
                  </address>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function OverviewTab({ orders, wishlist, onGoToTab }) {
  const { t, formatPrice, locale, localize } = useI18n();

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders],
  );
  const recentOrders = sortedOrders.slice(0, 2);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + (order.totals?.total ?? 0), 0),
    [orders],
  );

  const spendData = useMemo(() => buildSpendBuckets(orders, locale), [orders, locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t('account.totalOrders')} value={orders.length} />
        <StatCard label={t('account.savedItems')} value={wishlist.length} />
        <StatCard label={t('account.totalSpent')} value={formatPrice(totalSpent)} />
      </div>

      {/* Recent orders */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl text-ink dark:text-cream">{t('account.orders')}</h2>
          <button
            type="button"
            onClick={() => onGoToTab('orders')}
            className="link-underline text-2xs uppercase tracking-wide text-ink dark:text-cream"
          >
            {t('common.viewAll')}
          </button>
        </div>

        {recentOrders.length ? (
          <ul className="mt-5 space-y-3">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  to="/account?tab=orders"
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border border-line bg-white px-5 py-4 transition-colors hover:border-ink dark:border-night-border dark:bg-night-soft dark:hover:border-cream/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-cream">{order.number}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatDate(order.createdAt, locale)}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                    <p className="text-sm tabular-nums text-ink dark:text-cream">{formatPrice(order.totals?.total ?? 0)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 border border-dashed border-line px-6 py-10 text-center dark:border-night-border">
            <p className="font-display text-lg text-ink dark:text-cream">{t('account.noOrders')}</p>
            <p className="prose-lux mt-2">{t('account.noOrdersBody')}</p>
          </div>
        )}
      </section>

      {/* Spend overview */}
      <section className="mt-10 border border-line bg-white p-6 dark:border-night-border dark:bg-night-soft">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-ink dark:text-cream">{t('account.orderSpend')}</h2>
            <p className="mt-1 text-xs text-muted">{t('account.last6Months')}</p>
          </div>
          <p className="font-display text-2xl text-ink dark:text-cream">{formatPrice(totalSpent)}</p>
        </div>

        <div className="mt-6 h-44 w-full text-muted" style={{ direction: 'ltr' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="luxSpendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B89B72" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#B89B72" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={8}
                tick={{ fill: 'currentColor', fontSize: 11 }}
              />
              <Tooltip content={<SpendTooltip />} cursor={{ stroke: '#E7E4DF', strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#B89B72"
                strokeWidth={1.5}
                fill="url(#luxSpendGradient)"
                activeDot={{ r: 3, fill: '#B89B72', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Saved pieces */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl text-ink dark:text-cream">{t('account.wishlist')}</h2>
          <Link to="/wishlist" className="link-underline text-2xs uppercase tracking-wide text-ink dark:text-cream">
            {t('common.viewAll')}
          </Link>
        </div>

        {wishlist.length ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {wishlist.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="group block border border-line bg-white transition-colors hover:border-ink dark:border-night-border dark:bg-night-soft dark:hover:border-cream/50"
              >
                <span className="block aspect-[3/4] overflow-hidden">
                  <SmartImage
                    src={item.thumbnail}
                    alt={localize(item).title}
                    prompt={`${item.title} luxury product photography`}
                    wrapperClassName="h-full w-full"
                    className="transition-transform duration-700 ease-editorial group-hover:scale-105"
                  />
                </span>
                <span className="block px-3.5 py-3">
                  <span className="block truncate text-xs text-ink dark:text-cream">{localize(item).title}</span>
                  <span className="mt-1 block text-xs tabular-nums text-muted">{formatPrice(item.price)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-line px-6 py-10 text-center dark:border-night-border">
            <p className="font-display text-lg text-ink dark:text-cream">{t('wishlist.empty')}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileTab({ user }) {
  const dispatch = useAppDispatch();
  const { t, locale } = useI18n();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      birthDate: user.birthDate ?? '',
    },
  });

  const onSubmit = (values) => {
    dispatch(updateProfile(values));
    dispatch(pushToast({ type: 'success', title: t('account.profileUpdated') }));
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-display text-xl text-ink dark:text-cream">{t('account.editProfile')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
          </div>

          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
            <Input label="Date of birth" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
          </div>

          <Button type="submit" size="sm">
            {t('common.save')}
          </Button>
        </form>
      </div>

      <aside className="border border-line bg-cream-soft/70 p-6 dark:border-night-border dark:bg-night-soft">
        <p className="eyebrow">{t('account.title')}</p>
        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{t('account.memberSince')}</dt>
            <dd className="text-ash dark:text-cream">{formatDate(user.memberSince, locale)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{t('account.tier')}</dt>
            <dd>
              <Badge tone="gold">{user.tier}</Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Member ID</dt>
            <dd className="font-mono text-xs tabular-nums text-ash dark:text-cream">{user.id}</dd>
          </div>
        </dl>

        <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-muted dark:border-night-border">
          {t('common.demo')} — this is a front-end demonstration. Your details are stored in your browser only and
          never transmitted.
        </p>
      </aside>
    </div>
  );
}

function OrdersTab({ orders }) {
  const { t } = useI18n();

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders],
  );

  if (!sortedOrders.length) {
    return (
      <EmptyState
        icon={Package}
        title={t('account.noOrders')}
        description={t('account.noOrdersBody')}
        action={<Button to="/shop">{t('nav.shop')}</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {sortedOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function AddressForm({ defaultValues, onSubmit, onCancel }) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: 'onBlur',
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Label" placeholder="Home, Atelier…" error={errors.label?.message} {...register('label')} />
        <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
        <Input label="Address line 1" error={errors.line1?.message} {...register('line1')} />
      </div>

      <Input label="Address line 2" hint={t('common.optional')} error={errors.line2?.message} {...register('line2')} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="City" error={errors.city?.message} {...register('city')} />
        <Input label="State / region" error={errors.state?.message} {...register('state')} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Postal code" error={errors.postalCode?.message} {...register('postalCode')} />
        <Select
          label="Country"
          placeholder="Select country"
          error={errors.country?.message}
          options={COUNTRIES.map((country) => ({ value: country, label: country }))}
          {...register('country')}
        />
      </div>

      <Checkbox label={t('account.setDefault')} {...register('isDefault')} />

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end dark:border-night-border">
        <Button variant="subtle" size="sm" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" size="sm">
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}

function AddressesTab() {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const addresses = useAppSelector(selectAddresses);

  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleSubmit = (values) => {
    if (editor?.address) dispatch(updateAddress({ ...values, id: editor.address.id }));
    else dispatch(addAddress(values));
    dispatch(pushToast({ type: 'success', title: t('account.addressSaved') }));
    setEditor(null);
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    dispatch(removeAddress(pendingDelete.id));
    dispatch(pushToast({ type: 'info', title: t('account.addressDeleted') }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink dark:text-cream">{t('account.addresses')}</h2>
        <Button size="sm" icon={Plus} onClick={() => setEditor({ address: null })}>
          {t('account.addAddress')}
        </Button>
      </div>

      {addresses.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col border border-line bg-white p-5 dark:border-night-border dark:bg-night-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-base text-ink dark:text-cream">{address.label}</p>
                {address.isDefault && <Badge tone="gold">{t('account.default')}</Badge>}
              </div>

              <address className="mt-4 flex-1 text-sm not-italic leading-relaxed text-muted">
                <span className="block text-ash dark:text-cream">{address.fullName}</span>
                <span className="block">{address.line1}</span>
                {address.line2 && <span className="block">{address.line2}</span>}
                <span className="block">
                  {[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}
                </span>
                <span className="block">{address.country}</span>
                {address.phone && <span className="mt-1 block">{address.phone}</span>}
              </address>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 dark:border-night-border">
                {!address.isDefault && (
                  <Button
                    variant="subtle"
                    size="xs"
                    icon={Check}
                    onClick={() => dispatch(setDefaultAddress(address.id))}
                  >
                    {t('account.setDefault')}
                  </Button>
                )}
                <Button variant="ghost" size="xs" icon={Pencil} onClick={() => setEditor({ address })}>
                  {t('common.edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  icon={Trash2}
                  className="text-muted hover:text-danger"
                  onClick={() => setPendingDelete(address)}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            compact
            icon={MapPin}
            title={t('account.noAddresses')}
            description={t('account.noAddressesBody')}
            action={
              <Button size="sm" icon={Plus} onClick={() => setEditor({ address: null })}>
                {t('account.addAddress')}
              </Button>
            }
          />
        </div>
      )}

      <Modal
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        size="lg"
        title={editor?.address ? t('common.edit') : t('account.addAddress')}
        description={editor?.address ? editor.address.label : undefined}
      >
        {editor && (
          <AddressForm
            key={editor.address?.id ?? 'new'}
            defaultValues={editor.address ?? EMPTY_ADDRESS}
            onSubmit={handleSubmit}
            onCancel={() => setEditor(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        description={pendingDelete ? `${pendingDelete.label} — ${t('account.addressDeleted')}` : ''}
        confirmLabel={t('common.delete')}
      />
    </div>
  );
}

export function Account() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, locale } = useI18n();

  const user = useAppSelector(selectAuthUser);
  const orders = useAppSelector(selectOrders);
  const wishlist = useAppSelector(selectWishlistItems);

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const activeTab = TAB_IDS.includes(requestedTab) ? requestedTab : 'overview';

  const setTab = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', id);
    setSearchParams(next);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(pushToast({ type: 'info', title: t('auth.logout') }));
    navigate('/');
  };

  // ProtectedRoute guarantees a user, but guard defensively for the type of render.
  if (!user) return <Seo title={t('account.title')} />;

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

  return (
    <div className="lux-container py-10 md:py-16">
      <Seo title={t('account.title')} />

      <Breadcrumbs items={[{ label: t('account.title') }]} />

      <header className="mt-8 flex flex-col gap-6 border-b border-line pb-8 dark:border-night-border">
        <div>
          <p className="eyebrow">{t('eyebrow.clientArea')}</p>
          <h1 className="display-title mt-4 text-balance">
            {t('account.greeting')}, {user.firstName}
          </h1>
          <p className="prose-lux mt-3">
            {t('account.memberSince')} {formatDate(user.memberSince, locale)}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-white p-6 dark:border-night-border dark:bg-night-soft">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cream font-display text-lg text-ink ring-1 ring-gold/40 dark:bg-night-card dark:text-cream">
                {initials(fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base text-ink dark:text-cream">{fullName}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>

            <Badge tone="gold" className="mt-5">
              {user.tier}
            </Badge>

            <nav aria-label={t('account.title')} className="mt-6 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-start text-sm transition-colors duration-200',
                      active
                        ? 'bg-ink text-white dark:bg-cream dark:text-ink'
                        : 'text-ash hover:bg-ink-50 dark:text-cream dark:hover:bg-white/5',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-line pt-6 dark:border-night-border">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-start text-sm text-ash transition-colors hover:text-danger dark:text-cream"
              >
                <LogOut className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {activeTab === 'overview' && (
            <OverviewTab orders={orders} wishlist={wishlist} onGoToTab={setTab} />
          )}
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} />}
          {activeTab === 'addresses' && <AddressesTab />}
        </div>
      </div>
    </div>
  );
}

export default Account;
