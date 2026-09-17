'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

/**
 * The puzzle engine: one state model, three presentations.
 *
 *   play    - the visitor's own input drives a reducer.
 *   guided  - the same reducer is folded over a scripted solution, as far as the
 *             scroll-driven playhead has got. Scrolling back un-does steps.
 *   final   - the whole script applied: the solved frame, for reduced motion.
 *
 * A puzzle is therefore written once, as `initial` + `reduce` + `isSolved` +
 * `script`, and never knows which mode the visitor chose. See DECISIONS.md 37.
 */

export type Presentation = 'play' | 'guided' | 'final';

export type ScriptStep<A> =
  /** Move the pointer to a target and do nothing - a look before acting. */
  | { kind: 'point'; target: string }
  /** Move to a target and act on arrival. `carry` names a dragged target. */
  | { kind: 'act'; target: string; action: A; carry?: string }
  /** Type `text` into a target character by character, then commit. */
  | { kind: 'type'; target: string; text: string; action: A };

export interface PuzzleDefinition<S, A> {
  initial: () => S;
  reduce: (state: S, action: A) => S;
  isSolved: (state: S) => boolean;
  /**
   * The era's period trick (DECISIONS.md 40): true once the visitor has used
   * it. Never required to solve. Scripts demonstrate it once.
   */
  usedTrick?: (state: S) => boolean;
  script: readonly ScriptStep<A>[];
}

/** What the shell gives every puzzle. */
export interface PuzzleProps {
  presentation: Presentation;
  /** Puzzle-segment scroll progress, 0..1. Read only in guided presentation. */
  progress: number;
  /** 1-based era index; decides the pointer's look. */
  eraIndex: number;
  /** Called once when the visitor solves the puzzle in play. */
  onSolved: () => void;
  /** Called once when the visitor uses the era's trick in play. */
  onTrick: () => void;
}

/** Guided playback runs over this window of the puzzle segment's progress. */
export const GUIDED_START = 0.1;
export const GUIDED_END = 0.82;

/** Where inside one step the action lands, and when typing runs. */
const ACT_AT = 0.55;
const TYPE_FROM = 0.2;
const TYPE_TO = 0.8;
const COMMIT_AT = 0.92;

export interface GuidedPointer {
  target: string;
  /** The target being dragged along, while it is in transit. */
  carry: string | null;
  /** True for the moment of the click. */
  pressed: boolean;
}

export interface PuzzleEngine<S, A> {
  state: S;
  /** No-op outside play, so guided controls can never change anything. */
  dispatch: (action: A) => void;
  interactive: boolean;
  pointer: GuidedPointer | null;
  /** Text being typed into `target` by guided playback, or null. */
  typingFor: (target: string) => string | null;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** How many script steps have committed at a given playhead. */
function appliedCount<A>(script: readonly ScriptStep<A>[], playhead: number): number {
  let count = 0;
  script.forEach((step, index) => {
    const local = playhead - index;
    if (step.kind === 'act' && local >= ACT_AT) count = index + 1;
    if (step.kind === 'type' && local >= COMMIT_AT) count = index + 1;
    if (step.kind === 'point' && local >= ACT_AT) count = index + 1;
  });
  return count;
}

export function usePuzzleEngine<S, A>(
  definition: PuzzleDefinition<S, A>,
  { presentation, progress, onSolved, onTrick }: PuzzleProps,
): PuzzleEngine<S, A> {
  const { script, reduce, initial, isSolved, usedTrick } = definition;
  const [played, playDispatch] = useReducer(reduce, undefined, initial);

  const steps = script.length;
  const playhead =
    presentation === 'final'
      ? steps
      : presentation === 'guided'
        ? clamp01((progress - GUIDED_START) / (GUIDED_END - GUIDED_START)) * steps
        : 0;
  const applied = presentation === 'play' ? 0 : appliedCount(script, playhead);

  // Folding is recomputed only when a step commits or un-commits, never per
  // progress tick.
  const scripted = useMemo(() => {
    let state = initial();
    for (const step of script.slice(0, applied)) {
      if (step.kind !== 'point') state = reduce(state, step.action);
    }
    return state;
  }, [applied, initial, reduce, script]);

  const interactive = presentation === 'play';
  const state = interactive ? played : scripted;

  const solvedReported = useRef(false);
  const solved = interactive && isSolved(played);
  useEffect(() => {
    if (solved && !solvedReported.current) {
      solvedReported.current = true;
      onSolved();
    }
  }, [solved, onSolved]);

  const trickReported = useRef(false);
  const trick = interactive && (usedTrick?.(played) ?? false);
  useEffect(() => {
    if (trick && !trickReported.current) {
      trickReported.current = true;
      onTrick();
    }
  }, [trick, onTrick]);

  const dispatch = useCallback(
    (action: A) => {
      if (interactive) playDispatch(action);
    },
    [interactive],
  );

  let pointer: GuidedPointer | null = null;
  let typing: { target: string; text: string } | null = null;

  if (presentation === 'guided' && steps > 0 && playhead > 0) {
    const index = Math.min(steps - 1, Math.floor(playhead));
    const step = script[index];
    const local = playhead - index;
    if (step) {
      const done = local >= (step.kind === 'type' ? COMMIT_AT : ACT_AT);
      pointer = {
        target: step.target,
        carry: step.kind === 'act' && step.carry && !done ? step.carry : null,
        pressed: step.kind === 'act' && local >= ACT_AT - 0.1 && local < ACT_AT + 0.12,
      };
      if (step.kind === 'type' && !done) {
        const share = clamp01((local - TYPE_FROM) / (TYPE_TO - TYPE_FROM));
        typing = { target: step.target, text: step.text.slice(0, Math.round(step.text.length * share)) };
      }
    }
  }

  const typingFor = (target: string) => (typing && typing.target === target ? typing.text : null);

  return { state, dispatch, interactive, pointer, typingFor };
}

/** Attribute helper: every element a script can point at carries this. */
export function target(id: string): { 'data-target': string } {
  return { 'data-target': id };
}
