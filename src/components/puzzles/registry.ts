'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

import type { EraId } from '@/content/eras';
import type { PuzzleProps } from '@/components/puzzles/engine';

/**
 * One puzzle per era, each in its own chunk. The shell is the same for all
 * seven; only this component changes. Nothing here is server-rendered: puzzle
 * UI never appears in the static HTML.
 */
export const puzzleComponents: Record<EraId, ComponentType<PuzzleProps>> = {
  eniac: dynamic(() => import('@/components/puzzles/PunchCardPuzzle').then((m) => m.PunchCardPuzzle), { ssr: false }),
  batch: dynamic(() => import('@/components/puzzles/SchedulingPuzzle').then((m) => m.SchedulingPuzzle), { ssr: false }),
  unix: dynamic(() => import('@/components/puzzles/ShellPuzzle').then((m) => m.ShellPuzzle), { ssr: false }),
  dos: dynamic(() => import('@/components/puzzles/MemoryPuzzle').then((m) => m.MemoryPuzzle), { ssr: false }),
  macintosh: dynamic(() => import('@/components/puzzles/DragDropPuzzle').then((m) => m.DragDropPuzzle), { ssr: false }),
  win95: dynamic(() => import('@/components/puzzles/SubnetPuzzle').then((m) => m.SubnetPuzzle), { ssr: false }),
  cloud: dynamic(() => import('@/components/puzzles/FirewallPuzzle').then((m) => m.FirewallPuzzle), { ssr: false }),
};

/**
 * How long "Lösung zeigen" takes to play each script, in seconds: slow enough
 * to follow every step, short enough not to feel like a punishment.
 */
export const revealSeconds: Record<EraId, number> = {
  eniac: 7,
  batch: 8,
  unix: 11,
  dos: 9,
  macintosh: 7,
  win95: 8,
  cloud: 6,
};

/**
 * Eras whose insider detail is a working trick in the puzzle. For these, the
 * note appears once the trick was used or the puzzle has ended; the others show
 * it as plain text from the start.
 */
export const erasWithTrick: readonly EraId[] = ['eniac', 'batch', 'unix', 'dos', 'win95'];
