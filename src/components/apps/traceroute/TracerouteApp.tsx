'use client';

import { AppPlaceholder } from '@/components/apps/AppPlaceholder';
import type { AppProps } from '@/components/apps/types';

/** Placeholder until Phase 7 builds the app. */
export function TracerouteApp({ appId }: AppProps) {
  return <AppPlaceholder appId={appId} />;
}
