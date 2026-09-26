'use client';

import dynamic from 'next/dynamic';

/**
 * The shell, client-only and in its own chunk. `next/dynamic` with `ssr: false`
 * is the right tool here (CLAUDE.md): nothing of it is server-rendered, so the
 * server-side preloader that broke `useId` inside the journey is not involved.
 * `ShellRoot` is the shell inside its message provider (queue 3c): the provider
 * and the message formatter are part of this chunk group, not of every page.
 */
export const DesktopShellLoader = dynamic(
  () => import('@/components/os/ShellRoot'),
  { ssr: false },
);
