'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { bitmapPath, bitmapWidth, ICON_DOCUMENT, ICON_FOLDER, ICON_TRASH, type Bitmap } from '@/lib/pixel-art';
import { target, usePuzzleEngine, type PuzzleDefinition, type PuzzleProps } from '@/components/puzzles/engine';
import { PuzzleSurface } from '@/components/puzzles/PuzzleSurface';

// CONTENT-TODO CR-246
const ITEMS = ['vita', 'old'] as const;
const TARGETS = ['folder', 'trash'] as const;
type Item = (typeof ITEMS)[number];
type Target = (typeof TARGETS)[number];

type Feedback =
  | null
  | { kind: 'moved'; item: Item; target: Target }
  | { kind: 'wrongTrash' }
  | { kind: 'wrongFolder' };

interface DeskState {
  placed: Partial<Record<Item, Target>>;
  feedback: Feedback;
}

type DeskAction = { type: 'drop'; item: Item; target: Target };

/** Where each item belongs. Anything else is refused, with the reason. */
const BELONGS: Record<Item, Target> = { vita: 'folder', old: 'trash' };

function reduce(state: DeskState, action: DeskAction): DeskState {
  if (state.placed[action.item]) return state;
  if (BELONGS[action.item] !== action.target) {
    return { ...state, feedback: { kind: action.target === 'trash' ? 'wrongTrash' : 'wrongFolder' } };
  }
  return {
    placed: { ...state.placed, [action.item]: action.target },
    feedback: { kind: 'moved', item: action.item, target: action.target },
  };
}

const definition: PuzzleDefinition<DeskState, DeskAction> = {
  initial: () => ({ placed: {}, feedback: null }),
  reduce,
  isSolved: (state) => ITEMS.every((item) => state.placed[item] === BELONGS[item]),
  script: [
    { kind: 'point', target: 'item-vita' },
    { kind: 'act', target: 'drop-folder', carry: 'item-vita', action: { type: 'drop', item: 'vita', target: 'folder' } },
    { kind: 'point', target: 'item-old' },
    { kind: 'act', target: 'drop-trash', carry: 'item-old', action: { type: 'drop', item: 'old', target: 'trash' } },
  ],
};

const ICONS: Record<Item | Target, Bitmap> = {
  vita: ICON_DOCUMENT,
  old: ICON_DOCUMENT,
  folder: ICON_FOLDER,
  trash: ICON_TRASH,
};

/** Pixels a press must travel before it counts as a drag rather than a click. */
const DRAG_THRESHOLD = 5;

interface Drag {
  item: Item;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
  over: Target | null;
}

/**
 * 1984: tidy the desktop without typing a single command.
 * Truth: pointing beats remembering.
 *
 * Three ways to do the same thing, all first-class:
 * - mouse and touch drag (pointer events, so one code path covers both),
 * - click to pick up, click a target to drop,
 * - keyboard: Space or Enter picks up, arrow keys choose a target, Enter drops,
 *   Escape cancels.
 */
