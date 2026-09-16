'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { getEra, type EraId } from '@/content/eras';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { keepScrollAnchor, scrollToElementId } from '@/lib/lenis-controller';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { DEFAULT_MODE, useUnlockStore } from '@/store/unlock-store';
import { usePuzzleProgressStore } from '@/store/puzzle-progress-store';
import { GUIDED_END } from '@/components/puzzles/engine';
import { HeldDialog } from '@/components/puzzles/HeldDialog';
import { puzzleComponents } from '@/components/puzzles/registry';

interface PuzzleShellProps {
  eraId: EraId;
  eraIndex: number;
  /** Where Skip and Continue take the visitor. */
  nextSectionId: string;
}

type HelpLevel = 0 | 1 | 2;

/**
 * Everything around a puzzle that is the same for all seven.
 *
 * Guided mode: the puzzle plays itself inline as the page scrolls; the visitor
 * can take over ("I'll try this one myself") or skip.
 * Interactive mode: an invitation inline; starting it holds the page in a
 * dialog with the task, two-step help, feedback, Skip and Close.
 *
 * The mode is read here and nowhere below: the puzzle receives a presentation,
 * and the era visual never learns either. See DECISIONS.md 33 and 37.
 */
export function PuzzleShell({ eraId, eraIndex, nextSectionId }: PuzzleShellProps) {
  const t = useTranslations(`puzzles.${eraId}`);
  const tc = useTranslations('puzzles.common');
  const Puzzle = puzzleComponents[eraId];
  const artifact = getEra(eraId).artifact;

  const mode = useUnlockStore((state) => state.mode) ?? DEFAULT_MODE;
  const setMode = useUnlockStore((state) => state.setMode);
  const solvePuzzle = useUnlockStore((state) => state.solvePuzzle);
  const skipPuzzle = useUnlockStore((state) => state.skipPuzzle);
  const solvedBefore = useUnlockStore((state) => state.artifacts.includes(artifact));
  const reduced = useReducedMotion();

  // Only guided playback follows the scroll; interactive mode must not
  // re-render on every published progress step.
  const guided = mode === 'guided';
  const progress = usePuzzleProgressStore((state) => (guided ? (state.progress[eraId] ?? 0) : 0));

  const [held, setHeld] = useState(false);
  const [help, setHelp] = useState<HelpLevel>(0);
  const [solvedNow, setSolvedNow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pendingScroll = useRef<string | null>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    setHelp(0);
    setSolvedNow(false);
    setAttempt((value) => value + 1);
    setHeld(true);
  };

  const close = useCallback(() => setHeld(false), []);

  const leaveTo = (id: string) => {
    pendingScroll.current = id;
    setHeld(false);
  };

  const skip = () => {
    skipPuzzle(eraId);
    if (held) leaveTo(nextSectionId);
    else scrollToElementId(nextSectionId);
  };

  const tryMyself = () => {
    keepScrollAnchor(() => setMode('interactive'));
    open();
  };

  const onSolved = useCallback(() => {
    setSolvedNow(true);
    solvePuzzle(eraId);
  }, [eraId, solvePuzzle]);

  // The dialog releases the page in its unmount cleanup, which runs before
  // this effect - so the scroll happens on a page that can move again.
  useEffect(() => {
    if (held || pendingScroll.current === null) return;
    const id = pendingScroll.current;
    pendingScroll.current = null;
    const frame = requestAnimationFrame(() => scrollToElementId(id));
    return () => cancelAnimationFrame(frame);
  }, [held]);

  useEffect(() => {
    if (solvedNow) continueRef.current?.focus({ preventScroll: true });
  }, [solvedNow]);

  // Switching to guided while playing ends the hold (the switch also asks for
  // it; this keeps the two from ever disagreeing).
  const dialogOpen = held && !guided;

  const title = t('title');
  const guidedDone = reduced || progress >= GUIDED_END;

  const header = (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      <span className="font-mono text-[11px] tracking-wide text-muted uppercase">
        {solvedBefore ? tc('solved') : tc('optional')}
      </span>
      {guided && !reduced ? (
        <span className="font-mono text-[11px] tracking-wide text-accent uppercase">{tc('watching')}</span>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-3 border-t border-edge pt-4" data-puzzle={eraId}>
      {header}

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
          <p className="font-body text-sm leading-relaxed text-ink">{t('invitation')}</p>
          {solvedBefore ? <p className="font-body text-sm leading-relaxed text-success">{t('success')}</p> : null}
        </>
      )}

      {/* Skip must stay visible: when the card is taller than its panel, the
          actions stick to the panel's bottom edge. */}
      <div className="ao-puzzle-actions flex flex-wrap items-center gap-2">
        {guided ? (
          <Button variant="primary" size="sm" onClick={tryMyself}>
            {tc('tryMyself')}
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={open}>
            {solvedBefore ? tc('playAgain') : tc('start')}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={skip}>
          {t('skip')}
        </Button>
      </div>

      {dialogOpen ? (
        <HeldDialog label={tc('dialogLabel', { title })} onRequestClose={close}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-mono text-[11px] tracking-wide text-muted uppercase">{tc('optional')}</p>
              <h2 className="font-display text-lg font-bold text-ink sm:text-xl">{title}</h2>
            </div>
            <div className="ms-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={skip}>
                {t('skip')}
              </Button>
              <Button variant="ghost" size="sm" onClick={close} aria-label={tc('close')}>
                <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </Button>
            </div>
          </div>

          <p className="font-body text-sm leading-relaxed text-ink">
            <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">{tc('taskLabel')}</span>
            {t('task')}
          </p>

          <Puzzle key={attempt} presentation="play" progress={0} eraIndex={eraIndex} onSolved={onSolved} />

          {solvedNow ? (
            <div role="status" className="flex flex-col gap-3 rounded-control border border-success p-3">
              <p className="font-body text-sm leading-relaxed text-ink">
                <span className="me-1.5 font-mono text-[11px] tracking-wide text-success uppercase">{tc('solved')}</span>
                {t('success')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button ref={continueRef} variant="primary" size="sm" onClick={() => leaveTo(nextSectionId)}>
                  {tc('continue')}
                </Button>
                <Button variant="ghost" size="sm" onClick={close}>
                  {tc('close')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] tracking-wide text-muted uppercase">{tc('helpLabel')}</span>
                <Button variant="ghost" size="sm" onClick={() => setHelp(1)} disabled={help >= 1}>
                  {tc('hint')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setHelp(2)} disabled={help < 1 || help >= 2}>
                  {tc('answer')}
                </Button>
              </div>
              <div aria-live="polite" className="flex flex-col gap-1.5">
                {help >= 1 ? (
                  <p className="font-body text-sm leading-relaxed text-ink">
                    <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">{tc('hintLabel')}</span>
                    {t('hint')}
                  </p>
                ) : null}
                {help >= 2 ? (
                  <p className="font-body text-sm leading-relaxed text-ink">
                    <span className="me-1.5 font-mono text-[11px] tracking-wide text-accent uppercase">{tc('answerLabel')}</span>
                    {t('answer')}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </HeldDialog>
      ) : null}
    </div>
  );
}

function noop() {}
