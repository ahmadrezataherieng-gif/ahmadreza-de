'use client';

import type { CSSProperties } from 'react';
import type { Era } from '@/content/eras';
import { EraPlaceholder } from '@/components/journey/eras/EraPlaceholder';
import { eraStaging } from '@/components/journey/eras/registry';

interface EraSectionProps {
  era: Era;
  /** Element id used by the resolver and by the progress rail's anchors. */
  sectionId: string;
}

/**
 * One act of the journey: a tall `<section>` that supplies scroll distance and a
 * sticky stage inside it that holds the era's visual.
 *
 * The section is the element the resolver measures and writes to. It receives
 * `--era-progress` every frame and `data-started` once; everything inside reads
 * those through CSS. Pinning is layout only - which era owns the theme is still
 * decided by the single resolver in Journey.tsx.
 */
export function EraSection({ era, sectionId }: EraSectionProps) {
  const staging = eraStaging[era.id];
  const headingId = `${sectionId}-heading`;
  const Visual = staging.Visual;

  return (
    <section
      id={sectionId}
      data-era={era.id}
      data-era-index={era.index}
      data-start-at={staging.startAt}
      aria-labelledby={headingId}
      className="ao-era-section ao-themed w-full"
      style={{ '--era-length': staging.length } as CSSProperties}
    >
      <div className="ao-era-stage w-full" data-era-stage="">
        {Visual ? <Visual headingId={headingId} /> : <EraPlaceholder era={era} headingId={headingId} />}
      </div>
    </section>
  );
}
