import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Twitter,
} from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { pushToast } from '../../features/ui/uiSlice';
import { useI18n } from '../../hooks/useI18n';
import { BRAND, CATEGORY_META } from '../../utils/constants';
import { Button, Input } from '../ui';
import { Logo } from '../common/Logo';

const SOCIALS = [
  { label: 'Instagram', icon: Instagram, href: '#' },
  { label: 'Facebook', icon: Facebook, href: '#' },
  { label: 'Twitter', icon: Twitter, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
];

/** Newsletter capture — shared by the footer and the home page band. */
export function NewsletterForm({ className, compact = false }) {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setEmail('');
    dispatch(pushToast({ type: 'success', title: t('toast.subscribed'), message: t('home.newsletter.success') }));
  };

  return (
    <form onSubmit={submit} className={className} noValidate>
      <div className={compact ? 'flex gap-2' : 'flex flex-col gap-3 sm:flex-row'}>
        <Input
          type="email"
          name="newsletter-email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError('');
          }}
          placeholder="your@email.com"
          aria-label={t('auth.email')}
          error={compact ? undefined : error}
          leading={Mail}
          className="flex-1"
        />
        <Button type="submit" variant="gold" className="shrink-0">
          {t('home.newsletter.cta')}
        </Button>
      </div>
      {compact && error && <p className="field-error">{error}</p>}
    </form>
  );
}

export function Footer() {
  const { t, lang } = useI18n();
  // The home page already ends with a full newsletter banner; repeating the form right below it looked like a mistake.
  const showNewsletter = useLocation().pathname !== '/';

  const shopLinks = Object.entries(CATEGORY_META)
    .slice(0, 6)
    .map(([slug, meta]) => ({ label: lang === 'ar' ? meta.ar : meta.en, to: `/shop?category=${slug}` }));

  const helpLinks = [
    { label: t('footer.shippingInfo'), to: '/shop' },
    { label: t('footer.faq'), to: '/shop' },
    { label: t('footer.contact'), to: '/shop' },
    { label: t('account.orders'), to: '/account?tab=orders' },
  ];

  const companyLinks = [
    { label: t('footer.sustainability'), to: '/' },
    { label: t('footer.careers'), to: '/' },
    { label: t('footer.stores'), to: '/' },
    { label: t('footer.privacy'), to: '/' },
  ];

  return (
    <footer className="border-t border-line bg-cream-soft dark:border-night-border dark:bg-night-soft">
      <div className="lux-container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo size="md" />
            <p className="prose-lux mt-5">{t('footer.aboutText')}</p>

            <ul className="mt-6 space-y-2.5 text-xs text-muted">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Via della Spiga 9, Milan · 42 Chelsea Manor St, London
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="link-underline">
                  {BRAND.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <a href={`mailto:${BRAND.supportEmail}`} className="link-underline">
                  {BRAND.supportEmail}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="footer-shop">
            <h2 id="footer-shop" className="eyebrow">
              {t('footer.shop')}
            </h2>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="link-underline text-sm text-ash/85 hover:text-ink dark:text-cream/75 dark:hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-help">
            <h2 id="footer-help" className="eyebrow">
              {t('footer.help')}
            </h2>
            <ul className="mt-5 space-y-3">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="link-underline text-sm text-ash/85 hover:text-ink dark:text-cream/75 dark:hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className="eyebrow">
              {t('footer.company')}
            </h2>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="link-underline text-sm text-ash/85 hover:text-ink dark:text-cream/75 dark:hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-2 lg:items-end dark:border-night-border">
          {showNewsletter ? (
            <div>
              <h2 className="eyebrow">{t('footer.newsletter')}</h2>
              <p className="prose-lux mt-2 mb-4 max-w-md">{t('home.newsletter.body')}</p>
              <NewsletterForm className="max-w-md" />
            </div>
          ) : (
            <span aria-hidden="true" />
          )}

          <div className="flex flex-wrap items-center gap-5 lg:justify-end">
            <ul className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-ink hover:text-ink dark:border-night-border dark:text-cream/80 dark:hover:border-cream/60 dark:hover:text-cream"
                  >
                    <social.icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            <p className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {t('footer.payments')}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-7 text-xs text-muted md:flex-row md:items-center md:justify-between dark:border-night-border">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. {t('footer.rights')}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li>
              <Link to="/" className="link-underline hover:text-ink dark:hover:text-cream">
                {t('footer.privacy')}
              </Link>
            </li>
            <li>
              <Link to="/" className="link-underline hover:text-ink dark:hover:text-cream">
                {t('footer.terms')}
              </Link>
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5">
                Demo build
                <ArrowRight className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
                Front-end only
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
