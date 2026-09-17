'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';

const JOBS = { payroll: 30, inventory: 5, invoices: 15, report: 2 } as const;
type JobId = keyof typeof JOBS;

/** Shortest job first: 0 + 2 + 7 + 22. */
const OPTIMAL_WAIT = 31;

/**
 * The IBM 704 console had six sense switches a running program could read. The
 * program here reads switch 3 - `IF (SENSE SWITCH 3) 10, 20` - and, when it is
 * up, also prints each job's waiting time. The era's insider trick, working.
 */
const SENSE_SWITCHES = [1, 2, 3, 4, 5, 6] as const;
const PRINT_SWITCH = 3;

interface QueueState {
  order: JobId[];
  switches: number[];
}

type QueueAction = { type: 'move'; job: JobId; by: -1 | 1 } | { type: 'switch'; which: number };

function initial(): QueueState {
  // Arrival order, longest first: 0 + 30 + 35 + 50 = 115 minutes of waiting.
  return { order: ['payroll', 'inventory', 'invoices', 'report'], switches: [] };
}

function reduce(state: QueueState, action: QueueAction): QueueState {
  if (action.type === 'switch') {
    const switches = state.switches.includes(action.which)
      ? state.switches.filter((which) => which !== action.which)
      : [...state.switches, action.which];
    return { ...state, switches };
  }
  const from = state.order.indexOf(action.job);
  const to = from + action.by;
  if (from < 0 || to < 0 || to >= state.order.length) return state;
  const order = [...state.order];
  const [moved] = order.splice(from, 1);
  if (moved) order.splice(to, 0, moved);
  return { ...state, order };
}

function waits(order: readonly JobId[]): number[] {
  let clock = 0;
  return order.map((job) => {
    const wait = clock;
    clock += JOBS[job];
    return wait;
  });
}

const totalWait = (order: readonly JobId[]) => waits(order).reduce((sum, wait) => sum + wait, 0);

const up = (job: JobId) => `up-${job}`;

const definition: PuzzleDefinition<QueueState, QueueAction> = {
  initial,
  reduce,
  isSolved: (state) => totalWait(state.order) === OPTIMAL_WAIT,
  usedTrick: (state) => state.switches.includes(PRINT_SWITCH),
  script: [
    { kind: 'act', target: `switch-${PRINT_SWITCH}`, action: { type: 'switch', which: PRINT_SWITCH } },
    { kind: 'act', target: up('report'), action: { type: 'move', job: 'report', by: -1 } },
    { kind: 'act', target: up('report'), action: { type: 'move', job: 'report', by: -1 } },
    { kind: 'act', target: up('report'), action: { type: 'move', job: 'report', by: -1 } },
    { kind: 'act', target: up('inventory'), action: { type: 'move', job: 'inventory', by: -1 } },
    { kind: 'act', target: up('invoices'), action: { type: 'move', job: 'invoices', by: -1 } },
  ],
};

const LONGEST = Math.max(...Object.values(JOBS));

/** FORTRAN as the 704 ran it: machine text, the same in every language. */
const LISTING = ['      IF (SENSE SWITCH 3) 10, 20', '   10 PRINT 100, WAIT'].join(String.fromCharCode(10));

/**
 * 1956: four jobs, one machine. Order them so everyone waits the least.
 * Truth: a computer hates waiting - scheduling is why operating systems exist.
 */
export function SchedulingPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.batch');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;
  const jobWaits = waits(state.order);
  const total = totalWait(state.order);

  // Reordering moves DOM nodes, which drops focus. Put it back on the job the
  // visitor just moved, on whichever of its buttons still makes sense.
  const [focusRequest, setFocusRequest] = useState<{ job: JobId; by: -1 | 1 } | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!focusRequest) return;
    const list = listRef.current;
    const index = state.order.indexOf(focusRequest.job);
    const atEdge = focusRequest.by === -1 ? index === 0 : index === state.order.length - 1;
    const direction = focusRequest.by === -1 !== atEdge ? 'up' : 'down';
    list?.querySelector<HTMLElement>(`[data-target="${direction}-${focusRequest.job}"]`)?.focus();
  }, [focusRequest, state.order]);

  const move = (job: JobId, by: -1 | 1) => {
    dispatch({ type: 'move', job, by });
    setFocusRequest({ job, by });
  };

  const printWaits = state.switches.includes(PRINT_SWITCH);

  return (
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex} className="flex flex-col gap-3">
      {/* The operator's console: the program listing it runs, and the switches
          it reads while running. */}
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-control border border-edge px-2 py-1.5">
        <pre dir="ltr" className="font-mono text-[11px] leading-snug text-muted" aria-label={t('listingLabel')}>
          {LISTING}
        </pre>
        <div role="group" aria-label={t('switchesLabel')} className="flex items-end gap-1.5" dir="ltr">
          {SENSE_SWITCHES.map((which) => {
            const raised = state.switches.includes(which);
            return (
              <button
                key={which}
                type="button"
                {...target(`switch-${which}`)}
                aria-pressed={raised}
                aria-label={t('switchLabel', { which })}
                tabIndex={interactive ? undefined : -1}
                onClick={() => dispatch({ type: 'switch', which })}
                className="flex cursor-pointer flex-col items-center gap-0.5 rounded-control px-0.5 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <svg viewBox="0 0 10 18" className="h-5 w-3" aria-hidden="true">
                  <rect x="1" y="6" width="8" height="6" rx="1" className="fill-edge" />
                  <path d={raised ? 'M5 9V1' : 'M5 9v8'} className="stroke-ink" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-mono text-[9px] text-muted">{which}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ol ref={listRef} className="flex flex-col gap-1.5">
        {state.order.map((job, index) => {
          const name = t(`jobs.${job}`);
          return (
            <li
              key={job}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control border border-edge bg-background/40 px-2 py-1.5"
            >
              <span className="w-4 font-mono text-xs text-muted">{index + 1}</span>
              <span className="min-w-[6.5rem] font-mono text-sm font-bold text-ink">{name}</span>
              <span className="flex min-w-[6rem] flex-1 items-center" aria-hidden="true">
                <span
                  className="block h-2 bg-ink"
                  style={{ width: `${(JOBS[job] / LONGEST) * 100}%` }}
                />
              </span>
              <span className="font-mono text-xs text-ink">{t('runs', { minutes: JOBS[job] })}</span>
              {printWaits ? (
                <span className="font-mono text-xs text-muted">{t('waits', { minutes: jobWaits[index] ?? 0 })}</span>
              ) : null}
              <span className="ms-auto flex gap-1">
                {(
                  [
                    [-1, 'up', t('moveUp', { job: name }), 'M2 8l4-4 4 4'],
                    [1, 'down', t('moveDown', { job: name }), 'M2 4l4 4 4-4'],
                  ] as const
                ).map(([by, direction, label, path]) => (
                  <button
                    key={direction}
                    type="button"
                    {...target(`${direction}-${job}`)}
                    aria-label={label}
                    disabled={by === -1 ? index === 0 : index === state.order.length - 1}
                    tabIndex={interactive ? undefined : -1}
                    onClick={() => move(job, by)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-control border border-edge text-ink hover:border-accent disabled:cursor-default disabled:opacity-30"
                  >
                    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </button>
                ))}
              </span>
            </li>
          );
        })}
      </ol>

      <p
        className={cn('font-mono text-sm font-bold', total === OPTIMAL_WAIT ? 'text-success' : 'text-ink')}
        aria-live={interactive ? 'polite' : undefined}
      >
        {t('total', { minutes: total })}
      </p>
    </PuzzleSurface>
  );
}
