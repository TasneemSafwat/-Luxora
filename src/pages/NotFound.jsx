import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Seo } from '../components/common/Seo';
import { Button } from '../components/ui';
import { CATEGORY_META, CATEGORY_ORDER } from '../utils/constants';
import { useI18n } from '../hooks/useI18n';

const SUGGESTED = CATEGORY_ORDER.slice(0, 3);

export function NotFound() {
  const { t, lang } = useI18n();

  return (
    <>
      <Seo title={t('state.notFound')} noIndex />

      <section className="lux-container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full max-w-2xl flex-col items-center"
        >
          <span
            aria-hidden="true"
            className="select-none font-display text-[6.5rem] leading-none text-muted/40 [-webkit-text-fill-color:transparent] dark:text-cream/25 md:text-[10rem]"
            style={{ WebkitTextStroke: '1px currentColor' }}
          >
            404
          </span>

          <p className="eyebrow mt-8">Error 404</p>
          <h1 className="display-title mt-4">{t('state.notFound')}</h1>
          <p className="prose-lux mt-4 max-w-md text-pretty">{t('state.notFoundBody')}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button to="/">{t('state.goHome')}</Button>
            <Button to="/shop" variant="outline">
              {t('common.continueShopping')}
            </Button>
          </div>

          <div className="mt-14 w-full border-t border-line pt-8 dark:border-night-border">
            <p className="eyebrow">{t('eyebrow.discover')}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {SUGGESTED.map((slug) => (
                <Link
                  key={slug}
                  to={`/shop?category=${slug}`}
                  className="link-underline text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:text-ink dark:hover:text-cream"
                >
                  {lang === 'ar' ? CATEGORY_META[slug].ar : CATEGORY_META[slug].en}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

export default NotFound;
