'use client';

import { create } from 'zustand';
import type { AppId } from '@/content/eras';

/**
 * Shell UI that is not a window: the notice shown when a locked app is
 * activated. Not persisted.
 */
interface ShellStore {
  /** The locked app whose notice is showing, if any. */
  lockedNotice: AppId | null;
  showLocked: (id: AppId) => void;
  dismissLocked: () => void;
}

export const useShellStore = create<ShellStore>((set) => ({
  lockedNotice: null,
  showLocked: (id) => set({ lockedNotice: id }),
  dismissLocked: () => set({ lockedNotice: null }),
}));
