import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Mail, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Seo } from '../components/common/Seo';
import { Logo } from '../components/common/Logo';
import { BannerArt } from '../components/banners/BannerArt';
import { AUTH_PHOTOS } from '../utils/bannerPhotos';
import { Button, Checkbox, IconButton, Input } from '../components/ui';
import { passwordStrength, registerSchema } from '../utils/validators';
import { register as registerAccount, selectAuthError, selectAuthStatus } from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../utils/format';

const PANEL_BENEFITS = [
  'Early access to new collections',
  'Private client appointments',
  'Complimentary 30-day returns',
];

const MEMBERSHIP_BENEFITS = [
  { icon: Truck, text: 'Complimentary express shipping on orders over $250' },
  { icon: RotateCcw, text: 'Complimentary returns within 30 days' },
  { icon: ShieldCheck, text: 'Authenticity guaranteed on every piece' },
];

const STRENGTH_TIERS = ['bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

export function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();

  const status = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema), mode: 'onBlur' });

  const strength = passwordStrength(watch('password') || '');
  const hasPassword = Boolean(watch('password'));

  const onSubmit = async (values) => {
    try {
      await dispatch(registerAccount(values)).unwrap();
      dispatch(pushToast({ type: 'success', title: t('auth.welcomeBack', { name: values.firstName }) }));
      navigate('/', { replace: true });
    } catch {
      /* failure is surfaced through selectAuthError */
    }
  };

  const visibilityToggle = (shown, onToggle) => (
    <IconButton
      label={shown ? t('auth.hidePassword') : t('auth.showPassword')}
      size="sm"
      onClick={onToggle}
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </IconButton>
  );

  return (
    <>
      <Seo title={t('auth.registerTitle')} description={t('auth.registerSubtitle')} />

      <section className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
        {/* Editorial image panel */}
        <div className="relative hidden overflow-hidden lg:block">
          {/* Self-contained artwork: no third-party image request, instant paint. */}
          <BannerArt variant="portrait" src={AUTH_PHOTOS} priority imgClassName="object-[50%_18%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-ink/35" aria-hidden="true" />

          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
            <Logo inverted size="lg" />

            <div className="max-w-sm">
              <p className="font-display text-title text-white">Join a house built on craft.</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                We make heirlooms, not trends — pieces designed to outlive the season.
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

            <p className="eyebrow mt-8 lg:mt-0">{t('eyebrow.joinHouse')}</p>
            <h1 className="display-title mt-4">{t('auth.registerTitle')}</h1>
            <p className="prose-lux mt-3">{t('auth.registerSubtitle')}</p>

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

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={t('auth.firstName')}
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label={t('auth.lastName')}
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                leading={Mail}
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div>
                <Input
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  trailing={visibilityToggle(showPassword, () => setShowPassword((value) => !value))}
                  {...register('password')}
                />

                <div className="mt-2.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((index) => (
                      <span
                        key={index}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors duration-400 ease-editorial',
                          index < strength.score ? STRENGTH_TIERS[index] : 'bg-ink-100 dark:bg-night-border',
                        )}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-2xs uppercase tracking-wide text-muted">{t('auth.passwordStrength')}</p>
                    {hasPassword && (
                      <p className="text-2xs uppercase tracking-wide text-ink dark:text-cream">{strength.label}</p>
                    )}
                  </div>
                </div>
              </div>

              <Input
                label={t('auth.confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                trailing={visibilityToggle(showConfirm, () => setShowConfirm((value) => !value))}
                {...register('confirmPassword')}
              />

              <Checkbox label={t('auth.terms')} error={errors.terms?.message} {...register('terms')} />

              <Button type="submit" fullWidth loading={status === 'loading'}>
                {t('auth.register')}
              </Button>
            </form>

            <ul className="mt-8 space-y-3 border-t border-line pt-8 dark:border-night-border">
              {MEMBERSHIP_BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-muted">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-center text-sm text-muted">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="link-underline font-medium text-ink dark:text-cream">
                {t('auth.login')}
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Register;
