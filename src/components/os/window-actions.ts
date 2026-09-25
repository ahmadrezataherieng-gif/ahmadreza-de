'use client';

import type { AppId } from '@/content/eras';
import { getApp } from '@/components/apps/registry';
import { selectIsAppUnlocked, useUnlockStore } from '@/store/unlock-store';
import { useShellStore } from '@/store/shell-store';
import { useWindowStore } from '@/store/window-store';
import { playSound } from '@/lib/sound-engine';

/**
 * Window actions with their focus management, for every control that triggers
 * them - icons, launcher, taskbar, title bar buttons and keyboard shortcuts.
 *
 * Windows are non-modal dialogs. Focus goes into a window when it opens or is
 * brought forward; when a window closes it returns to whatever opened it, or
 * failing that to the next window, or to the launcher; when a window is
 * minimised it goes to that window's taskbar button, so the keyboard user is
 * never dropped on <body>.
 */

/** The control each window was opened from, to return focus to on close. */
const openers = new Map<AppId, HTMLElement>();

export const LAUNCHER_BUTTON_ID = 'ao-launcher-button';

function afterRender(run: () => void): void {
  // Two frames: the store update has rendered and any visibility change applied.
  requestAnimationFrame(() => requestAnimationFrame(run));
}

/**
 * Focus into a window. Retried for a few frames until focus is really inside:
 * a window coming back from minimised is not focusable until it is no longer
 * inert and hidden, and the frame that happens in varies (it raced under
 * reduced motion).
 */
export function focusWindow(id: AppId): void {
  let attempts = 0;
  const attempt = () => {
    const windowElement = document.querySelector<HTMLElement>(`[data-window="${id}"]`);
    const inside = () => !!windowElement && windowElement.contains(document.activeElement);
    if (inside()) return;
    windowElement?.querySelector<HTMLElement>('[data-window-body]')?.focus({ preventScroll: true });
    attempts += 1;
    if (!inside() && attempts < 10) requestAnimationFrame(attempt);
  };
  afterRender(attempt);
}

/** Open an app, or show which puzzle unlocks it. Returns whether it opened. */
export function launchApp(id: AppId): boolean {
  const unlocked = selectIsAppUnlocked(id)(useUnlockStore.getState());
  if (!unlocked) {
    useShellStore.getState().showLocked(id);
    return false;
  }
  useShellStore.getState().dismissLocked();
  if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
    openers.set(id, document.activeElement);
  }
  useWindowStore.getState().open(id, getApp(id).size);
  playSound('open');
  focusWindow(id);
  return true;
}

export function closeWindow(id: AppId): void {
  const opener = openers.get(id);
  openers.delete(id);
  useWindowStore.getState().requestClose(id);
  playSound('close');
  const next = useWindowStore.getState().focusedId;
  afterRender(() => {
    if (opener?.isConnected && opener.offsetParent !== null) {
      opener.focus({ preventScroll: true });
    } else if (next) {
      focusWindow(next);
    } else {
      document.getElementById(LAUNCHER_BUTTON_ID)?.focus({ preventScroll: true });
    }
  });
}

export function minimiseWindow(id: AppId): void {
  useWindowStore.getState().minimise(id);
  afterRender(() => {
    document.querySelector<HTMLElement>(`[data-taskbar-window="${id}"]`)?.focus({ preventScroll: true });
  });
}

export function raiseWindow(id: AppId): void {
  useWindowStore.getState().focus(id);
  focusWindow(id);
}

/** A taskbar button: bring a window forward, or tuck the front one away. */
export function toggleFromTaskbar(id: AppId): void {
  const { windows, focusedId } = useWindowStore.getState();
  const target = windows.find((w) => w.id === id);
  if (!target) return;
  if (focusedId === id && target.mode !== 'minimised') minimiseWindow(id);
  else raiseWindow(id);
}

export function cycleWindows(direction: 1 | -1): void {
  const id = useWindowStore.getState().cycle(direction);
  if (id) focusWindow(id);
}
