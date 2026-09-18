'use client';

import dynamic from 'next/dynamic';

/**
 * The shell, client-only and in its own chunk. `next/dynamic` with `ssr: false`
 * is the right tool here (CLAUDE.md): nothing of it is server-rendered, so the
 * server-side preloader that broke `useId` inside the journey is not involved.
 */
export const DesktopShellLoader = dynamic(
  () => import('@/components/os/Shell').then((module) => module.Shell),
  { ssr: false },
);
