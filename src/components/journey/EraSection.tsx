'use client';

import { useTranslations } from 'next-intl';
import type { Era } from '@/content/eras';

interface EraSectionProps {
  era: Era;
  /** Element id used by ScrollTrigger and by the progress rail's anchors. */
  sectionId: string;
}

/**
 * One full-viewport act of the journey.
 *
 * Phases 3 and 4 replace the body of this component with each era's real visual
 * (lamp panel, teletype, CRT, ...). For now it carries only the name, year and
 * placeholder line, which is enough to prove the theme engine switches.
 */
export function EraSection({ era, sectionId }: EraSectionProps) {
  const t = useTranslations('eras');

  return (
    <section
      id={sectionId}
      data-era={era.id}
      data-era-index={era.index}
      aria-labelledby={`${sectionId}-heading`}
      className="ao-themed relative flex min-h-dvh w-full flex-col items-center justify-center px-6 py-24"
    >
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <p className="ao-glow font-mono text-sm tracking-[0.35em] text-muted uppercase">
          {era.year}
        </p>

        <h2
          id={`${sectionId}-heading`}
          className="ao-glow font-display text-3xl leading-tight text-ink sm:text-5xl"
        >
          {t(era.nameKey)}
        </h2>

        <p className="max-w-2xl font-body text-base leading-relaxed text-muted sm:text-lg">
          {t(era.descriptionKey)}
        </p>
      </div>
    </section>
  );
}
