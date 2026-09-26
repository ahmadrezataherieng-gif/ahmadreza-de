/**
 * The sound of the desktop, in the browser (APP-12). Off until the visitor
 * turns it on with a click; that click is also what lets the browser start an
 * AudioContext at all, so nothing here can ever play on load or unasked. The
 * tones come from `sound.ts` and are synthesised with Web Audio - nothing is
 * fetched, nothing is stored (the switch lives in memory and is off again on the
 * next page load, which is what the autoplay rules would demand anyway).
 *
 * Which profile plays is read from `<html data-sound>`, which the theme engine
 * already sets, so the Time Machine changes the sound with the era for free.
 */

import { MASTER_VOLUME, isSoundProfile, recipe, type SoundEvent, type Tone } from './sound.ts';

type AudioContextClass = typeof AudioContext;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

function audioContextClass(): AudioContextClass | null {
  if (typeof window === 'undefined') return null;
  const scoped = window as unknown as { AudioContext?: AudioContextClass; webkitAudioContext?: AudioContextClass };
  return scoped.AudioContext ?? scoped.webkitAudioContext ?? null;
}

/** Whether this browser can make the sounds at all. */
export function canPlaySound(): boolean {
  return audioContextClass() !== null;
}

export const isSoundOn = (): boolean => enabled;

/** The profile of the theme on screen. */
function currentProfile(): string | undefined {
  const value = typeof document === 'undefined' ? undefined : document.documentElement.dataset.sound;
  return isSoundProfile(value) ? value : undefined;
}

/**
 * Turn the sound on or off. Call it from the click that asks for it: turning it
 * on creates the AudioContext, and a context made in a gesture is allowed to
 * sound. Returns whether sound is on afterwards (false when the browser has no
 * Web Audio, so the switch can say so instead of pretending).
 */
export function setSoundEnabled(on: boolean): boolean {
  if (!on) {
    enabled = false;
    return false;
  }
  const Context = audioContextClass();
  if (!Context) return false;
  try {
    if (!context) {
      context = new Context();
      master = context.createGain();
      master.gain.value = MASTER_VOLUME;
      master.connect(context.destination);
    }
    void context.resume();
    enabled = true;
  } catch {
    enabled = false;
  }
  if (enabled) playSound('confirm');
  return enabled;
}

/**
 * Schedule tones on any audio context, live or offline. `playSound` uses it,
 * and so does `scripts/verify/sound.mjs`, which renders every profile and event
 * through an OfflineAudioContext to check they are audible, never near
 * clipping and short (queue 5b) - the same code the visitor hears.
 */
export function scheduleTones(audio: BaseAudioContext, destination: AudioNode, tones: readonly Tone[], start: number): void {
  for (const spec of tones) {
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    oscillator.type = spec.wave;
    oscillator.frequency.setValueAtTime(spec.hz, start + spec.at);
    if (spec.to) oscillator.frequency.linearRampToValueAtTime(spec.to, start + spec.at + spec.length);
    // Soft edges, so no tone clicks.
    const edge = Math.min(0.005, spec.length / 4);
    envelope.gain.setValueAtTime(0, start + spec.at);
    envelope.gain.linearRampToValueAtTime(spec.gain, start + spec.at + edge);
    envelope.gain.setValueAtTime(spec.gain, start + spec.at + spec.length - edge);
    envelope.gain.linearRampToValueAtTime(0, start + spec.at + spec.length);
    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(start + spec.at);
    oscillator.stop(start + spec.at + spec.length + 0.02);
  }
}

/** Play an event's sound for the theme on screen. Silent when sound is off. */
export function playSound(event: SoundEvent): void {
  if (!enabled || !context || !master || context.state === 'closed') return;
  scheduleTones(context, master, recipe(currentProfile(), event), context.currentTime + 0.01);
}
