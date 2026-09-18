import type { ComponentType } from 'react';
import type { EraId } from '@/content/eras';

import { EraBatch } from '@/components/journey/eras/EraBatch';
import { EraCloud } from '@/components/journey/eras/EraCloud';
import { EraDos } from '@/components/journey/eras/EraDos';
import { EraEniac } from '@/components/journey/eras/EraEniac';
import { EraMac } from '@/components/journey/eras/EraMac';
import { EraUnix } from '@/components/journey/eras/EraUnix';
import { EraWin95 } from '@/components/journey/eras/EraWin95';

export interface EraStaging {
  /** The era's visual. Receives the id its heading must carry. */
  Visual: ComponentType<{ headingId: string }>;
  /**
   * Pinned scroll distance in viewport heights. Longer means the visitor spends
   * more scroll on the era's scrubbed timeline.
   */
  length: number;
  /**
   * Era progress (0..1) at which one-shot animations - printing, the POST count -
   * start. Since Phase 5.5B the screens are already lit when an era begins (the
   * crossing warms them up), so these start almost immediately.
   */
  startAt: number;
  /**
   * Scroll distance of the era's puzzle segment, in viewport heights, added after
   * the visual. Sized to the puzzle's guided script so playback reads at a calm
   * pace: typing-heavy puzzles get more room than a two-click one.
   */
  puzzleLength: number;
}

/**
 * Staging is layout and timing, not content, so it lives beside the components
 * rather than in `content/eras.ts`.
 */
export const eraStaging: Record<EraId, EraStaging> = {
  eniac: { Visual: EraEniac, length: 2.2, startAt: 0, puzzleLength: 3 },
  batch: { Visual: EraBatch, length: 2.6, startAt: 0, puzzleLength: 2.6 },
  unix: { Visual: EraUnix, length: 3, startAt: 0.02, puzzleLength: 3 },
  dos: { Visual: EraDos, length: 2.6, startAt: 0.02, puzzleLength: 2.4 },
  macintosh: { Visual: EraMac, length: 2.8, startAt: 0, puzzleLength: 2.2 },
  win95: { Visual: EraWin95, length: 3.2, startAt: 0, puzzleLength: 2.8 },
  cloud: { Visual: EraCloud, length: 2.6, startAt: 0.72, puzzleLength: 2 },
};
