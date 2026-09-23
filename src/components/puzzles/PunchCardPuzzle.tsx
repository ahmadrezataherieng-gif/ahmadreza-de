'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { asStringList } from '@/lib/message-shapes';
import { CARD_ROWS, decodeColumn, encodeCard, rowIndex } from '@/lib/punch-card';
import {
  target,
  usePuzzleEngine,
  type Presentation,
  type PuzzleDefinition,
  type PuzzleProps,
} from '@/components/puzzles/engine';
import { PuzzleSurface, revealInScroller } from '@/components/puzzles/PuzzleSurface';

/** A name is a name in every language; the card spells it in Latin capitals. */
// CONTENT-TODO CR-112
const WORD = 'AHMADREZA';
/** Column index of the misprint: the D, punched as 12-5 (E) instead of 12-4. */
const FAULT_COLUMN = 4;
/** A blank column keeps its width in the readout. */
const NBSP = String.fromCharCode(0xa0);

/**
 * The deck the card belongs to, seen edge-on. It was dropped: two pairs of
 * cards are swapped. The felt-tip diagonal across the top shows where each
 * card goes - the era's insider trick, made to work.
 */
const DECK_SIZE = 8;
const DROPPED_DECK = [0, 1, 5, 3, 4, 2, 7, 6];

interface CardState {
  columns: number[][];
  deck: number[];
  /** The deck card picked up first, waiting for the one to swap with. */
  picked: number | null;
}

type CardAction = { type: 'toggle'; column: number; row: number } | { type: 'pick'; card: number };

function initial(): CardState {
  const columns = encodeCard(WORD).map((column) => column.rows);
  columns[FAULT_COLUMN] = [12, 5];
  return { columns, deck: [...DROPPED_DECK], picked: null };
}

function reduce(state: CardState, action: CardAction): CardState {
  if (action.type === 'pick') {
    if (state.picked === null) return { ...state, picked: action.card };
    if (state.picked === action.card) return { ...state, picked: null };
    const deck = [...state.deck];
    const a = deck.indexOf(state.picked);
    const b = deck.indexOf(action.card);
    deck[a] = action.card;
    deck[b] = state.picked;
    return { ...state, deck, picked: null };
  }
  return {
    ...state,
    columns: state.columns.map((rows, index) => {
      if (index !== action.column) return rows;
      return rows.includes(action.row) ? rows.filter((row) => row !== action.row) : [...rows, action.row];
    }),
  };
}

function read(state: CardState): string {
  return state.columns.map((rows) => decodeColumn(rows)).join('');
}

const deckSorted = (state: CardState) => state.deck.every((card, position) => card === position);

const holeTarget = (column: number, row: number) => `hole-${column}-${row}`;
const deckTarget = (card: number) => `deck-${card}`;
const pick = (card: number) => ({ kind: 'act' as const, target: deckTarget(card), action: { type: 'pick' as const, card } });

const definition: PuzzleDefinition<CardState, CardAction> = {
  initial,
  reduce,
  isSolved: (state) => read(state) === WORD,
  usedTrick: deckSorted,
  // The deck first, so the name is the last thing the demonstration builds.
  script: [
    { kind: 'point', target: 'reads' },
    { kind: 'point', target: 'deck' },
    pick(5),
    pick(2),
    pick(7),
    pick(6),
    { kind: 'act', target: holeTarget(FAULT_COLUMN, 5), action: { type: 'toggle', column: FAULT_COLUMN, row: 5 } },
    { kind: 'act', target: holeTarget(FAULT_COLUMN, 4), action: { type: 'toggle', column: FAULT_COLUMN, row: 4 } },
  ],
};

/**
 * 1946: a moth sits on the card, and the card spells the name wrong.
 * Truth: text is numbers - a letter is nothing but a pattern of holes.
 *
 * The scene is deep black; the moth crawls in, the visitor punches the fault
 * out, the moth leaves and the name is built dot by dot from the columns.
 * The historical moth was found a year later, at Harvard: the copy says so.
 *
 * The card is a grid with one tab stop: arrow keys move between holes, Space or
 * Enter punches and clears.
 */
