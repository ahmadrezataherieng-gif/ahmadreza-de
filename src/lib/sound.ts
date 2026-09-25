/**
 * The sounds of the desktop, as data: for each theme's sound profile and each
 * event, a few short tones (APP-12). Nothing here plays; `sound-engine.ts`
 * synthesises them with Web Audio, only after the visitor turned sound on
 * with a click. No sample files, so nothing is fetched and no third party's
 * recording is copied: every sound is a handful of sine, square or triangle
 * tones in the style of the era - a relay's clack, a teletype's bell, the
 * terminal bell, the PC speaker's square wave, a soft chord, a rising
 * arpeggio, a modern tick. The tunes are generic on purpose.
 *
 * Pure and dependency-free, so `node --test` runs it as it is
 * (`scripts/test/sound.test.mjs`).
 */

export type SoundProfile = 'relay' | 'teletype' | 'terminal' | 'pcspeaker' | 'mac-boot' | 'win95' | 'modern' | 'silent';

/** What the desktop makes a sound for. `arrive` is the Time Machine landing in an era; `confirm` answers the visitor turning sound on. */
export type SoundEvent = 'open' | 'close' | 'arrive' | 'confirm';
export const SOUND_EVENTS: readonly SoundEvent[] = ['open', 'close', 'arrive', 'confirm'];

export interface Tone {
  /** Start, seconds after the event. */
  at: number;
  /** Length in seconds. */
  length: number;
  /** Frequency in Hz; `to` glides there over the tone. */
  hz: number;
  to?: number;
  wave: 'sine' | 'square' | 'triangle';
  /** 0 to 1, before the master volume. */
  gain: number;
}

/** No sound is longer than this, and none louder: a UI sound is a hint, never an event. */
export const MAX_SOUND_SECONDS = 1.2;
export const MAX_TONE_GAIN = 0.6;
/** The whole desktop's volume, in the engine: low, fixed, easy on headphones. */
export const MASTER_VOLUME = 0.12;

const tone = (at: number, length: number, hz: number, wave: Tone['wave'], gain: number, to?: number): Tone => ({ at, length, hz, wave, gain, ...(to ? { to } : {}) });

const clack = (at: number, hz: number): Tone => tone(at, 0.035, hz, 'square', 0.5, hz * 0.6);

/** The same tones for each event of a profile that has no separate sound for it. */
const RECIPES: Record<SoundProfile, Record<SoundEvent, readonly Tone[]>> = {
  // 1946: relays closing and opening.
  relay: {
    open: [clack(0, 180), clack(0.06, 140)],
    close: [clack(0, 140), clack(0.06, 180)],
    arrive: [clack(0, 180), clack(0.07, 150), clack(0.14, 120), clack(0.21, 180)],
    confirm: [clack(0, 160)],
  },
  // 1956: the teletype's chatter and its bell.
  teletype: {
    open: [tone(0, 0.025, 95, 'square', 0.45), tone(0.05, 0.025, 95, 'square', 0.45), tone(0.1, 0.025, 95, 'square', 0.45)],
    close: [tone(0, 0.03, 80, 'square', 0.45)],
    arrive: [tone(0, 0.5, 1100, 'sine', 0.5), tone(0, 0.5, 2200, 'sine', 0.15)],
    confirm: [tone(0, 0.3, 1100, 'sine', 0.4)],
  },
  // 1971: the terminal bell.
  terminal: {
    open: [tone(0, 0.06, 880, 'sine', 0.45)],
    close: [tone(0, 0.06, 660, 'sine', 0.45)],
    arrive: [tone(0, 0.18, 880, 'sine', 0.5)],
    confirm: [tone(0, 0.08, 880, 'sine', 0.4)],
  },
  // 1981: the PC speaker, a square wave and nothing else.
  pcspeaker: {
    open: [tone(0, 0.07, 1000, 'square', 0.35)],
    close: [tone(0, 0.07, 700, 'square', 0.35)],
    arrive: [tone(0, 0.09, 800, 'square', 0.35), tone(0.1, 0.09, 1200, 'square', 0.35)],
    confirm: [tone(0, 0.06, 1000, 'square', 0.3)],
  },
  // 1984: a soft chord.
  'mac-boot': {
    open: [tone(0, 0.18, 523, 'sine', 0.35), tone(0, 0.18, 659, 'sine', 0.25)],
    close: [tone(0, 0.18, 392, 'sine', 0.35), tone(0, 0.18, 494, 'sine', 0.25)],
    arrive: [tone(0, 0.9, 523, 'sine', 0.35), tone(0, 0.9, 659, 'sine', 0.28), tone(0, 0.9, 784, 'sine', 0.24)],
    confirm: [tone(0, 0.25, 523, 'sine', 0.35), tone(0, 0.25, 784, 'sine', 0.25)],
  },
  // 1995: a rising run of notes.
  win95: {
    open: [tone(0, 0.09, 523, 'triangle', 0.4), tone(0.08, 0.11, 784, 'triangle', 0.4)],
    close: [tone(0, 0.09, 784, 'triangle', 0.4), tone(0.08, 0.11, 523, 'triangle', 0.4)],
    arrive: [tone(0, 0.1, 523, 'triangle', 0.4), tone(0.1, 0.1, 659, 'triangle', 0.4), tone(0.2, 0.1, 784, 'triangle', 0.4), tone(0.3, 0.3, 1047, 'triangle', 0.4)],
    confirm: [tone(0, 0.1, 659, 'triangle', 0.35), tone(0.09, 0.14, 988, 'triangle', 0.35)],
  },
  // Today: a light tick.
  modern: {
    open: [tone(0, 0.05, 660, 'sine', 0.3, 990)],
    close: [tone(0, 0.05, 990, 'sine', 0.3, 660)],
    arrive: [tone(0, 0.12, 660, 'sine', 0.3, 1320)],
    confirm: [tone(0, 0.08, 880, 'sine', 0.3, 1320)],
  },
  silent: { open: [], close: [], arrive: [], confirm: [] },
};

export const SOUND_PROFILES = Object.keys(RECIPES) as readonly SoundProfile[];

export function isSoundProfile(value: unknown): value is SoundProfile {
  return typeof value === 'string' && Object.hasOwn(RECIPES, value);
}

/** The tones for an event under a profile; an unknown profile gets the modern one. */
export function recipe(profile: string | undefined, event: SoundEvent): readonly Tone[] {
  return RECIPES[isSoundProfile(profile) ? profile : 'modern'][event];
}

/** How long an event's sound lasts, in seconds. */
export function duration(tones: readonly Tone[]): number {
  return tones.reduce((end, next) => Math.max(end, next.at + next.length), 0);
}
