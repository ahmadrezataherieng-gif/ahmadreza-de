import type { AppId, Era } from '@/content/eras';
import { unlockingEra as eraFor } from '@/lib/unlocks';

/** The era whose puzzle unlocks a bonus app, or undefined for a base app. */
export function unlockingEra(appId: AppId): Era | undefined {
  return eraFor(appId);
}

/**
 * The value the lock messages select on: the era's year, or `today` for the
 * era the journey labels "Heute" rather than with a year that would age.
 */
export function eraYearArgument(era: Era | undefined): string {
  if (!era) return '';
  return era.yearLabelKey ? 'today' : era.year;
}

/** The journey's section for an era: where "Zum Rätsel" takes the visitor. */
export function eraSectionHash(era: Era | undefined): string {
  return era ? `#era-${era.index}` : '';
}
