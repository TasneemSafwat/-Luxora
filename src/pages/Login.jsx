import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Info, Mail } from 'lucide-react';
import { Seo } from '../components/common/Seo';
import { Logo } from '../components/common/Logo';
import { BannerArt } from '../components/banners/BannerArt';
import { AUTH_PHOTOS } from '../utils/bannerPhotos';
import { Button, Checkbox, IconButton, Input } from '../components/ui';
import { loginSchema } from '../utils/validators';
import {
  DEMO_ACCOUNT,
  clearAuthError,
  login,
  selectAuthError,
  selectAuthStatus,
} from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useI18n } from '../hooks/useI18n';

const DEMO_PASSWORD = 'luxora123';

const PANEL_BENEFITS = [
  'Private client privileges',
  'Complimentary express shipping',
  'Complimentary 30-day returns',
];

export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const status = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), mode: 'onBlur' });

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const onSubmit = async (values) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      dispatch(pushToast({ type: 'success', title: t('auth.welcomeBack', { name: result.firstName }) }));
      navigate(location.state?.from || '/', { replace: true });
    } catch {
      /* failure is surfaced through selectAuthError */
    }
  };

  const useDemoAccount = () => {
    setValue('email', DEMO_ACCOUNT.email, { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
  };

  return (
    <>
      <Seo title={t('auth.loginTitle')} description={t('auth.loginSubtitle')} />

      <section className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
        {/* Editorial image panel */}
        <div className="relative hidden overflow-hidden lg:block">
          {/* Self-contained artwork: no third-party image request, instant paint. */}
          <BannerArt variant="portrait" src={AUTH_PHOTOS} priority imgClassName="object-[50%_18%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-ink/35" aria-hidden="true" />

          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
            <Logo inverted size="lg" />

            <div className="max-w-sm">
              <p className="font-display text-title text-white">Quiet luxury, considered.</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Sign in to revisit your saved pieces, order history and private client privileges.
              </p>
            </div>

            <ul className="space-y-2.5">
              {PANEL_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-2xs uppercase tracking-wide text-white/75">
                  <span className="h-px w-5 bg-gold" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center px-6 py-14 md:px-10 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>

            <p className="eyebrow mt-8 lg:mt-0">{t('eyebrow.clientAccess')}</p>
            <h1 className="display-title mt-4">{t('auth.loginTitle')}</h1>
            <p className="prose-lux mt-3">{t('auth.loginSubtitle')}</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-9 space-y-5">
              {authError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 border border-danger/30 bg-danger/[0.06] p-4 text-sm text-danger"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>{authError}</p>
                </div>
              )}

              <Input
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                leading={Mail}
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                trailing={
                  <IconButton
                    label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    size="sm"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </IconButton>
                }
                {...register('password')}
              />

              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
                <div className="min-w-0 flex-1 sm:flex-none">
                  <Checkbox label={t('auth.remember')} {...register('remember')} />
                </div>
                <Link
                  to="/forgot-password"
                  className="link-underline text-2xs font-medium uppercase tracking-wide text-ink dark:text-cream"
                >
                  {t('auth.forgot')}
                </Link>
              </div>

              <Button type="submit" fullWidth loading={status === 'loading'}>
                {t('auth.login')}
              </Button>
            </form>

            <div className="mt-6 border border-line bg-cream-soft p-4 dark:border-night-border dark:bg-night-soft">
              <div className="flex gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs leading-relaxed text-muted">{t('auth.demoHint')}</p>
                  <p className="mt-2 font-mono text-xs tabular-nums text-ink dark:text-cream">
                    {DEMO_ACCOUNT.email} · {DEMO_PASSWORD}
                  </p>
                  <button
                    type="button"
                    onClick={useDemoAccount}
                    className="link-underline mt-2 text-2xs font-medium uppercase tracking-wide text-ink dark:text-cream"
                  >
                    Use demo account
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="link-underline font-medium text-ink dark:text-cream">
                {t('auth.register')}
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Login;
