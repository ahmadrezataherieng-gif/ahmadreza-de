import { cn } from '@/lib/cn';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/**
 * A translate function for the `nav` namespace: `getTranslations('nav')` on the
 * server, `useTranslations('nav')` in the journey's and the desktop's client
 * chrome. It comes in as a parameter, and this module imports no message
 * library at all: a server module that imports `next-intl` puts the client
 * message provider into the page's script list (queue 3c).
 */
export type NavText = (key: 'legal' | 'imprint' | 'privacy' | 'about') => string;

/**
 * The legal links, one click from every page (§ 5 DDG wants the Impressum
 * "leicht erkennbar, unmittelbar erreichbar"). Plain anchors in the static
 * HTML, so they work without JavaScript and every crawler sees them. The
 * labels are exactly "Impressum" and "Datenschutz" in German.
 */
export function LegalLinks({
  locale,
  t,
  className,
  linkClassName,
}: {
  locale: Locale;
  t: NavText;
  className?: string;
  linkClassName?: string;
}) {
  const link = cn(
    'ao-themed rounded-control px-1 py-0.5 text-muted underline-offset-4 hover:text-ink hover:underline',
    linkClassName,
  );

  return (
    // CONTENT-TODO CR-1052
    <nav aria-label={t('legal')} className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 font-mono', className)}>
      <a href={viewHref(locale, 'imprint')} className={link} data-action="imprint">
        {t('imprint')}
      </a>
      <a href={viewHref(locale, 'privacy')} className={link} data-action="privacy">
        {t('privacy')}
      </a>
    </nav>
  );
}

/**
 * A page footer: the static About page - a plain link, so crawlers find the
 * indexable text from every page that has a footer - then the legal links.
 */
export function SiteFooter({ locale, t, className }: { locale: Locale; t: NavText; className?: string }) {
  return (
    <footer className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs', className)}>
      <a
        href={viewHref(locale, 'about')}
        className="ao-themed rounded-control px-1 py-0.5 text-muted underline-offset-4 hover:text-ink hover:underline"
        data-action="about-page"
      >
        {t('about')}
      </a>
      <LegalLinks locale={locale} t={t} />
    </footer>
  );
}
