'use client';

import { create } from 'zustand';
import type { AppId } from '@/content/eras';

/**
 * The AhmadOS window manager's state (DECISIONS.md 49).
 *
 * Deliberately not persisted: a reload starts on a clean desktop. One window
 * per app - opening an open app brings it back and focuses it.
 *
 * Geometry is logical: `x` is the offset from the desktop's inline-start edge,
 * so the same numbers lay out mirrored in Persian. Everything is kept inside
 * the desktop area (between the top bar and the taskbar); the area is measured
 * by the shell and every rect is clamped against it.
 */

export type WindowMode = 'normal' | 'minimised' | 'maximised';

export interface Rect {
  /** Offset from the inline-start edge of the desktop area. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: AppId;
  rect: Rect;
  mode: WindowMode;
  /** Stacking order; higher is nearer. Ranked into the z-index band on render. */
  z: number;
  /** Set when close is requested; the window removes itself once it has faded. */
  closing: boolean;
}

interface Area {
  width: number;
  height: number;
}

interface WindowStore {
  /** In the order they were opened, so the DOM (and Tab order) stays stable. */
  windows: WindowState[];
  focusedId: AppId | null;
  area: Area;
  setArea: (area: Area) => void;
  open: (id: AppId, size: { width: number; height: number }) => void;
  requestClose: (id: AppId) => void;
  remove: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimise: (id: AppId) => void;
  maximise: (id: AppId) => void;
  restore: (id: AppId) => void;
  toggleMaximise: (id: AppId) => void;
  setRect: (id: AppId, rect: Rect) => void;
  /** Focus the next (1) or previous (-1) window in stacking order. */
  cycle: (direction: 1 | -1) => AppId | null;
}

export const MIN_WINDOW = { width: 300, height: 200 } as const;

/** New windows step down and inward from the top-start corner. */
const CASCADE = { start: 32, top: 24, step: 28, steps: 8 } as const;

/** Keep a rect inside the area: never larger than it, never past an edge. */
export function clampRect(rect: Rect, area: Area): Rect {
  const width = Math.round(Math.max(Math.min(rect.width, area.width), Math.min(MIN_WINDOW.width, area.width)));
  const height = Math.round(Math.max(Math.min(rect.height, area.height), Math.min(MIN_WINDOW.height, area.height)));
  return {
    width,
    height,
    x: Math.round(Math.min(Math.max(rect.x, 0), Math.max(0, area.width - width))),
    y: Math.round(Math.min(Math.max(rect.y, 0), Math.max(0, area.height - height))),
  };
}

let cascadeIndex = 0;
let zCounter = 0;

/** The top window that is not minimised - where focus goes when one leaves. */
function topVisible(windows: WindowState[], except?: AppId): AppId | null {
  const candidates = windows.filter((w) => w.id !== except && w.mode !== 'minimised' && !w.closing);
  if (candidates.length === 0) return null;
  return candidates.reduce((top, w) => (w.z > top.z ? w : top)).id;
}

function update(windows: WindowState[], id: AppId, change: Partial<WindowState>): WindowState[] {
  return windows.map((w) => (w.id === id ? { ...w, ...change } : w));
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedId: null,
  area: { width: 0, height: 0 },

  setArea: (area) => {
    const { windows, area: previous } = get();
    if (previous.width === area.width && previous.height === area.height) return;
    set({ area, windows: windows.map((w) => ({ ...w, rect: clampRect(w.rect, area) })) });
  },

  open: (id, size) => {
    const { windows, area } = get();
    zCounter += 1;
    const existing = windows.find((w) => w.id === id);
    if (existing) {
      set({
        windows: update(windows, id, {
          z: zCounter,
          closing: false,
          mode: existing.mode === 'minimised' ? 'normal' : existing.mode,
        }),
        focusedId: id,
      });
      return;
    }
    const step = cascadeIndex % CASCADE.steps;
    cascadeIndex += 1;
    const rect = clampRect(
      { x: CASCADE.start + step * CASCADE.step, y: CASCADE.top + step * CASCADE.step, ...size },
      area,
    );
    set({ windows: [...windows, { id, rect, mode: 'normal', z: zCounter, closing: false }], focusedId: id });
  },

  requestClose: (id) => {
    const { windows } = get();
    set({ windows: update(windows, id, { closing: true }), focusedId: topVisible(windows, id) });
  },

  remove: (id) => {
    const windows = get().windows.filter((w) => w.id !== id);
    if (windows.length === 0) cascadeIndex = 0;
    set({ windows });
  },

  focus: (id) => {
    const { windows, focusedId } = get();
    const target = windows.find((w) => w.id === id);
    if (!target || target.closing) return;
    const isTop = windows.every((w) => w.id === id || w.z < target.z);
    if (focusedId === id && isTop && target.mode !== 'minimised') return;
    zCounter += 1;
    set({
      windows: update(windows, id, { z: zCounter, mode: target.mode === 'minimised' ? 'normal' : target.mode }),
      focusedId: id,
    });
  },

  minimise: (id) => {
    const { windows } = get();
    set({ windows: update(windows, id, { mode: 'minimised' }), focusedId: topVisible(windows, id) });
  },

  maximise: (id) => {
    zCounter += 1;
    set({ windows: update(get().windows, id, { mode: 'maximised', z: zCounter }), focusedId: id });
  },

  restore: (id) => {
    zCounter += 1;
    set({ windows: update(get().windows, id, { mode: 'normal', z: zCounter }), focusedId: id });
  },

  toggleMaximise: (id) => {
    const target = get().windows.find((w) => w.id === id);
    if (!target) return;
    if (target.mode === 'maximised') get().restore(id);
    else get().maximise(id);
  },

  setRect: (id, rect) => {
    const { windows, area } = get();
    set({ windows: update(windows, id, { rect: clampRect(rect, area) }) });
  },

  cycle: (direction) => {
    const { windows, focusedId } = get();
    const order = windows.filter((w) => !w.closing).sort((a, b) => b.z - a.z);
    if (order.length === 0) return null;
    // Stacking order changes as windows are raised, so cycle over a stable
    // list: the open order. Next goes forward through it, previous back.
    const stable = windows.filter((w) => !w.closing);
    const current = stable.findIndex((w) => w.id === focusedId);
    const next = stable[(current + direction + stable.length) % stable.length] ?? order[0];
    if (!next) return null;
    get().focus(next.id);
    return next.id;
  },
}));

/** Rank each window's `z` into consecutive places, 0 for the one at the back. */
export function stackRank(windows: readonly WindowState[], id: AppId): number {
  const target = windows.find((w) => w.id === id);
  if (!target) return 0;
  return windows.filter((w) => w.z < target.z).length;
}
