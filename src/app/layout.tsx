import type { ReactNode } from 'react';

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
