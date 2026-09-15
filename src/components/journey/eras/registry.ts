import type { ComponentType } from 'react';
import type { EraId } from '@/content/eras';

import { EraBatch } from '@/components/journey/eras/EraBatch';
import { EraDos } from '@/components/journey/eras/EraDos';
import { EraEniac } from '@/components/journey/eras/EraEniac';
import { EraUnix } from '@/components/journey/eras/EraUnix';

export interface EraStaging {
  /** The finished visual, or undefined while the era still uses the placeholder. */
  Visual?: ComponentType<{ headingId: string }>;
  /**
   * Pinned scroll distance in viewport heights. Longer means the visitor spends
   * more scroll on the era's scrubbed timeline.
   */
  length: number;
  /**
   * Era progress (0..1) at which one-shot animations - printing, the POST count -
   * start. The UNIX screen must be lit before anything prints on it.
   */
  startAt: number;
}

/**
 * Staging is layout and timing, not content, so it lives beside the components
 * rather than in `content/eras.ts`.
 */
export const eraStaging: Record<EraId, EraStaging> = {
  eniac: { Visual: EraEniac, length: 2.2, startAt: 0 },
  batch: { Visual: EraBatch, length: 2.6, startAt: 0 },
  unix: { Visual: EraUnix, length: 3, startAt: 0.3 },
  dos: { Visual: EraDos, length: 2.6, startAt: 0.02 },
  macintosh: { length: 1.4, startAt: 0 },
  win95: { length: 1.4, startAt: 0 },
  cloud: { length: 1.4, startAt: 0 },
};
