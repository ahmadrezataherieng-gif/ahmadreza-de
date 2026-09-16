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
