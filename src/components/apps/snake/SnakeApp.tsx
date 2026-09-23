'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import { useNativeKeydown } from '@/components/apps/use-app-input';
import {
  isFinished,
  keyDirection,
  newGame,
  pause,
  step,
  stepInterval,
  swipeDirection,
  togglePause,
  turn,
  type Direction,
  type SnakeState,
} from '@/components/apps/snake/game';
import { cn } from '@/lib/cn';
import { count } from '@/lib/count';
import { publicCount, SNAKE_PLAYED } from '@/lib/counters';
import { usePublicCounts } from '@/lib/use-public-counts';
import { selectSnakeBest, useSnakeStore } from '@/store/snake-store';
import { useWindowStore } from '@/store/window-store';

const random = () => Math.random();

/** The tokens the canvas paints with (globals.css, `.ao-snake`). */
const TOKENS = ['board', 'grid', 'body', 'head', 'food'] as const;
type Palette = Record<(typeof TOKENS)[number], string>;

/**
 * Snake (Phase 9D-1, DECISIONS.md 57), unlocked by the 1981 puzzle. Arrows or
 * WASD steer, Space or P pauses; on a touchscreen a swipe on the board or the
 * pad below it. The game pauses itself when the tab is hidden or the browser
 * window loses focus. Only the best score is kept, in this browser; a finished
 * game adds one to the anonymous `snake.played` counter - never the score.
 *
 * No shake, no flash, no sound: nothing here moves but the snake, so reduced
 * motion needs no special case. The board is not mirrored in Persian - up,
 * down, left and right are directions on a screen, not in a text.
 */
export function SnakeApp(props: AppProps) {
  return (
    <AppMessages copy={['snake']}>
      <Snake {...props} />
    </AppMessages>
  );
}

