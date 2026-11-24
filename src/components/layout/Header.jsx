import { useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectCartCount } from '../../features/cart/cartSlice';
import { selectWishlistCount } from '../../features/wishlist/wishlistSlice';
import { logout, selectAuthUser, selectIsAuthenticated } from '../../features/auth/authSlice';
import { pushToast, setMobileNavOpen, setSearchOpen, setCartDrawerOpen } from '../../features/ui/uiSlice';
import { useI18n } from '../../hooks/useI18n';
import { useScrolled } from '../../hooks/useUi';
import { NAV_LINKS } from '../../utils/constants';
import { cn } from '../../utils/format';
import { Logo } from '../common/Logo';
import { IconButton } from '../ui/IconButton';
import { Dropdown } from '../ui/Dropdown';
import { CurrencyMenu, LanguageToggle, ThemeToggle } from './PreferenceControls';

/** Count badge used on the wishlist and cart triggers. */
function CountBadge({ count, className }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        'absolute -end-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold tabular-nums text-ink',
        className,
      )}
      aria-hidden="true"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const scrolled = useScrolled(12);

  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  const openSearch = useCallback(() => dispatch(setSearchOpen(true)), [dispatch]);
  const openCart = useCallback(() => dispatch(setCartDrawerOpen(true)), [dispatch]);

  const accountItems = isAuthenticated
    ? [
        { key: 'account', label: t('account.title'), icon: LayoutDashboard, onSelect: () => navigate('/account') },
        { key: 'orders', label: t('account.orders'), icon: Package, onSelect: () => navigate('/account?tab=orders') },
        { key: 'wishlist', label: t('nav.wishlist'), icon: Heart, onSelect: () => navigate('/wishlist') },
        { divider: true, key: 'div-1' },
        {
          key: 'logout',
          label: t('auth.logout'),
          icon: LogOut,
          danger: true,
          onSelect: () => {
            dispatch(logout());
            dispatch(pushToast({ type: 'info', title: t('auth.logout') }));
            navigate('/');
          },
        },
      ]
    : [
        { key: 'login', label: t('auth.login'), icon: User, onSelect: () => navigate('/login') },
        { key: 'register', label: t('auth.register'), icon: UserPlus, onSelect: () => navigate('/register') },
        { divider: true, key: 'div-2' },
        { key: 'wishlist', label: t('nav.wishlist'), icon: Heart, onSelect: () => navigate('/wishlist') },
      ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-400 ease-editorial',
        scrolled
          ? 'border-line bg-white/92 backdrop-blur-md dark:border-night-border dark:bg-night/92'
          : 'border-transparent bg-white dark:bg-night',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:text-white"
      >
        {t('common.skipToContent')}
      </a>

      <div className="lux-container">
        <div className={cn('flex items-center justify-between transition-all duration-400', scrolled ? 'h-16' : 'h-[var(--lux-header-h)] md:h-20')}>
          {/* Left — navigation */}
          <nav className="flex flex-1 items-center gap-1" aria-label={t('common.primaryNav')}>
            <IconButton
              label={t('nav.menu')}
              className="lg:hidden"
              onClick={() => dispatch(setMobileNavOpen(true))}
            >
              <Menu className="h-5 w-5" />
            </IconButton>

            <ul className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'link-underline text-2xs font-medium uppercase tracking-wide transition-colors duration-300',
                        isActive ? 'text-ink dark:text-cream' : 'text-ash/80 hover:text-ink dark:text-cream/70 dark:hover:text-cream',
                      )
                    }
                  >
                    {lang === 'ar' ? link.labelAr : link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Centre — wordmark */}
          <div className="flex shrink-0 items-center justify-center">
            <Logo />
          </div>

          {/* Right — utilities */}
          <div className="flex flex-1 items-center justify-end gap-0.5">
            <IconButton label={t('nav.search')} onClick={openSearch}>
              <Search className="h-4.5 w-4.5" />
            </IconButton>

            <div className="hidden items-center xl:flex">
              <CurrencyMenu />
            </div>

            <LanguageToggle className="hidden sm:inline-flex" />
            <ThemeToggle className="hidden sm:inline-flex" />

            <Dropdown
              align="end"
              trigger={() => (
                <IconButton label={t('nav.account')}>
                  <User className="h-4.5 w-4.5" />
                  {isAuthenticated && (
                    <span className="absolute -end-1 -top-1 h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                  )}
                </IconButton>
              )}
              items={[
                ...(isAuthenticated
                  ? [
                      {
                        key: 'greeting',
                        label: `${t('account.greeting')}, ${user?.firstName}`,
                        meta: user?.tier,
                        disabled: true,
                      },
                      { divider: true, key: 'd0' },
                    ]
                  : []),
                ...accountItems,
              ]}
            />

            <Link
              to="/wishlist"
              aria-label={`${t('nav.wishlist')}${wishlistCount ? ` — ${wishlistCount}` : ''}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink-50 dark:text-cream dark:hover:bg-white/10"
            >
              <Heart className="h-4.5 w-4.5" aria-hidden="true" />
              <CountBadge count={wishlistCount} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`${t('nav.cart')} — ${t('cart.itemCount', { count: cartCount })}`}
              className="relative ms-0.5 flex h-10 items-center gap-2 px-2.5 text-ink transition-colors hover:text-gold dark:text-cream"
            >
              <span className="relative">
                <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
                <CountBadge count={cartCount} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
