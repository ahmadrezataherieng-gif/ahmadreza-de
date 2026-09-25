'use client';

import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import type { Era } from '@/content/eras';
import { EraBridge } from '@/components/journey/EraBridge';
import { eraStaging } from '@/components/journey/eras/registry';
import { PuzzleSlot } from '@/components/puzzles/PuzzleSlot';

import { BOUNDARY_LENGTH, crossingLength } from '@/components/journey/crossing-timing';
import { techCount } from '@/content/crossings';

export { BOUNDARY_LENGTH };

interface EraSectionProps {
  era: Era;
  /** Element id used by the resolver and by the progress rail's anchors. */
  sectionId: string;
  /** Where "continue" takes the visitor. */
  nextSectionId: string;
  /** The era before this one: the crossing it arrives through. */
  previous: Era | null;
}

/**
 * One act of the journey: a tall `<section>` that supplies scroll distance and a
 * sticky stage inside it holding the crossing into this era, the era's visual
 * and its puzzle segment.
 *
 * The section is the element the resolver measures. It writes each progress
 * value only onto the subtree that reads it - `--era-progress` on the scene,
 * `--boundary-in` on the scene and the crossing, `--boundary-out` on the scene
 * and the puzzle layer, `--puzzle-progress` on the puzzle layer - and marks the
 * section itself with `data-started`, `data-crossing` and `data-puzzle-live`.
 * The zero-height `.ao-mark` elements mark where each phase begins, so the
 * resolver reads exact pixels.
 *
 * Every section carries its own era's palette (`data-theme-scope`): during a
 * crossing two eras are on screen at once, and each has to keep its own
 * colours, fonts and effects. The document theme - the chrome - switches at the
 * midpoint of the crossing.
 *
 * The era's one truth is rendered here, on the server, so it is in the static
 * HTML for every visitor. The puzzle is not: the slot mounts it client-side, on
 * demand, and shows the insider detail once it has earned its place. The static
 * SEO list in page.tsx carries every insider detail for crawlers.
 */
export function EraSection({ era, sectionId, nextSectionId, previous }: EraSectionProps) {
  const t = useTranslations('eras');
  const tJourney = useTranslations('journey');
  const staging = eraStaging[era.id];
  const headingId = `${sectionId}-heading`;
  const Visual = staging.Visual;

  // Scroll distance, in viewport heights: the crossing in, the visual's own
  // travel, the puzzle segment, then the crossing out into the next era.
  // Each crossing has its own length: a card per technology (BR-10).
  const inLength = previous ? crossingLength(techCount(previous.id)) : 0;
  const visualLength = staging.length - 1;
  const total = inLength + staging.length + staging.puzzleLength + crossingLength(techCount(era.id));

  return (
    <section
      id={sectionId}
      data-era={era.id}
      data-era-index={era.index}
      data-start-at={staging.startAt}
      data-theme-scope={era.themeId}
      data-follows={previous ? '' : undefined}
      // Every era but the first starts below the fold: marked here so the resolver's
      // first pass writes nothing (each toggle restyled the whole section, PERF-02).
      data-off-screen={previous ? '' : undefined}
      aria-labelledby={headingId}
      className="ao-era-section ao-themed w-full"
      style={
        {
          '--era-length': total,
          '--puzzle-length': staging.puzzleLength,
          '--boundary-length': inLength || BOUNDARY_LENGTH,
        } as CSSProperties
      }
    >
      <span className="ao-mark" data-mark="visual" style={{ '--mark': inLength } as CSSProperties} />
      <span
        className="ao-mark"
        data-mark="puzzle"
        style={{ '--mark': inLength + visualLength } as CSSProperties}
      />
      <span
        className="ao-mark"
        data-mark="out"
        style={{ '--mark': inLength + visualLength + staging.puzzleLength } as CSSProperties}
      />

      <div className="ao-era-stage w-full" data-era-stage="">
        {previous ? (
          <EraBridge kind={previous.id} fromTheme={previous.themeId} toTheme={era.themeId} />
        ) : null}

        <div className="ao-era-scene w-full" data-era-scene="">
          <div className="ao-era-backdrop" aria-hidden="true">
            <span className="ao-depth-extra ao-era-dust" />
          </div>
          <div className="ao-camera w-full">
            <Visual headingId={headingId} />
          </div>
        </div>

        <div className="ao-puzzle-layer" data-puzzle-layer="">
          <div className="ao-puzzle-scrim" aria-hidden="true" />
          <div className="ao-puzzle-sticky" data-puzzle-sticky="">
            <div className="ao-puzzle-card ao-themed flex w-full max-w-3xl flex-col gap-4 rounded-window border border-edge bg-surface p-4 text-ink shadow-window sm:p-6">
              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                  {tJourney('truthLabel')}
                </p>
                <p className="font-body text-lg leading-snug font-bold text-ink sm:text-xl">
                  {t(era.descriptionKey)}
                </p>
              </div>

              <PuzzleSlot
                eraId={era.id}
                eraIndex={era.index}
                nextSectionId={nextSectionId}
                insider={t(`${era.id}.insider`)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
