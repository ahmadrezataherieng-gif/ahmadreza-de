'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';

import { getEra, type EraId } from '@/content/eras';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { count } from '@/lib/count';
import { eraSolved, publicCount } from '@/lib/counters';
import { usePublicCounts } from '@/lib/use-public-counts';
import { keepScrollAnchor, scrollToEra } from '@/lib/lenis-controller';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { DEFAULT_MODE, useUnlockStore } from '@/store/unlock-store';
import { usePuzzleProgressStore } from '@/store/puzzle-progress-store';
import { GUIDED_END, GUIDED_START, type Presentation } from '@/components/puzzles/engine';
import { useGateStore } from '@/components/puzzles/gate';
import { HeldDialog } from '@/components/puzzles/HeldDialog';
import { erasWithTrick, puzzleComponents, revealSeconds } from '@/components/puzzles/registry';

interface PuzzleShellProps {
  eraId: EraId;
  eraIndex: number;
  /** Where Continue (and Watch mode's Skip) take the visitor. */
  nextSectionId: string;
  /** The era's insider detail, already translated. */
  insider: string;
}

/** What the dialog is doing: the visitor plays, or the solution plays itself. */
type Run = { kind: 'play' } | { kind: 'reveal'; progress: number };

/**
 * Everything around a puzzle that is the same for all seven.
 *
 * Watch mode: the puzzle plays itself inline as the page scrolls; the visitor
 * can take over ("Selbst probieren") or skip ahead. Nothing gates.
 * Play mode: the puzzle is a gate (DECISIONS.md 39). The inline invitation
 * offers Start and "Lösung zeigen"; the dialog offers "Hinweis" and "Lösung
 * zeigen" from the first moment. Solving awards the artifact and opens the
 * gate; a shown solution opens the gate only.
 *
 * The mode is read here and nowhere below: the puzzle receives a presentation,
 * and the era visual never learns either. See DECISIONS.md 33 and 37.
 */
