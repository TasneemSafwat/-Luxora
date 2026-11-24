import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, MailCheck, Send } from 'lucide-react';
import { Seo } from '../components/common/Seo';
import { Logo } from '../components/common/Logo';
import { BannerArt } from '../components/banners/BannerArt';
import { AUTH_PHOTOS } from '../utils/bannerPhotos';
import { Button, Input } from '../components/ui';
import { forgotPasswordSchema } from '../utils/validators';
import { pushToast } from '../features/ui/uiSlice';
import { useAppDispatch } from '../app/hooks';
import { useI18n } from '../hooks/useI18n';

const PANEL_BENEFITS = [
  'Secure, single-use reset links',
  'No account details are ever shared',
  'Our client care team is always close',
];

export function ForgotPassword() {
  const dispatch = useAppDispatch();
  const { t } = useI18n();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), mode: 'onBlur' });

  const onSubmit = async ({ email }) => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSentTo(email);
    setSent(true);
    setSending(false);
    dispatch(pushToast({ type: 'success', title: t('auth.resetSent', { email }) }));
  };

  return (
    <>
      <Seo title={t('auth.forgotTitle')} description={t('auth.forgotSubtitle')} />

      <section className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-2">
        {/* Editorial image panel */}
        <div className="relative hidden overflow-hidden lg:block">
          {/* Self-contained artwork: no third-party image request, instant paint. */}
          <BannerArt variant="portrait" src={AUTH_PHOTOS} priority imgClassName="object-[50%_18%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-ink/35" aria-hidden="true" />

          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
            <Logo inverted size="lg" />

            <div className="max-w-sm">
              <p className="font-display text-title text-white">A quiet way back in.</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Tell us where to reach you and we will send a secure link to reset your password.
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

            <p className="eyebrow mt-8 lg:mt-0">{t('eyebrow.recovery')}</p>
            <h1 className="display-title mt-4">{t('auth.forgotTitle')}</h1>
            <p className="prose-lux mt-3">{t('auth.forgotSubtitle')}</p>

            {sent ? (
              <div className="mt-9">
                <div className="flex flex-col items-start gap-5 border border-line p-6 dark:border-night-border">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-gold dark:border-night-border">
                    <MailCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-ash dark:text-cream">
                    {t('auth.resetSent', { email: sentTo })}
                  </p>
                </div>

                <p className="mt-8 text-center text-sm text-muted">
                  <Link to="/login" className="link-underline font-medium text-ink dark:text-cream">
                    {t('auth.backToLogin')}
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-9 space-y-5">
                <Input
                  label={t('auth.email')}
                  type="email"
                  autoComplete="email"
                  leading={Mail}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button type="submit" fullWidth loading={sending}>
                  <Send className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
                  Send reset link
                </Button>
              </form>
            )}

            {!sent && (
              <p className="mt-8 text-center text-sm text-muted">
                <Link to="/login" className="link-underline font-medium text-ink dark:text-cream">
                  {t('auth.backToLogin')}
                </Link>
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default ForgotPassword;
