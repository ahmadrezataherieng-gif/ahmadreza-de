import { eras, type AppId, type Era } from '@/content/eras';

/** The era whose puzzle unlocks a bonus app, or undefined for a base app. */
export function unlockingEra(appId: AppId): Era | undefined {
  return eras.find((era) => era.unlocksApp === appId);
}

/**
 * The value the lock messages select on: the era's year, or `today` for the
 * era the journey labels "Heute" rather than with a year that would age.
 */
export function eraYearArgument(era: Era | undefined): string {
  if (!era) return '';
  return era.yearLabelKey ? 'today' : era.year;
}
