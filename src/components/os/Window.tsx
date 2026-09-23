'use client';

import {
  Suspense,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { AppId } from '@/content/eras';
import { getApp } from '@/components/apps/registry';
import { AppGlyph } from '@/components/apps/icons';
import { closeWindow, minimiseWindow } from '@/components/os/window-actions';
import { dirForLocale, type Locale } from '@/lib/i18n-config';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { cn } from '@/lib/cn';
import { count } from '@/lib/count';
import { appOpened } from '@/lib/counters';
import { MIN_WINDOW, stackRank, useWindowStore, type Rect } from '@/store/window-store';

/** Keyboard steps for moving and resizing from the title bar. */
const KEY_STEP = 16;

/** Which edges a resize handle moves. Logical: `start` is the left in German. */
type Edge = { block: 'top' | 'bottom' | null; inline: 'start' | 'end' | null };

const HANDLES: Array<{ edge: Edge; className: string }> = [
  { edge: { block: 'top', inline: null }, className: '-top-1 inset-x-3 h-2' },
  { edge: { block: 'bottom', inline: null }, className: '-bottom-1 inset-x-3 h-2' },
  { edge: { block: null, inline: 'start' }, className: '-start-1 inset-y-3 w-2' },
  { edge: { block: null, inline: 'end' }, className: '-end-1 inset-y-3 w-2' },
  { edge: { block: 'top', inline: 'start' }, className: '-top-1 -start-1 h-4 w-4' },
  { edge: { block: 'top', inline: 'end' }, className: '-top-1 -end-1 h-4 w-4' },
  { edge: { block: 'bottom', inline: 'start' }, className: '-bottom-1 -start-1 h-4 w-4' },
  { edge: { block: 'bottom', inline: 'end' }, className: '-bottom-1 -end-1 h-4 w-4' },
];

function cursorFor(edge: Edge, rtl: boolean): string {
  if (edge.block && edge.inline) {
    const topStart = (edge.block === 'top') === (edge.inline === 'start');
    // top-start is the top-left corner in LTR and the top-right one in RTL.
    return topStart !== rtl ? 'cursor-nwse-resize' : 'cursor-nesw-resize';
  }
  return edge.block ? 'cursor-ns-resize' : 'cursor-ew-resize';
}

/** A resized rect, with each moving edge stopped at the area and at the minimum size. */
function resizeRect(start: Rect, edge: Edge, dx: number, dy: number, area: { width: number; height: number }): Rect {
  let { x, y, width, height } = start;
  if (edge.inline === 'end') width = Math.min(Math.max(start.width + dx, MIN_WINDOW.width), area.width - start.x);
  if (edge.inline === 'start') {
    x = Math.min(Math.max(start.x + dx, 0), start.x + start.width - MIN_WINDOW.width);
    width = start.x + start.width - x;
  }
  if (edge.block === 'bottom') height = Math.min(Math.max(start.height + dy, MIN_WINDOW.height), area.height - start.y);
  if (edge.block === 'top') {
    y = Math.min(Math.max(start.y + dy, 0), start.y + start.height - MIN_WINDOW.height);
    height = start.y + start.height - y;
  }
  return { x, y, width, height };
}

interface Gesture {
  pointerId: number;
  clientX: number;
  clientY: number;
  rect: Rect;
  /** null: moving the window; otherwise the edges being resized. */
  edge: Edge | null;
}

/**
 * One Amonel OS window: a non-modal dialog (DECISIONS.md 49).
 *
 * - Drag it by the title bar, resize it from any edge or corner - pointer
 *   events, so mouse, touch and pen are one code path. It stays inside the
 *   desktop area.
 * - Double-click the title bar, or press Enter on it, to maximise and restore.
 * - With the title bar focused, the arrow keys move it and Shift+arrows resize
 *   it; the three buttons minimise, maximise or restore, and close.
 * - Geometry is logical, so everything mirrors in Persian; only the pointer's
 *   horizontal movement is flipped into logical terms.
 */
export function Window({ id }: { id: AppId }) {
  const t = useTranslations('os');
  const rtl = dirForLocale(useLocale() as Locale) === 'rtl';
  const reduced = useReducedMotion();
  const titleId = useId();
  const hintId = useId();

  const state = useWindowStore((store) => store.windows.find((w) => w.id === id));
  const focused = useWindowStore((store) => store.focusedId === id);
  const rank = useWindowStore((store) => stackRank(store.windows, id));
  const focus = useWindowStore((store) => store.focus);
  const toggleMaximise = useWindowStore((store) => store.toggleMaximise);
  const setRect = useWindowStore((store) => store.setRect);
  const remove = useWindowStore((store) => store.remove);

  const gesture = useRef<Gesture | null>(null);

  // Closing fades out, then removes itself - at once under reduced motion. A
  // timer backs up the animation event, which a hidden tab may never deliver.
  const closing = state?.closing ?? false;
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => remove(id), reduced ? 0 : 320);
    return () => window.clearTimeout(timer);
  }, [closing, reduced, remove, id]);

  // A window mounts when its app opens; `count` sends each name once per page load.
  useEffect(() => count(appOpened(id)), [id]);

  if (!state) return null;
  const { rect, mode } = state;
  const app = getApp(id);
  const title = t(app.titleKey);
  const maximised = mode === 'maximised';
  const hidden = mode === 'minimised' || closing;

  const logicalDx = (dx: number) => (rtl ? -dx : dx);

  const beginGesture = (event: PointerEvent<HTMLElement>, edge: Edge | null) => {
    if (event.button !== 0 || maximised) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, rect, edge };
  };

  const moveGesture = (event: PointerEvent<HTMLElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = logicalDx(event.clientX - current.clientX);
    const dy = event.clientY - current.clientY;
    const area = useWindowStore.getState().area;
    setRect(
      id,
      current.edge
        ? resizeRect(current.rect, current.edge, dx, dy, area)
        : { ...current.rect, x: current.rect.x + dx, y: current.rect.y + dy },
    );
  };

  const endGesture = (event: PointerEvent<HTMLElement>) => {
    if (gesture.current?.pointerId === event.pointerId) gesture.current = null;
  };

  const onBarPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // The buttons in the bar are buttons, not handles.
    if ((event.target as Element).closest('button')) return;
    beginGesture(event, null);
  };

  const onGripKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      toggleMaximise(id);
      return;
    }
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const step = arrows[event.key];
    if (!step || maximised || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const [dx, dy] = step;
    if (event.shiftKey) {
      // Wider or narrower, taller or shorter, from the far corner.
      const area = useWindowStore.getState().area;
      setRect(id, resizeRect(rect, { block: 'bottom', inline: 'end' }, dx, dy, area));
    } else {
      setRect(id, { ...rect, x: rect.x + logicalDx(dx), y: rect.y + dy });
    }
  };

  const style: CSSProperties = maximised
    ? { inset: 0 }
    : { insetInlineStart: rect.x, top: rect.y, width: rect.width, height: rect.height };
  style.zIndex = focused ? 'var(--ao-z-window-active)' : `calc(var(--ao-z-windows) + ${rank})`;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-window={id}
      data-mode={mode}
      data-focused={focused ? '' : undefined}
      inert={hidden}
      style={style}
      onPointerDownCapture={() => focus(id)}
      onFocusCapture={() => focus(id)}
      className={cn(
        'ao-window ao-themed pointer-events-auto absolute flex flex-col overflow-hidden rounded-window border bg-surface shadow-window',
        focused ? 'border-accent/60' : 'border-edge',
        mode === 'minimised' && 'ao-window--minimised',
        closing && 'ao-window--closing',
      )}
    >
      <div
        className="ao-window-bar flex h-10 shrink-0 touch-none items-center gap-1 border-b border-edge bg-elevated/70 ps-2 pe-1 select-none"
        onPointerDown={onBarPointerDown}
        onPointerMove={moveGesture}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onDoubleClick={(event) => {
          if (!(event.target as Element).closest('button')) toggleMaximise(id);
        }}
      >
        <div
          tabIndex={0}
          data-window-grip=""
          aria-label={t('window.grip', { title })}
          aria-describedby={hintId}
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight Enter"
          onKeyDown={onGripKeyDown}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-2 rounded-control px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
        >
          <AppGlyph appId={id} className={cn('h-4 w-4 shrink-0', focused ? 'text-accent' : 'text-muted')} />
          <h2 id={titleId} className="truncate font-mono text-xs tracking-wide text-ink">
            {title}
          </h2>
        </div>
        <span id={hintId} className="ao-sr-only">
          {t('window.gripHint')}
        </span>
        <WindowButton label={t('window.minimize')} action="window-minimise" onClick={() => minimiseWindow(id)}>
          <path d="M4 11.5h8" />
        </WindowButton>
        <WindowButton
          label={maximised ? t('window.restore') : t('window.maximize')}
          action={maximised ? 'window-restore' : 'window-maximise'}
          onClick={() => toggleMaximise(id)}
        >
          {maximised ? <path d="M5.5 6.5h6v6h-6zM7.5 6.5V4.5h6v6h-2" /> : <path d="M4 4.5h8v7.5H4z" />}
        </WindowButton>
        <WindowButton label={t('window.close')} action="window-close" onClick={() => closeWindow(id)} danger>
          <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
        </WindowButton>
      </div>

      <div data-window-body="" tabIndex={-1} className="min-h-0 flex-1 overflow-auto outline-none">
        <Suspense fallback={<p className="p-6 font-mono text-xs text-muted">{t('window.loading')}</p>}>
          <app.Component appId={id} />
        </Suspense>
      </div>

      {maximised
        ? null
        : HANDLES.map(({ edge, className }) => (
            <div
              key={`${edge.block}-${edge.inline}`}
              aria-hidden="true"
              data-resize={[edge.block, edge.inline].filter(Boolean).join('-')}
              className={cn('absolute touch-none', className, cursorFor(edge, rtl))}
              onPointerDown={(event) => {
                event.stopPropagation();
                beginGesture(event, edge);
              }}
              onPointerMove={moveGesture}
              onPointerUp={endGesture}
              onPointerCancel={endGesture}
            />
          ))}
    </section>
  );
}

function WindowButton({
  label,
  action,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  action: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-action={action}
      onClick={onClick}
      className={cn(
        'ao-themed flex h-7 w-8 shrink-0 cursor-pointer items-center justify-center rounded-control text-muted',
        'hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
        danger && 'hover:bg-error hover:text-background',
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
