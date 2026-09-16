'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { asStringList } from '@/lib/message-shapes';
import { CARD_ROWS, decodeColumn, encodeCard } from '@/lib/punch-card';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';

/** A name is a name in every language; the card spells it in Latin capitals. */
const WORD = 'AHMADREZA';
/** Column index of the misprint: the D, punched as 12-5 (E) instead of 12-4. */
const FAULT_COLUMN = 4;
/** A blank column keeps its width in the readout. */
const NBSP = String.fromCharCode(0xa0);

interface CardState {
  columns: number[][];
}

type CardAction = { type: 'toggle'; column: number; row: number };

function initial(): CardState {
  const columns = encodeCard(WORD).map((column) => column.rows);
  columns[FAULT_COLUMN] = [12, 5];
  return { columns };
}

function reduce(state: CardState, action: CardAction): CardState {
  return {
    columns: state.columns.map((rows, index) => {
      if (index !== action.column) return rows;
      return rows.includes(action.row) ? rows.filter((row) => row !== action.row) : [...rows, action.row];
    }),
  };
}

function read(state: CardState): string {
  return state.columns.map((rows) => decodeColumn(rows)).join('');
}

const holeTarget = (column: number, row: number) => `hole-${column}-${row}`;

const definition: PuzzleDefinition<CardState, CardAction> = {
  initial,
  reduce,
  isSolved: (state) => read(state) === WORD,
  script: [
    { kind: 'point', target: 'reads' },
    { kind: 'act', target: holeTarget(FAULT_COLUMN, 5), action: { type: 'toggle', column: FAULT_COLUMN, row: 5 } },
    { kind: 'act', target: holeTarget(FAULT_COLUMN, 4), action: { type: 'toggle', column: FAULT_COLUMN, row: 4 } },
  ],
};

/**
 * 1946: the card should spell AHMADREZA, and one column is punched wrong.
 * Truth: text is numbers - a letter is nothing but a pattern of holes.
 *
 * The card is a grid with one tab stop: arrow keys move between holes, Space or
 * Enter punches and clears.
 */
export function PunchCardPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.eniac');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;
  const reads = read(state);

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
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex} className="flex flex-col gap-3">
      <p {...target('reads')} className="font-mono text-sm text-ink" aria-live={interactive ? 'polite' : undefined}>
        <span className="me-2 text-muted">{t('readsLabel')}:</span>
        <span dir="ltr" className="inline-flex tracking-[0.2em]">
          {Array.from(reads).map((letter, index) => (
            <span key={index} className={cn(letter !== WORD[index] && 'text-error underline')}>
              {letter === ' ' ? NBSP : letter}
            </span>
          ))}
        </span>
      </p>

      <div className="flex flex-wrap items-start gap-4">
        <div className="overflow-x-auto">
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
            {CARD_ROWS.map((rowLabel, rowIndex) => (
              <div key={rowLabel} role="row" className="flex gap-[3px]">
                <span role="rowheader" className="w-6 text-end font-mono text-[10px] leading-5 text-muted">
                  {rowLabel}
                </span>
                {state.columns.map((rows, column) => {
                  const punched = rows.includes(rowLabel);
                  const isFocus = focus.column === column && focus.row === rowIndex;
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
                          setFocus({ column, row: rowIndex });
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
        </div>

        <div className="flex min-w-[12rem] flex-1 flex-col gap-2">
          <p className="font-mono text-[11px] tracking-wide text-muted uppercase">{t('tableTitle')}</p>
          <ul className="flex flex-col gap-1 font-mono text-xs text-ink">
            {asStringList(t.raw('table')).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="font-body text-xs leading-relaxed text-muted">{t('bugNote')}</p>
        </div>
      </div>
    </PuzzleSurface>
  );
}
