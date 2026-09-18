'use client';

import { useTranslations } from 'next-intl';

import { AppPlaceholder } from '@/components/apps/AppPlaceholder';
import type { AppProps } from '@/components/apps/types';
import { EMAIL } from '@/content/profile';

/**
 * The email already works here - once the address is confirmed
 * (EMAIL.available). Until then no mailto link exists at all, so the
 * placeholder address can never be mailed or scraped.
 */
export function ContactApp({ appId }: AppProps) {
  const t = useTranslations('os.contact');
  return (
    <AppPlaceholder appId={appId}>
      {EMAIL.available ? (
        <a
          href={`mailto:${EMAIL.address}`}
          data-action="email"
          className="ao-themed inline-flex w-fit items-center gap-2 rounded-control border border-accent px-4 py-2 font-mono text-sm text-accent hover:bg-elevated"
        >
          {t('email')}
          <span dir="ltr" className="text-ink">
            {EMAIL.address}
          </span>
        </a>
      ) : (
        <p className="w-fit rounded-control border border-edge px-4 py-2 font-mono text-sm text-muted">{t('pending')}</p>
      )}
    </AppPlaceholder>
  );
}
