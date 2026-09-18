'use client';

import { create } from 'zustand';

import type { EraId } from '@/content/eras';
import { setScrollLimit } from '@/lib/lenis-controller';
import { JOURNEY_SCENES_ID } from '@/components/puzzles/hold';

/**
 * Play-mode gates (DECISIONS.md 39).
 *
 * In Play mode the visitor cannot scroll past an era's puzzle segment until the
 * era is passed - solved or revealed. The gate is a scroll *limit*: the page
 * ends just after the segment (lenis-controller `setScrollLimit`), with a
 * visible cue that offers the way through.
 *
 * The journey's single resolver feeds this module: `measureGates` after every
 * layout measurement, `tickGate` on every scroll update. It never learns the
 * mode; `configureGates` (called by the puzzle layer) says whether gates apply.
 *
 * Which era gates: the first era that is not passed and whose gate line is
 * still below the top of the viewport. An era the visitor has scrolled past
 * never pulls them back - a reload or a Watch-to-Play switch further down
 * leaves them where they are; scrolling back up above an open question gates
 * it again.
 */

/**
 * Height of the lock cue, in CSS px: `--ao-gate-cue` in globals.css, which also
 * reserves that room at the foot of a gated segment. Read at render time,
 * because phones reserve more.
 */
export function gateCueHeight(element: Element): number {
  return parseFloat(getComputedStyle(element).getPropertyValue('--ao-gate-cue')) || 136;
}

export interface GateMeasure {
  eraId: EraId;
  section: HTMLElement;
  /** Document y where the page ends while this era gates. */
  bottom: number;
}

interface GateView {
  /** The era whose gate is closed right now, or null. */
  gatedEraId: EraId | null;
  /** Document y of the page end while gated. */
  limit: number | null;
  /** A request from the cue for the gated puzzle's shell. */
  request: { eraId: EraId; reveal: boolean; nonce: number } | null;
  requestPuzzle: (eraId: EraId, reveal: boolean) => void;
}

export const useGateStore = create<GateView>((set) => ({
  gatedEraId: null,
  limit: null,
  request: null,
  requestPuzzle: (eraId, reveal) => set({ request: { eraId, reveal, nonce: Date.now() } }),
}));

let enabled = false;
let passed: ReadonlySet<EraId> = new Set();
let measures: GateMeasure[] = [];
let lastScroll = { y: 0, viewport: 0 };

/** Set by the puzzle layer: are gates on (Play mode), and which eras are open. */
export function configureGates(next: { enabled: boolean; passed: readonly EraId[] }): void {
  enabled = next.enabled;
  passed = new Set(next.passed);
  apply();
}

export function isGateActive(): boolean {
  return useGateStore.getState().gatedEraId !== null;
}

/**
 * Where an era's gate ends the page: right after its puzzle segment, before the
 * crossing into the next era. The resolver measures; this only picks.
 */
export function gateBottom(entry: {
  pinned: boolean;
  /** Document y where the puzzle segment ends (pinned layouts). */
  puzzleEnd: number;
  /** The puzzle segment in document flow, if that is the layout. */
  layer: { top: number; height: number } | null;
  /** The section's own bottom, as a last resort. */
  bottom: number;
}): number {
  if (entry.pinned) return entry.puzzleEnd;
  // A gated segment reserves room for the cue at its foot (globals.css,
  // `[data-gated]`), so the page ends exactly where the segment does.
  if (entry.layer) return entry.layer.top + entry.layer.height;
  return entry.bottom;
}

export function measureGates(next: GateMeasure[]): void {
  measures = next;
  apply();
}

export function tickGate(scrollY: number, viewport: number): void {
  lastScroll = { y: scrollY, viewport };
  if (enabled) apply();
}

function apply(): void {
  const store = useGateStore.getState();
  let gate: GateMeasure | undefined;
  if (enabled) {
    // An era whose gate line is already above the viewport is behind the
    // visitor and never pulls them back. One whose line is on screen still
    // gates; the page end then settles on that line.
    gate = measures.find((entry) => !passed.has(entry.eraId) && entry.bottom > lastScroll.y + 2);
  }
  const gatedEraId = gate?.eraId ?? null;
  const limit = gate ? Math.round(gate.bottom) : null;
  if (gatedEraId === store.gatedEraId && limit === store.limit) return;

  for (const entry of measures) {
    if (entry.eraId === gatedEraId) entry.section.dataset.gated = '';
    else delete entry.section.dataset.gated;
  }
  useGateStore.setState({ gatedEraId, limit });
  const container = document.getElementById(JOURNEY_SCENES_ID);
  if (container) setScrollLimit(container, limit);
}
