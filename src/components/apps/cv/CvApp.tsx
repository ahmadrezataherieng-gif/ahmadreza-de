'use client';

import { useTranslations } from 'next-intl';

import { AppPlaceholder } from '@/components/apps/AppPlaceholder';
import type { AppProps } from '@/components/apps/types';
import { RESUME } from '@/content/profile';

/**
 * The résumé download already works here. Until the PDF exists (RESUME.available)
 * it is disabled text, never a link into a 404 - as on the landing page.
 */
export function CvApp({ appId }: AppProps) {
  const t = useTranslations('os.cv');
  return (
    <AppPlaceholder appId={appId}>
      {RESUME.available ? (
        <a
          href={RESUME.href}
          download
          data-action="resume-download"
          className="ao-themed inline-flex w-fit items-center gap-2 rounded-control border border-accent bg-accent px-4 py-2 font-mono text-sm tracking-wide text-background uppercase hover:bg-accent-muted"
        >
          {t('download')}
        </a>
      ) : (
        <p className="w-fit rounded-control border border-edge px-4 py-2 font-mono text-sm text-muted" aria-disabled="true">
          {t('pending')}
        </p>
      )}
    </AppPlaceholder>
  );
}
