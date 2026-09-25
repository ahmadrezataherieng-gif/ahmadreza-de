import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/**
 * The legal links, one click from every page (§ 5 DDG wants the Impressum
 * "leicht erkennbar, unmittelbar erreichbar"). Plain anchors in the static
 * HTML, so they work without JavaScript and every crawler sees them. The
 * labels are exactly "Impressum" and "Datenschutz" in German.
 *
 * Synchronous and hook-based on purpose: the same component renders in the
 * server-rendered pages and inside the journey's client chrome.
 */
export function LegalLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('nav');
  const link = cn(
    'ao-themed rounded-control px-1 py-0.5 text-muted underline-offset-4 hover:text-ink hover:underline',
    linkClassName,
  );

  return (
    // CONTENT-TODO CR-1052
    <nav aria-label={t('legal')} className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 font-mono in-data-[style=k6]:font-body', className)}>
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
export function SiteFooter({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('nav');
  return (
    <footer className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs in-data-[style=k6]:font-body in-data-[style=k6]:text-sm', className)}>
      <a
        href={viewHref(locale, 'about')}
        className="ao-themed rounded-control px-1 py-0.5 text-muted underline-offset-4 hover:text-ink hover:underline"
        data-action="about-page"
      >
        {t('about')}
      </a>
      <LegalLinks />
    </footer>
  );
}
