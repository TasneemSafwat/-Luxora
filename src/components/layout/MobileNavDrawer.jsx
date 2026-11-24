import { Link, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectAuthUser, selectIsAuthenticated } from '../../features/auth/authSlice';
import { setMobileNavOpen, selectMobileNavOpen, pushToast } from '../../features/ui/uiSlice';
import { selectWishlistCount } from '../../features/wishlist/wishlistSlice';
import { useI18n } from '../../hooks/useI18n';
import { CATEGORY_META, NAV_LINKS } from '../../utils/constants';
import { Button, Drawer } from '../ui';
import { CurrencyMenu, LanguageToggle, ThemeToggle } from './PreferenceControls';

/** Off-canvas navigation for tablet and mobile. */
export function MobileNavDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const open = useAppSelector(selectMobileNavOpen);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const wishlistCount = useAppSelector(selectWishlistCount);

  const close = () => dispatch(setMobileNavOpen(false));

  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <Drawer open={open} onClose={close} side="start" title={t('nav.menu')} size="sm">
      <nav aria-label="Mobile" className="flex h-full flex-col">
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={close}
                className="block border-b border-line py-3.5 font-display text-lg text-ink transition-colors hover:text-gold dark:border-night-border dark:text-cream"
              >
                {lang === 'ar' ? link.labelAr : link.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="eyebrow mt-8 mb-3">{t('shop.category')}</p>
        <ul className="grid grid-cols-2 gap-x-4">
          {Object.entries(CATEGORY_META)
            .slice(0, 8)
            .map(([slug, meta]) => (
              <li key={slug}>
                <Link
                  to={`/shop?category=${slug}`}
                  onClick={close}
                  className="block py-2 text-sm text-ash transition-colors hover:text-ink dark:text-cream/80 dark:hover:text-cream"
                >
                  {lang === 'ar' ? meta.ar : meta.en}
                </Link>
              </li>
            ))}
        </ul>

        <div className="mt-8 border-t border-line pt-6 dark:border-night-border">
          <p className="eyebrow mb-3">{t('nav.account')}</p>

          {isAuthenticated ? (
            <div className="space-y-2.5">
              <p className="text-sm text-ink dark:text-cream">
                {t('account.greeting')}, <span className="font-medium">{user?.firstName}</span>
              </p>
              <Button variant="subtle" size="sm" fullWidth icon={LayoutDashboard} onClick={() => go('/account')}>
                {t('account.title')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                icon={LogOut}
                onClick={() => {
                  dispatch(logout());
                  dispatch(pushToast({ type: 'info', title: t('auth.logout') }));
                  close();
                }}
              >
                {t('auth.logout')}
              </Button>
            </div>
          ) : (
            <div className="grid gap-2.5">
              <Button size="sm" fullWidth icon={User} onClick={() => go('/login')}>
                {t('auth.login')}
              </Button>
              <Button variant="subtle" size="sm" fullWidth onClick={() => go('/register')}>
                {t('auth.register')}
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => go('/wishlist')}
            className="mt-4 flex w-full items-center gap-2 py-2 text-sm text-ash transition-colors hover:text-ink dark:text-cream/80 dark:hover:text-cream"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {t('nav.wishlist')}
            {wishlistCount > 0 && <span className="text-muted">({wishlistCount})</span>}
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-5 dark:border-night-border">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <CurrencyMenu />
        </div>
      </nav>
    </Drawer>
  );
}

export default MobileNavDrawer;
