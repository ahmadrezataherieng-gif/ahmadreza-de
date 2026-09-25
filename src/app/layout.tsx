import type { ReactNode } from 'react';

// Self-hosted fonts and the one stylesheet, here rather than in the locale
// layout so the root 404 page (app/not-found.tsx), which that layout never
// wraps, is styled too.
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
// 400.css, not latin-400 + latin-ext-400: only it carries the unicode-range per
// subset, so the 35 kB latin-ext file is fetched when a page needs it, not on every load.
import '@fontsource/inter/400.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource-variable/vazirmatn/index.css';
import '@fontsource/vt323/latin-400.css';
import '@fontsource/press-start-2p/latin-400.css';
import '@/styles/globals.css';

/**
 * Pass-through root layout.
 *
 * The real <html>/<body> live in `src/app/[[...locale]]/layout.tsx`, because
 * that is the first segment that knows which locale is being rendered and can
 * therefore emit a correct static `lang` and `dir` for SEO.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
