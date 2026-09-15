'use client';

import { useTranslations } from 'next-intl';
import type { Era } from '@/content/eras';
import { EraTitle } from '@/components/journey/eras/EraTitle';

/**
 * Eras 5 to 7 until Phase 4 gives them real visuals: name, year and one line,
 * inside the same pinned stage as the finished eras so the journey never shows
 * an empty viewport at a boundary.
 */
export function EraPlaceholder({ era, headingId }: { era: Era; headingId: string }) {
  const t = useTranslations('eras');

  return (
    <div className="ao-era-exit relative flex min-h-dvh w-full items-center justify-center bg-background px-6 py-24 md:h-full">
      <EraTitle
        year={era.year}
        title={t(era.nameKey)}
        headingId={headingId}
        className="w-full max-w-3xl"
      >
        <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-muted sm:text-lg">
          {t(era.descriptionKey)}
        </p>
      </EraTitle>
    </div>
  );
}
