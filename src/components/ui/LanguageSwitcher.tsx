'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale } from '@/lib/i18n-config';
import { localeHref, stripLocale } from '@/lib/routing';
import { cn } from '@/lib/cn';

/**
 * Switches locale while staying on the current page. Rendered as real anchors,
 * so search engines can follow all three language versions and so it keeps
 * working without JavaScript.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const active = useLocale() as Locale;
  const t = useTranslations('languages');
  const tNav = useTranslations('nav');

  const path = stripLocale(pathname ?? '/');

  return (
    <nav
      aria-label={tNav('language')}
      className={cn('ao-themed flex items-center gap-1 font-mono text-xs', className)}
    >
      {locales.map((locale) => {
        const isActive = locale === active;
        return (
          <Link
            key={locale}
            href={localeHref(locale, path)}
            hrefLang={locale}
            lang={locale}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'ao-themed rounded-control border px-2 py-1 transition-colors duration-150 in-data-[style=k6]:rounded-full in-data-[style=k6]:px-2 sm:in-data-[style=k6]:px-3 in-data-[style=k6]:font-semibold',
              isActive
                ? 'border-accent text-accent in-data-[style=k6]:bg-accent in-data-[style=k6]:text-background'
                : 'border-transparent text-muted hover:border-edge hover:text-ink',
            )}
          >
            {t(locale)}
          </Link>
        );
      })}
    </nav>
  );
}