export function DragDropPuzzle(props: PuzzleProps) {
  const t = useTranslations('puzzles.macintosh');
  const engine = usePuzzleEngine(definition, props);
  const { state, dispatch, interactive } = engine;

  const [carrying, setCarrying] = useState<Item | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const suppressClick = useRef(false);

  const name = (id: Item | Target) => t(`items.${id}`);
  const focusTarget = (id: string) =>
    requestAnimationFrame(() => deskRef.current?.querySelector<HTMLElement>(`[data-target="${id}"]`)?.focus());

  const drop = (item: Item, where: Target) => {
    dispatch({ type: 'drop', item, target: where });
    setCarrying(null);
    // Focus the next thing still to do, or stay on the target.
    const accepted = BELONGS[item] === where;
    const next = ITEMS.find((candidate) => candidate !== item && !state.placed[candidate]);
    focusTarget(accepted ? (next ? `item-${next}` : `drop-${where}`) : `item-${item}`);
  };

  const pickUp = (item: Item) => {
    if (carrying === item) {
      setCarrying(null);
      return;
    }
    setCarrying(item);
    focusTarget('drop-folder');
  };

  const onItemPointerDown = (event: PointerEvent<HTMLButtonElement>, item: Item) => {
    if (!interactive || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const desk = deskRef.current?.getBoundingClientRect();
    const x = event.clientX - (desk?.left ?? 0);
    const y = event.clientY - (desk?.top ?? 0);
    setDrag({ item, pointerId: event.pointerId, startX: x, startY: y, x, y, moved: false, over: null });
  };

  const deskPoint = (event: PointerEvent<HTMLButtonElement>) => {
    const desk = deskRef.current?.getBoundingClientRect();
    return { x: event.clientX - (desk?.left ?? 0), y: event.clientY - (desk?.top ?? 0) };
  };

  const targetAt = (event: PointerEvent<HTMLButtonElement>): Target | null => {
    const hit = document
      .elementsFromPoint(event.clientX, event.clientY)
      .map((element) => element.closest<HTMLElement>('[data-drop]'))
      .find((element): element is HTMLElement => element !== null);
    return (hit?.dataset.drop as Target | undefined) ?? null;
  };

  const onItemPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { x, y } = deskPoint(event);
    const moved = drag.moved || Math.hypot(x - drag.startX, y - drag.startY) > DRAG_THRESHOLD;
    setDrag({ ...drag, x, y, moved, over: targetAt(event) });
  };

  // The drop is decided where the pointer is released, not from the last
  // rendered move: a quick release can arrive before React has rendered the
  // move that reached the target, and the item would silently not drop.
  const onItemPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { x, y } = deskPoint(event);
    const moved = drag.moved || Math.hypot(x - drag.startX, y - drag.startY) > DRAG_THRESHOLD;
    if (moved) {
      suppressClick.current = true;
      const over = targetAt(event);
      if (over) drop(drag.item, over);
    }
    setDrag(null);
  };

  const onDeskKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && carrying) {
      // Cancel the carry, and keep Escape from also closing the puzzle.
      event.stopPropagation();
      event.preventDefault();
      const item = carrying;
      setCarrying(null);
      focusTarget(`item-${item}`);
      return;
    }
    if (!carrying) return;
    const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (!arrows.includes(event.key)) return;
    event.preventDefault();
    const active = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.drop : undefined;
    const index = TARGETS.findIndex((candidate) => candidate === active);
    const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const next = TARGETS[(index + step + TARGETS.length) % TARGETS.length] ?? 'folder';
    focusTarget(`drop-${next}`);
  };

  const feedback = state.feedback;
  const announcement =
    carrying !== null
      ? t('carrying', { item: name(carrying) })
      : feedback?.kind === 'moved'
        ? t('moved', { item: name(feedback.item), target: name(feedback.target) })
        : feedback?.kind === 'wrongTrash'
          ? t('wrongTrash')
          : feedback?.kind === 'wrongFolder'
            ? t('wrongFolder')
            : '';

  const held = drag?.moved ? drag.item : carrying;

  return (
    <PuzzleSurface pointer={engine.pointer} eraIndex={props.eraIndex} className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-window border-2 border-ink bg-surface">
        {/* Title bar: the stripes are the 1984 window's, drawn as a gradient. */}
        <div className="ao-mac-titlebar flex h-6 items-center justify-center border-b-2 border-ink">
          <span className="bg-surface px-2 ao-pixel-label font-[family-name:var(--ao-font-pixel)] text-[8px] text-ink">
            {t('window')}
          </span>
        </div>

        <div
          ref={deskRef}
          dir="ltr"
          onKeyDown={onDeskKeyDown}
          className="relative grid min-h-44 grid-cols-2 gap-4 p-4 sm:grid-cols-4"
        >
          {ITEMS.map((item) => {
            const placed = state.placed[item];
            return (
              <div key={item} className="flex justify-center">
                {placed ? null : (
                  <button
                    type="button"
                    {...target(`item-${item}`)}
                    tabIndex={interactive ? undefined : -1}
                    aria-pressed={carrying === item}
                    aria-label={t('pickUp', { item: name(item) })}
                    onPointerDown={(event) => onItemPointerDown(event, item)}
                    onPointerMove={onItemPointerMove}
                    onPointerUp={onItemPointerUp}
                    onPointerCancel={() => setDrag(null)}
                    onClick={() => {
                      if (suppressClick.current) {
                        suppressClick.current = false;
                        return;
                      }
                      pickUp(item);
                    }}
                    className={cn(
                      'flex cursor-grab touch-none flex-col items-center gap-1 rounded-control p-1 select-none',
                      'focus-visible:outline-2 focus-visible:outline-ink',
                      held === item && 'opacity-40',
                      carrying === item && 'outline-2 outline-dashed outline-ink',
                    )}
                  >
                    <PixelIcon bitmap={ICONS[item]} />
                    <IconLabel>{name(item)}</IconLabel>
                  </button>
                )}
              </div>
            );
          })}

          {TARGETS.map((where) => {
            const armed = held !== null && interactive;
            const inside = ITEMS.filter((item) => state.placed[item] === where);
            return (
              <div key={where} className="flex justify-center">
                <button
                  type="button"
                  {...target(`drop-${where}`)}
                  data-drop={where}
                  tabIndex={interactive && carrying ? 0 : -1}
                  aria-disabled={!carrying}
                  aria-label={carrying ? t('dropOn', { item: name(carrying), target: name(where) }) : name(where)}
                  onClick={() => {
                    if (carrying) drop(carrying, where);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-control p-1 select-none',
                    'focus-visible:outline-2 focus-visible:outline-ink',
                    armed ? 'cursor-pointer' : 'cursor-default',
                    drag?.over === where && 'bg-ink text-surface',
                  )}
                >
                  <PixelIcon bitmap={ICONS[where]} inverted={drag?.over === where} />
                  <IconLabel inverted={drag?.over === where}>{name(where)}</IconLabel>
                  {inside.length > 0 ? (
                    <span className="ao-pixel-label font-[family-name:var(--ao-font-pixel)] text-[8px] text-muted">
                      {inside.map(name).join(' ')}
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}

          {/* Physical: the ghost follows pointer coordinates inside the LTR desk. */}
          {drag?.moved ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 opacity-70"
              style={{ transform: `translate(${drag.x - 24}px, ${drag.y - 24}px)` }}
            >
              <PixelIcon bitmap={ICONS[drag.item]} />
            </span>
          ) : null}
        </div>
      </div>

      <p aria-live={interactive ? 'polite' : undefined} className="min-h-5 font-body text-sm text-ink">
        {announcement}
      </p>
      {carrying && interactive ? (
        <button
          type="button"
          onClick={() => {
            const item = carrying;
            setCarrying(null);
            focusTarget(`item-${item}`);
          }}
          className="self-start font-mono text-xs text-muted underline"
        >
          {t('cancel')}
        </button>
      ) : null}
      <p className="font-body text-xs text-muted">{t('keyboardHelp')}</p>
    </PuzzleSurface>
  );
}

function PixelIcon({ bitmap, inverted = false }: { bitmap: Bitmap; inverted?: boolean }) {
  const width = bitmapWidth(bitmap);
  return (
    <svg
      viewBox={`0 0 ${width} ${bitmap.length}`}
      width={width * 3}
      height={bitmap.length * 3}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d={bitmapPath(bitmap, 'o')} className={inverted ? 'fill-ink' : 'fill-surface'} />
      <path d={bitmapPath(bitmap, 'X')} className={inverted ? 'fill-surface' : 'fill-ink'} />
    </svg>
  );
}

function IconLabel({ children, inverted = false }: { children: string; inverted?: boolean }) {
  return (
    <span
      className={cn(
        'px-1 ao-pixel-label font-[family-name:var(--ao-font-pixel)] text-[8px] leading-3',
        inverted ? 'bg-ink text-surface' : 'bg-surface text-ink',
      )}
    >
      {children}
    </span>
  );
}
