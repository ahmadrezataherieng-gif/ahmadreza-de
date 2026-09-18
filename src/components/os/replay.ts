'use client';

import { allowJourneyReplay } from '@/lib/returning';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/** "Reise erneut ansehen": open the journey without the returning-visitor redirect. */
export function replayJourney(locale: Locale): void {
  allowJourneyReplay();
  window.location.assign(viewHref(locale, 'journey'));
}
