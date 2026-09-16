'use client';

import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import type { Era } from '@/content/eras';
import { eraStaging } from '@/components/journey/eras/registry';
import { PuzzleSlot } from '@/components/puzzles/PuzzleSlot';

interface EraSectionProps {
  era: Era;
  /** Element id used by the resolver and by the progress rail's anchors. */
  sectionId: string;
  /** Where "skip" and "continue" take the visitor. */
  nextSectionId: string;
}

/**
 * One act of the journey: a tall `<section>` that supplies scroll distance and a
 * sticky stage inside it holding the era's visual, followed by the era's puzzle
 * segment.
 *
 * The section is the element the resolver measures and writes to. It receives
 * `--era-progress`, `--puzzle-progress` and `--section-progress` every frame and
 * `data-started` once; everything inside reads those through CSS.
 *
 * The visual keeps exactly the pinned scroll distance it had before puzzles
 * existed: `data-visual-share` tells the resolver which part of the pin belongs
 * to it. The visual never learns that a puzzle follows, or which mode is active.
 *
 * The era's one truth and its insider detail are rendered here, on the server,
 * so they are in the static HTML for every visitor. The puzzle itself is not:
 * the slot mounts it client-side, on demand.
 */
export function EraSection({ era, sectionId, nextSectionId }: EraSectionProps) {
  const t = useTranslations('eras');
  const tJourney = useTranslations('journey');
  const staging = eraStaging[era.id];
  const headingId = `${sectionId}-heading`;
  const Visual = staging.Visual;

  const total = staging.length + staging.puzzleLength;
  // Pinned travel is (length - 1) viewports; keep the visual's part of it intact.
  const visualShare = (staging.length - 1) / (total - 1);

  return (
    <section
      id={sectionId}
      data-era={era.id}
      data-era-index={era.index}
      data-start-at={staging.startAt}
      data-visual-share={visualShare.toFixed(4)}
      aria-labelledby={headingId}
      className="ao-era-section ao-themed w-full"
      style={{ '--era-length': total, '--puzzle-length': staging.puzzleLength } as CSSProperties}
    >
      <div className="ao-era-stage w-full" data-era-stage="">
        <Visual headingId={headingId} />

        <div className="ao-puzzle-layer" data-puzzle-layer="">
          <div className="ao-puzzle-scrim" aria-hidden="true" />
          <div className="ao-puzzle-sticky" data-puzzle-sticky="" data-lenis-prevent="">
            <div className="ao-puzzle-card ao-themed flex w-full max-w-3xl flex-col gap-4 rounded-window border border-edge bg-surface p-4 text-ink shadow-window sm:p-6">
              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                  {tJourney('truthLabel')}
                </p>
                <p className="font-body text-lg leading-snug font-bold text-ink sm:text-xl">
                  {t(era.descriptionKey)}
                </p>
                <p className="font-body text-sm leading-relaxed text-muted">
                  <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">
                    {tJourney('insiderLabel')}
                  </span>
                  {t(`${era.id}.insider`)}
                </p>
              </div>

              <PuzzleSlot eraId={era.id} eraIndex={era.index} nextSectionId={nextSectionId} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
