'use client';

import { create } from 'zustand';

import { canPlaySound, setSoundEnabled } from '@/lib/sound-engine';

/**
 * Whether the desktop makes sounds (APP-12). Off on every page load and never
 * persisted: the visitor turns it on with a click, which is also what lets the
 * browser start audio, and there is nothing to store or to list in the privacy
 * policy. `available` is false in a browser without Web Audio.
 */
interface SoundStore {
  enabled: boolean;
  available: boolean;
  /** Call from a click handler. */
  toggle: () => void;
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  enabled: false,
  available: true,
  toggle: () => {
    const on = setSoundEnabled(!get().enabled);
    set({ enabled: on, available: canPlaySound() });
  },
}));
