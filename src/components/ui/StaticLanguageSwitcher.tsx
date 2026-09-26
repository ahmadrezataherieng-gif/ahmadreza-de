import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { locales, type Locale } from '@/lib/i18n-config';
import { viewHref, type View } from '@/lib/routing';
import { cn } from '@/lib/cn';

/**
 * The language switcher of the site's own static pages (landing, About, the
 * legal pages), rendered on the server: no client code, no message provider.
 * It is the same markup as `LanguageSwitcher`, which stays for the journey and
 * the desktop, where the current path is only known in the browser - here the
 * page knows its own view.
 */
export async function StaticLanguageSwitcher({ locale, view, className }: { locale: Locale; view: View; className?: string }) {
  const t = await getTranslations({ locale, namespace: 'languages' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <nav
      aria-label={tNav('language')}
      data-language-switcher=""
      className={cn('ao-themed flex items-center gap-1 font-mono text-xs', className)}
    >
      {locales.map((target) => {
        const isActive = target === locale;
        return (
          <Link
            key={target}
            href={viewHref(target, view)}
            hrefLang={target}
            lang={target}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'ao-themed rounded-control border px-2 py-1 transition-colors duration-150',
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:border-edge hover:text-ink',
            )}
          >
            {t(target)}
          </Link>
        );
      })}
    </nav>
  );
}
