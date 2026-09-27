import type { View } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/** Views with their own share image (`scripts/og-image.mjs`); every other view keeps the landing card. */
const OG_VIEWS: readonly View[] = ['journey', 'desktop', 'about'];

/** The og:image/twitter:image file for a view: its own card, or the landing card for every other view. */
export function ogImageName(view: View, locale: Locale): string {
  return OG_VIEWS.includes(view) ? `ahmadreza-taheri-${view}-${locale}` : `ahmadreza-taheri-${locale}`;
}