export function PunchCardPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.eniac');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;
  const reads = read(state);
  const solved = reads === WORD;

  const [focus, setFocus] = useState({ column: 0, row: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const moveFocus = (column: number, row: number) => {
    const next = {
      column: Math.min(WORD.length - 1, Math.max(0, column)),
      row: Math.min(CARD_ROWS.length - 1, Math.max(0, row)),
    };
    setFocus(next);
    const rowLabel = CARD_ROWS[next.row];
    gridRef.current?.querySelector<HTMLElement>(`[data-target="${holeTarget(next.column, rowLabel ?? 0)}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      moveFocus(focus.column + move[0], focus.row + move[1]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveFocus(0, focus.row);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveFocus(WORD.length - 1, focus.row);
    }
  };

  return (
    <PuzzleSurface
      pointer={engine.pointer}
      eraIndex={props.eraIndex}
      className="ao-void flex flex-col gap-4 rounded-window p-3 sm:p-4"
    >
      <p
        {...target('reads')}
        className="font-mono text-sm"
        aria-live={interactive ? 'polite' : undefined}
      >
        <span className="ao-void-muted me-2">{t('readsLabel')}:</span>
        <span dir="ltr" className="inline-flex tracking-[0.2em]">
          {Array.from(reads).map((letter, index) => (
            <span key={index} className={cn(letter !== WORD[index] && 'text-error underline')}>
              {letter === ' ' ? NBSP : letter}
            </span>
          ))}
        </span>
      </p>

      <div className="flex flex-wrap items-start gap-4">
        {/* A physical layout: the moth's resting place is measured in columns. */}
        <div dir="ltr" className="relative max-w-full overflow-x-auto">
          <div
            ref={gridRef}
            role="grid"
            aria-label={t('tableTitle')}
            dir="ltr"
            onKeyDown={onKeyDown}
            className="inline-flex flex-col gap-[3px] rounded-control border border-edge bg-elevated p-2"
          >
            <div role="row" className="flex gap-[3px]">
              <span role="columnheader" className="w-6" />
              {Array.from(reads).map((letter, column) => (
                <span
                  key={column}
                  role="columnheader"
                  className="w-6 text-center font-mono text-[11px] leading-4 text-ink sm:w-7"
                >
                  {letter}
                </span>
              ))}
            </div>
            {CARD_ROWS.map((rowLabel, rowPosition) => (
              <div key={rowLabel} role="row" className="flex gap-[3px]">
                <span role="rowheader" className="w-6 text-end font-mono text-[10px] leading-5 text-muted">
                  {rowLabel}
                </span>
                {state.columns.map((rows, column) => {
                  const punched = rows.includes(rowLabel);
                  const isFocus = focus.column === column && focus.row === rowPosition;
                  return (
                    <span key={column} role="gridcell">
                      <button
                        type="button"
                        {...target(holeTarget(column, rowLabel))}
                        tabIndex={interactive && isFocus ? 0 : -1}
                        aria-pressed={punched}
                        aria-label={t('holeLabel', {
                          column: column + 1,
                          row: rowLabel,
                          state: punched ? t('punched') : t('blank'),
                        })}
                        onClick={() => {
                          setFocus({ column, row: rowPosition });
                          dispatch({ type: 'toggle', column, row: rowLabel });
                        }}
                        className={cn(
                          'block h-5 w-6 cursor-pointer rounded-[2px] border transition-colors sm:w-7',
                          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
                          punched ? 'border-ink bg-ink' : 'border-edge bg-surface hover:border-accent',
                        )}
                      />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          <Moth presentation={props.presentation} solved={solved} />
          <p className="ao-sr-only" aria-live={interactive ? 'polite' : undefined}>
            {solved ? t('mothGone') : t('mothHere')}
          </p>
        </div>

        <div className="flex min-w-[12rem] flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="ao-void-muted font-mono text-[11px] tracking-wide uppercase">{t('tableTitle')}</p>
            <ul className="flex flex-col gap-1 font-mono text-xs">
              {asStringList(t.raw('table')).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <Deck state={state} interactive={interactive} dispatch={dispatch} />
        </div>
      </div>

      {solved ? <NameReveal columns={state.columns} label={t('nameLabel')} /> : null}
      {solved ? (
        <div className="flex flex-col gap-2 font-body text-sm leading-relaxed">
          <p>{t('explain')}</p>
          <p className="ao-void-muted text-xs">{t('bugNote')}</p>
        </div>
      ) : null}
    </PuzzleSurface>
  );
}

/* --- the moth ------------------------------------------------------------- */

function Moth({ presentation, solved }: { presentation: Presentation; solved: boolean }) {
  // The finished frame (reduced motion, or a solved final) has no moth at all.
  if (presentation === 'final') return null;
  const motion = solved ? 'ao-moth--leave' : presentation === 'guided' ? 'ao-moth--scrub' : 'ao-moth--timed';
  return (
    <div
      aria-hidden="true"
      // Rests over column 5, between the zone rows and the digits.
      className={cn('ao-moth absolute top-[52px] left-[135px] sm:left-[153px]', motion)}
    >
      <svg viewBox="0 0 40 34" width="44" height="37" className="block overflow-visible">
        <g className={solved ? undefined : 'ao-moth-flutter'}>
          <path className="ao-moth-wing" d="M20 15C13 3 3 4 3 13c0 7 9 8 17 4z" />
          <path className="ao-moth-wing" d="M20 15c7-12 17-11 17-2 0 7-9 8-17 4z" />
          <path className="ao-moth-wing" d="M20 18c-7 2-12 9-8 12 4 2 7-5 8-10z" />
          <path className="ao-moth-wing" d="M20 18c7 2 12 9 8 12-4 2-7-5-8-10z" />
          <circle className="ao-moth-spot" cx="10" cy="11" r="1.6" />
          <circle className="ao-moth-spot" cx="30" cy="11" r="1.6" />
        </g>
        <ellipse className="ao-moth-body" cx="20" cy="19" rx="2.1" ry="8" />
        <path className="ao-moth-antenna" d="M19 11c-2-5-5-7-8-8M21 11c2-5 5-7 8-8" />
      </svg>
    </div>
  );
}

/* --- the name, built from the corrected columns --------------------------- */

/** 5x7 dot-matrix glyphs for the letters of the name. */
const GLYPHS: Record<string, readonly string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
};

const PITCH = 6;

function NameReveal({ columns, label }: { columns: number[][]; label: string }) {
  const figureRef = useRef<HTMLElement>(null);
  // The name is the payoff: bring it into the card's (or dialog's) view.
  useEffect(() => {
    if (figureRef.current) revealInScroller(figureRef.current);
  }, []);
  const letters = Array.from(WORD);
  const width = letters.length * 6 * PITCH - PITCH;
  let delay = 0;
  return (
    <figure ref={figureRef} className="flex flex-col items-center gap-1" aria-label={label}>
      <svg
        viewBox={`0 0 ${width} ${9.5 * PITCH}`}
        className="w-full max-w-xl"
        role="img"
        aria-label={WORD}
        direction="ltr"
      >
        {letters.map((letter, index) => {
          const x0 = index * 6 * PITCH;
          const rows = columns[index] ?? [];
          const code = rows
            .slice()
            .sort((a, b) => rowIndex(a) - rowIndex(b))
            .join('-');
          return (
            <g key={index}>
              {(GLYPHS[letter] ?? []).flatMap((row, y) =>
                Array.from(row).flatMap((cell, x) => {
                  if (cell !== '#') return [];
                  delay += 9;
                  return [
                    <rect
                      key={`${x}-${y}`}
                      className="ao-bit"
                      style={{ '--bit-delay': delay } as CSSProperties}
                      x={x0 + x * PITCH + 0.6}
                      y={y * PITCH + 0.6}
                      width={PITCH - 1.2}
                      height={PITCH - 1.2}
                      rx={1.4}
                    />,
                  ];
                }),
              )}
              <text
                x={x0 + 2.5 * PITCH}
                y={9 * PITCH}
                textAnchor="middle"
                fontSize={PITCH * 1.25}
                fontFamily="var(--ao-font-mono)"
                className={cn('ao-bit-code', index === FAULT_COLUMN && 'ao-bit-code--fixed')}
              >
                {code}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="ao-void-muted font-mono text-[11px] tracking-wide uppercase">{label}</figcaption>
    </figure>
  );
}

/* --- the dropped deck ------------------------------------------------------ */

const DECK_W = 132;
const CARD_H = 7;

function Deck({
  state,
  interactive,
  dispatch,
}: {
  state: CardState;
  interactive: boolean;
  dispatch: (action: CardAction) => void;
}) {
  const t = useTranslations('puzzles.eniac');
  const sorted = deckSorted(state);
  return (
    <div {...target('deck')} className="flex flex-col gap-1">
      <p className="ao-void-muted font-mono text-[11px] tracking-wide uppercase">{t('deckLabel')}</p>
      <div dir="ltr" className="relative" style={{ width: DECK_W, height: DECK_SIZE * (CARD_H + 2) }}>
        {state.deck.map((card, position) => {
          const picked = state.picked === card;
          // The line was drawn with the deck in order: card n carries the
          // stroke at n steps along the diagonal.
          const lineX = 8 + (card * (DECK_W - 24)) / (DECK_SIZE - 1);
          return (
            <button
              key={card}
              type="button"
              {...target(deckTarget(card))}
              tabIndex={interactive ? undefined : -1}
              aria-pressed={picked}
              aria-label={t('deckCard', { position: position + 1 })}
              onClick={() => dispatch({ type: 'pick', card })}
              className={cn(
                'absolute start-0 block cursor-pointer rounded-[1px] transition-transform',
                'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
                picked && 'translate-x-2',
              )}
              style={{ top: position * (CARD_H + 2), width: DECK_W, height: CARD_H }}
            >
              <svg viewBox={`0 0 ${DECK_W} ${CARD_H}`} width={DECK_W} height={CARD_H} className="block" aria-hidden="true">
                <rect className="ao-deck-card" width={DECK_W} height={CARD_H} rx="1" />
                <line className="ao-deck-line" x1={lineX} y1={0.5} x2={lineX + 10} y2={CARD_H - 0.5} />
              </svg>
            </button>
          );
        })}
      </div>
      <p className="ao-void-muted min-h-4 font-body text-xs" aria-live={interactive ? 'polite' : undefined}>
        {sorted ? t('deckSorted') : state.picked !== null ? t('deckPicked') : ''}
      </p>
    </div>
  );
}
