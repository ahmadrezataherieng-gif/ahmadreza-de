'use client';

import { useTranslations } from 'next-intl';

import { AppPlaceholder } from '@/components/apps/AppPlaceholder';
import type { AppProps } from '@/components/apps/types';
import { eraYearArgument, unlockingEra } from '@/components/apps/unlock';

/**
 * One stand-in for all seven bonus apps: each is unlocked by its era's puzzle
 * and built in Phase 9. It names the era that unlocked it.
 */
export function BonusApp({ appId }: AppProps) {
  const t = useTranslations('os');
  return <AppPlaceholder appId={appId} body={t('bonusBody', { year: eraYearArgument(unlockingEra(appId)) })} />;
}
