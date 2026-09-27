'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { getEra, type EraId } from '@/content/eras';
import { useJourneyStore } from '@/store/journey-store';
import { PuzzleMessages } from '@/components/puzzles/PuzzleMessages';

const PuzzleShell = dynamic(
  () => import('@/components/puzzles/PuzzleShell').then((module) => module.PuzzleShell),
  { ssr: false, loading: () => <SlotPlaceholder /> },
);

interface PuzzleSlotProps {
  eraId: EraId;
  eraIndex: number;
  nextSectionId: string;
  /** The era's insider detail, from the journey's own copy. */
  insider: string;
  /** The era's second fact ("Legende"), from the journey's own copy. */
  legendFact: string;
}

/**
 * Where a puzzle will be. Renders nothing into the static HTML.
 *
 * The shell, the puzzle and the puzzle copy are fetched when the visitor is
 * within one era of this one, and stay mounted afterwards - unmounting on the
 * way back would lose a half-solved puzzle and shift layout for nothing.
 * Height changes are picked up by the journey's section observer.
 */
export function PuzzleSlot({ eraId, eraIndex, nextSectionId, insider, legendFact }: PuzzleSlotProps) {
  const activeIndex = useJourneyStore((state) => getEra(state.activeEraId).index);
  const near = Math.abs(activeIndex - eraIndex) <= 1;
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    if (near) setWanted(true);
  }, [near]);

  return (
    <div data-puzzle-slot={eraId}>
      {wanted ? (
        <PuzzleMessages fallback={<SlotPlaceholder />}>
          <PuzzleShell eraId={eraId} eraIndex={eraIndex} nextSectionId={nextSectionId} insider={insider} legendFact={legendFact} />
        </PuzzleMessages>
      ) : (
        <SlotPlaceholder />
      )}
    </div>
  );
}

function SlotPlaceholder() {
  return <div aria-hidden="true" className="h-24 border-t border-edge" />;
}