function Snake({ appId }: AppProps) {
  const t = useTranslations('snake');
  const format = useFormatter();
  const best = useSnakeStore(selectSnakeBest);
  const recordGame = useSnakeStore((state) => state.recordGame);

  const game = useRef<SnakeState>(newGame(random));
  const [view, setView] = useState(() => ({ status: game.current.status, score: game.current.score }));
  const [announcement, setAnnouncement] = useState('');
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const sizeRef = useRef(0);
  const statsRef = useRef<HTMLParagraphElement>(null);
  const played = publicCount(usePublicCounts(statsRef), SNAKE_PLAYED);

  /* --- drawing ---------------------------------------------------------------- */

  const readPalette = useCallback((): Palette | null => {
    const probe = probeRef.current;
    if (!probe) return null;
    // A canvas cannot resolve var() or color-mix(): let the browser do it on a
    // hidden probe and read back the computed colour.
    const palette = {} as Palette;
    for (const token of TOKENS) {
      probe.style.color = `var(--ao-snake-${token})`;
      palette[token] = getComputedStyle(probe).color;
    }
    return palette;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const palette = readPalette();
    const size = sizeRef.current;
    if (!canvas || !context || !palette || size === 0) return;
    const state = game.current;
    const cell = size / state.width;
    context.setTransform(canvas.width / size, 0, 0, canvas.height / size, 0, 0);

    context.fillStyle = palette.board;
    context.fillRect(0, 0, size, size);
    context.strokeStyle = palette.grid;
    context.lineWidth = 1;
    context.beginPath();
    for (let line = 1; line < state.width; line += 1) {
      const at = Math.round(line * cell) + 0.5;
      context.moveTo(at, 0);
      context.lineTo(at, size);
      context.moveTo(0, at);
      context.lineTo(size, at);
    }
    context.stroke();

    const inset = Math.max(1, cell * 0.08);
    if (state.food) {
      context.fillStyle = palette.food;
      const r = cell / 2 - inset;
      context.beginPath();
      context.arc(state.food.x * cell + cell / 2, state.food.y * cell + cell / 2, r, 0, Math.PI * 2);
      context.fill();
    }
    state.snake.forEach((point, index) => {
      context.fillStyle = index === 0 ? palette.head : palette.body;
      context.fillRect(point.x * cell + inset, point.y * cell + inset, cell - inset * 2, cell - inset * 2);
    });
  }, [readPalette]);

  // The board is square and as wide as the window allows; drawn at the
  // device's pixel ratio, so it stays sharp on every screen.
  useEffect(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;
    const fit = () => {
      const size = Math.floor(board.clientWidth);
      if (size === 0) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 3);
      sizeRef.current = size;
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      draw();
    };
    const observer = new ResizeObserver(fit);
    observer.observe(board);
    fit();
    return () => observer.disconnect();
  }, [draw]);

  // A theme change (the Time Machine, 9D-2) repaints with the new tokens.
  useEffect(() => {
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
    return () => observer.disconnect();
  }, [draw]);

  /* --- state ------------------------------------------------------------------ */

  const commit = useCallback(
    (next: SnakeState) => {
      const previous = game.current;
      game.current = next;
      if (next.status !== previous.status || next.score !== previous.score) {
        setView({ status: next.status, score: next.score });
      }
      if (!isFinished(previous) && isFinished(next)) {
        recordGame(next.score);
        count(SNAKE_PLAYED);
        setAnnouncement(t(next.status === 'won' ? 'announce.won' : 'announce.over', { score: next.score }));
      } else if (previous.status !== next.status && next.status === 'paused') {
        setAnnouncement(t('announce.paused'));
      } else if (previous.status === 'paused' && next.status === 'running') {
        setAnnouncement(t('announce.resumed'));
      }
      draw();
    },
    [draw, recordGame, t],
  );

  const start = useCallback(() => {
    const fresh = newGame(random);
    commit({ ...fresh, status: 'running' });
    setAnnouncement(t('announce.started'));
    boardRef.current?.focus({ preventScroll: true });
  }, [commit, t]);

  const steer = useCallback(
    (direction: Direction) => {
      const current = game.current;
      if (isFinished(current)) return;
      commit(turn(current.status === 'paused' ? togglePause(current) : current, direction));
    },
    [commit],
  );

  const onPauseToggle = useCallback(() => {
    const current = game.current;
    if (current.status === 'ready' || isFinished(current)) start();
    else commit(togglePause(current));
  }, [commit, start]);

  /* --- the clock -------------------------------------------------------------- */

  const running = view.status === 'running';
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      // After a stall (a busy frame, a background tab) take one step, not a burst.
      carry = Math.min(carry + (now - last), stepInterval(game.current.score) * 2);
      last = now;
      const interval = stepInterval(game.current.score);
      if (carry >= interval) {
        carry -= interval;
        commit(step(game.current, random));
      }
      if (game.current.status === 'running') frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, commit]);

  // Hidden tab or a window in the background: stop the clock, keep the board.
  useEffect(() => {
    const hold = () => commit(pause(game.current));
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') hold();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', hold);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', hold);
    };
  }, [commit]);

  // Another Amonel OS window in front: the same. (The phone shell has no
  // window focus; there the app is fullscreen anyway.)
  const focusedId = useWindowStore((state) => state.focusedId);
  useEffect(() => {
    if (focusedId !== null && focusedId !== appId) commit(pause(game.current));
  }, [focusedId, appId, commit]);

  /* --- input ------------------------------------------------------------------ */

  // Native on the board, so the arrows neither scroll the window nor reach the
  // desktop's own shortcuts; only keys the game uses are claimed.
  useNativeKeydown(boardRef, (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const direction = keyDirection(event.code);
    if (direction) {
      event.preventDefault();
      event.stopPropagation();
      const current = game.current;
      if (current.status === 'ready' || isFinished(current)) {
        start();
        return;
      }
      steer(direction);
      return;
    }
    if (event.code === 'Space' || event.code === 'KeyP' || event.code === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      onPauseToggle();
    }
  });

  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = swipe.current;
    if (!origin || origin.id !== event.pointerId) return;
    const direction = swipeDirection(event.clientX - origin.x, event.clientY - origin.y);
    if (!direction) return;
    // Steer mid-swipe and start measuring again: a long drag can turn twice.
    swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    if (game.current.status === 'running' || game.current.status === 'paused') steer(direction);
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = swipe.current;
    swipe.current = null;
    if (!origin || origin.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    // A tap on a board that is not running starts or resumes it.
    if (moved < 10 && game.current.status !== 'running') onPauseToggle();
  };

  const status = view.status;
  const overlay =
    status === 'ready' ? t('overlay.ready') : status === 'paused' ? t('overlay.paused') : status === 'over' ? t('overlay.over', { score: view.score }) : status === 'won' ? t('overlay.won') : null;

  return (
    <div data-app-content={appId} className="ao-snake @container min-h-full">
      <span ref={probeRef} aria-hidden="true" className="hidden" />
      <div className="mx-auto flex max-w-[26rem] flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3 font-mono text-sm text-ink">
          <p data-snake-score={view.score}>
            {t('score')} <span className="font-bold">{format.number(view.score)}</span>
          </p>
          <p className="text-muted" data-snake-best={best}>
            {t('best')} <span className="font-bold text-ink">{format.number(best)}</span>
          </p>
        </div>

        <div
          ref={boardRef}
          role="application"
          aria-roledescription={t('boardRole')}
          aria-label={t('boardLabel')}
          aria-describedby={`${appId}-snake-help`}
          tabIndex={0}
          data-snake-board=""
          data-snake-status={status}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipe.current = null;
          }}
          className="ao-snake-board relative aspect-square w-full overflow-hidden rounded-control border border-edge focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
          {overlay ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <p className="ao-themed max-w-[18rem] rounded-control border border-edge bg-surface/90 px-4 py-3 text-center font-body text-sm text-ink shadow-window">
                {overlay}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-action="snake-start"
            onClick={status === 'running' || status === 'paused' ? onPauseToggle : start}
            className="ao-themed min-h-10 cursor-pointer rounded-control border border-accent bg-accent px-4 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
          >
            {status === 'running' ? t('pause') : status === 'paused' ? t('resume') : status === 'ready' ? t('start') : t('again')}
          </button>
          {status === 'running' || status === 'paused' ? (
            <button
              type="button"
              data-action="snake-restart"
              onClick={start}
              className="ao-themed min-h-10 cursor-pointer rounded-control border border-edge px-4 font-mono text-xs tracking-wide text-ink uppercase hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {t('restart')}
            </button>
          ) : null}
        </div>

        {/* The pad: for touchscreens, where there are no arrow keys. Physical
            directions, so it is not mirrored in Persian either. */}
        <div dir="ltr" role="group" aria-label={t('padLabel')} className="mx-auto hidden grid-cols-3 gap-1.5 pointer-coarse:grid" data-snake-pad="">
          {(
            [
              ['up', 'col-start-2'],
              ['left', 'col-start-1 row-start-2'],
              ['down', 'col-start-2 row-start-2'],
              ['right', 'col-start-3 row-start-2'],
            ] as const
          ).map(([direction, place]) => (
            <button
              key={direction}
              type="button"
              aria-label={t(`directions.${direction}`)}
              data-snake-pad-button={direction}
              onPointerDown={(event) => {
                // Steer on touch-down: waiting for the click costs a step.
                event.preventDefault();
                if (status === 'ready' || isFinished(game.current)) start();
                else steer(direction);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                if (status === 'ready' || isFinished(game.current)) start();
                else steer(direction);
              }}
              className={cn(
                'ao-themed flex h-14 w-14 cursor-pointer touch-none items-center justify-center rounded-control border border-edge bg-surface text-ink select-none active:border-accent active:bg-elevated focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                place,
              )}
            >
              <svg viewBox="0 0 16 16" className={cn('h-5 w-5', { up: '', right: 'rotate-90', down: 'rotate-180', left: '-rotate-90' }[direction])} aria-hidden="true">
                <path d="M8 3l5 7H3z" fill="currentColor" />
              </svg>
            </button>
          ))}
        </div>

        <p id={`${appId}-snake-help`} className="font-body text-xs leading-relaxed text-muted">
          <span className="pointer-coarse:hidden">{t('helpKeys')}</span>
          <span className="hidden pointer-coarse:inline">{t('helpTouch')}</span>
        </p>
        <p className="font-body text-xs leading-relaxed text-muted">{t('truth')}</p>
        <p ref={statsRef} className="min-h-4 font-mono text-xs text-muted">
          {played !== null ? <span data-public-count={SNAKE_PLAYED}>{t('played', { count: played })}</span> : null}
        </p>
        <p className="ao-sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>
  );
}