export function PuzzleShell({ eraId, eraIndex, nextSectionId, insider }: PuzzleShellProps) {
  const t = useTranslations(`puzzles.${eraId}`);
  const tc = useTranslations('puzzles.common');
  const Puzzle = puzzleComponents[eraId];
  const artifact = getEra(eraId).artifact;

  const mode = useUnlockStore((state) => state.mode) ?? DEFAULT_MODE;
  const setMode = useUnlockStore((state) => state.setMode);
  const solvePuzzle = useUnlockStore((state) => state.solvePuzzle);
  const revealPuzzle = useUnlockStore((state) => state.revealPuzzle);
  const skipPuzzle = useUnlockStore((state) => state.skipPuzzle);
  const watchPuzzle = useUnlockStore((state) => state.watchPuzzle);
  const earnLegend = useUnlockStore((state) => state.earnLegend);
  const solved = useUnlockStore((state) => state.artifacts.includes(artifact));
  const passed = useUnlockStore((state) => state.passedEras.includes(eraId));
  const legend = useUnlockStore((state) => state.legendEras.includes(eraId));
  const reduced = useReducedMotion();

  // Only guided playback follows the scroll; Play mode must not re-render on
  // every published progress step.
  const guided = mode === 'guided';
  const progress = usePuzzleProgressStore((state) => (guided ? (state.progress[eraId] ?? 0) : 0));

  const [held, setHeld] = useState(false);
  const [hint, setHint] = useState(false);
  const [outcome, setOutcome] = useState<'solved' | 'revealed' | null>(null);
  const [run, setRun] = useState<Run>({ kind: 'play' });
  const [attempt, setAttempt] = useState(0);
  const pendingScroll = useRef<string | null>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);

  const open = useCallback((reveal: boolean) => {
    setHint(false);
    setOutcome(null);
    setAttempt((value) => value + 1);
    setRun(reveal ? { kind: 'reveal', progress: GUIDED_START } : { kind: 'play' });
    setHeld(true);
  }, []);

  const close = useCallback(() => setHeld(false), []);

  const leaveTo = (id: string) => {
    pendingScroll.current = id;
    setHeld(false);
  };

  const tryMyself = () => {
    keepScrollAnchor(() => setMode('interactive'));
    open(false);
  };

  const skipAhead = () => {
    skipPuzzle(eraId);
    scrollToEra(nextSectionId);
  };

  // Only a solve by the visitor's own hand reaches this: guided playback
  // passes `noop`, and the engine reports a solve in the play presentation
  // only, so a shown solution is never counted either (DECISIONS.md 56).
  const onSolved = useCallback(() => {
    setOutcome('solved');
    solvePuzzle(eraId);
    count(eraSolved(eraId));
  }, [eraId, solvePuzzle]);

  const onTrick = useCallback(() => earnLegend(eraId), [eraId, earnLegend]);

  // The lock cue at the end of a gated page asks for this puzzle.
  const request = useGateStore((state) => state.request);
  const handled = useRef<number | null>(null);
  useEffect(() => {
    if (!request || request.eraId !== eraId || handled.current === request.nonce || guided) return;
    handled.current = request.nonce;
    open(request.reveal);
  }, [request, eraId, guided, open]);

  // "Lösung zeigen": the guided script, played by time instead of by scroll.
  const revealing = run.kind === 'reveal';
  useEffect(() => {
    if (!revealing || !held) return;
    if (reduced) {
      setRun({ kind: 'reveal', progress: 1 });
      return;
    }
    const duration = revealSeconds[eraId] * 1000;
    const started = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const share = Math.min(1, (now - started) / duration);
      setRun({ kind: 'reveal', progress: GUIDED_START + share * (1 - GUIDED_START) });
      if (share < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [revealing, held, reduced, eraId]);

  const revealDone = run.kind === 'reveal' && run.progress >= 1;
  useEffect(() => {
    if (!revealDone || outcome !== null) return;
    setOutcome('revealed');
    revealPuzzle(eraId);
  }, [revealDone, outcome, revealPuzzle, eraId]);

  // The dialog releases the page in its unmount cleanup, which runs before
  // this effect - so the scroll happens on a page that can move again.
  useEffect(() => {
    if (held || pendingScroll.current === null) return;
    const id = pendingScroll.current;
    pendingScroll.current = null;
    const frame = requestAnimationFrame(() => scrollToEra(id));
    return () => cancelAnimationFrame(frame);
  }, [held]);

  useEffect(() => {
    if (outcome) continueRef.current?.focus({ preventScroll: true });
  }, [outcome]);

  // Switching to Watch while playing ends the hold (the switch also asks for
  // it; this keeps the two from ever disagreeing).
  const dialogOpen = held && !guided;

  const title = t('title');
  const guidedDone = reduced || progress >= GUIDED_END;

  // A demonstration watched to its end unlocks the era's bonus app - never the
  // artifact, a badge or a count, which stay a solve by hand's (DECISIONS.md 57).
  // Under reduced motion the finished frame is all there is to watch.
  useEffect(() => {
    if (guided && guidedDone) watchPuzzle(eraId);
  }, [guided, guidedDone, watchPuzzle, eraId]);
  const hasTrick = erasWithTrick.includes(eraId);
  const insiderEarned = !hasTrick || legend || (guided ? guidedDone : passed);
  const insiderNote = (
    <p className="font-body text-sm leading-relaxed text-muted">
      <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">{tc('insiderLabel')}</span>
      {insider}
    </p>
  );

  const status = guided ? tc('optional') : solved ? tc('solved') : passed ? tc('revealed') : null;

  const presentation: Presentation = run.kind === 'play' ? 'play' : reduced ? 'final' : 'guided';

  return (
    <div className="flex flex-col gap-3 border-t border-edge pt-4" data-puzzle={eraId}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-display text-base font-bold text-ink">{title}</h3>
        {status ? <span className="font-mono text-[11px] tracking-wide text-muted uppercase">{status}</span> : null}
        {guided && !reduced ? (
          <span className="font-mono text-[11px] tracking-wide text-accent uppercase">{tc('watching')}</span>
        ) : null}
      </div>

      {guided ? (
        <>
          {/* A demonstration, not a control: inert, so it takes no focus or
              clicks. Its content is summarised for screen readers below. */}
          <div inert aria-hidden="true">
            <Puzzle
              presentation={reduced ? 'final' : 'guided'}
              progress={progress}
              eraIndex={eraIndex}
              onSolved={noop}
              onTrick={noop}
            />
          </div>
          <p className="ao-sr-only">
            {tc('summaryLabel')}: {t('task')} {t('answer')} {t('success')}
          </p>
          <p
            aria-hidden="true"
            className={cn(
              'font-body text-sm leading-relaxed text-success transition-opacity duration-300',
              guidedDone ? 'opacity-100' : 'opacity-0',
            )}
          >
            {t('success')}
          </p>
        </>
      ) : (
        <>
          <p className="font-body text-sm leading-relaxed text-ink">{passed ? t('success') : t('invitation')}</p>
          {passed ? null : <p className="font-body text-xs leading-relaxed text-muted">{tc('gateNote')}</p>}
        </>
      )}

      {insiderEarned ? insiderNote : null}

      {/* The way on must stay visible: when the card is taller than its panel,
          the actions stick to the panel's bottom edge. */}
      <div className="ao-puzzle-actions flex flex-wrap items-center gap-2">
        {guided ? (
          <>
            <Button variant="primary" size="sm" onClick={tryMyself} data-action="try">
              {tc('tryMyself')}
            </Button>
            <Button variant="ghost" size="sm" onClick={skipAhead} data-action="skip">
              {t('skip')}
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" size="sm" onClick={() => open(false)} data-action="start">
              {passed ? tc('playAgain') : tc('start')}
            </Button>
            {passed ? null : (
              <Button variant="ghost" size="sm" onClick={() => open(true)} data-action="reveal">
                {tc('reveal')}
              </Button>
            )}
          </>
        )}
      </div>

      {dialogOpen ? (
        <HeldDialog label={tc('dialogLabel', { title })} eraId={eraId} onRequestClose={close}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="min-w-0 font-display text-lg font-bold text-ink sm:text-xl">{title}</h2>
            <Button variant="ghost" size="sm" onClick={close} aria-label={tc('close')} className="ms-auto" data-action="close">
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </Button>
          </div>

          <p className="font-body text-sm leading-relaxed text-ink">
            <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">{tc('taskLabel')}</span>
            {t('task')}
          </p>

          {outcome === null ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHint(true)}
                  disabled={hint || revealing}
                  data-action="hint"
                >
                  {tc('hint')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRun({ kind: 'reveal', progress: GUIDED_START })}
                  disabled={revealing}
                  data-action="reveal"
                >
                  {tc('reveal')}
                </Button>
                {revealing ? (
                  <span className="font-mono text-[11px] tracking-wide text-accent uppercase">{tc('revealing')}</span>
                ) : null}
              </div>
              <div aria-live="polite">
                {hint ? (
                  <p className="font-body text-sm leading-relaxed text-ink">
                    <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">{tc('hintLabel')}</span>
                    {t('hint')}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div inert={revealing} className={cn(revealing && 'pointer-events-none')}>
            <Puzzle
              key={attempt}
              presentation={presentation}
              progress={run.kind === 'reveal' ? run.progress : 0}
              eraIndex={eraIndex}
              onSolved={onSolved}
              onTrick={onTrick}
            />
          </div>

          {outcome ? (
            <div ref={outcomeRef} role="status" className="flex flex-col gap-3 rounded-control border border-success p-3">
              <p className="font-body text-sm leading-relaxed text-ink">
                <span className="me-1.5 font-mono text-[11px] tracking-wide text-success uppercase">
                  {outcome === 'solved' ? tc('solved') : tc('revealed')}
                </span>
                {t('success')}
              </p>
              {outcome === 'revealed' ? (
                <p className="font-body text-sm leading-relaxed text-muted">
                  <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">{tc('answerLabel')}</span>
                  {t('answer')}
                </p>
              ) : null}
              {hasTrick ? insiderNote : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  ref={continueRef}
                  variant="primary"
                  size="sm"
                  onClick={() => leaveTo(nextSectionId)}
                  data-action="continue"
                >
                  {tc('continue')}
                </Button>
                <Button variant="ghost" size="sm" onClick={close}>
                  {tc('close')}
                </Button>
              </div>
              <SolvedCount eraId={eraId} observe={outcomeRef} />
            </div>
          ) : legend && hasTrick ? (
            insiderNote
          ) : null}
        </HeldDialog>
      ) : null}
    </div>
  );
}

function noop() {}

/**
 * "X people solved this", under the outcome's buttons so nothing moves when
 * it arrives. The counts are fetched once the outcome is on screen; below
 * the threshold, or without the API, the line is simply not there.
 */
function SolvedCount({ eraId, observe }: { eraId: EraId; observe: RefObject<HTMLElement | null> }) {
  const tc = useTranslations('puzzles.common');
  const solvedBy = publicCount(usePublicCounts(observe), eraSolved(eraId));
  if (solvedBy === null) return null;
  return (
    <p data-public-count={eraSolved(eraId)} className="font-mono text-[11px] text-muted">
      {tc('solvedBy', { count: solvedBy })}
    </p>
  );
}
