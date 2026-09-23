import type { MorseStep } from '@/components/apps/binary/codec';

/**
 * Plays a Morse timeline as a tone and reports the signal's state for the
 * light. Created only from a click (never on load, never autoplay): browsers
 * allow an AudioContext to sound only after a user gesture anyway, and a site
 * that beeps unasked is rude. Web Audio is generated in the browser - nothing
 * is fetched. Without Web Audio the light still runs, on the page clock.
 */
export interface MorsePlayback {
  stop: () => void;
  setVolume: (volume: number) => void;
}

interface PlayOptions {
  unitMs: number;
  /** 0 to 1. */
  volume: number;
  /** The signal switched on or off: drives the light. */
  onSignal: (on: boolean) => void;
  onEnd: () => void;
}

/** A tone in the range Morse operators actually use, easy on the ear. */
const TONE_HZ = 600;
/** Soft edges on every tone, so the signal does not click. */
const RAMP_S = 0.006;
/** The loudest the slider goes: a sine at full scale is harsh on headphones. */
const MAX_GAIN = 0.35;

type AudioContextClass = typeof AudioContext;

function audioContextClass(): AudioContextClass | null {
  if (typeof window === 'undefined') return null;
  const scoped = window as unknown as { AudioContext?: AudioContextClass; webkitAudioContext?: AudioContextClass };
  return scoped.AudioContext ?? scoped.webkitAudioContext ?? null;
}

export function canPlayAudio(): boolean {
  return audioContextClass() !== null;
}

export function playMorse(steps: readonly MorseStep[], options: PlayOptions): MorsePlayback {
  const unit = options.unitMs / 1000;
  const Context = audioContextClass();
  let context: AudioContext | null = null;
  let master: GainNode | null = null;

  // A short lead-in, so the first tone is not cut by the context starting up.
  const lead = 0.1;
  let startAt = 0;

  if (Context) {
    try {
      context = new Context();
      master = context.createGain();
      master.gain.value = options.volume * MAX_GAIN;
      master.connect(context.destination);
      const envelope = context.createGain();
      envelope.gain.value = 0;
      envelope.connect(master);
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = TONE_HZ;
      oscillator.connect(envelope);

      startAt = context.currentTime + lead;
      let at = startAt;
      for (const step of steps) {
        const end = at + step.units * unit;
        if (step.on) {
          envelope.gain.setValueAtTime(0, at);
          envelope.gain.linearRampToValueAtTime(1, at + RAMP_S);
          envelope.gain.setValueAtTime(1, end - RAMP_S);
          envelope.gain.linearRampToValueAtTime(0, end);
        }
        at = end;
      }
      oscillator.start(startAt);
      oscillator.stop(at + 0.05);
    } catch {
      context = null;
      master = null;
    }
  }

  // One schedule for the light: where each "on" step starts and ends.
  const spans: { from: number; to: number }[] = [];
  let offset = 0;
  for (const step of steps) {
    const next = offset + step.units * unit;
    if (step.on) spans.push({ from: offset, to: next });
    offset = next;
  }
  const total = offset;

  const clockStart = performance.now() / 1000 + lead;
  const elapsed = () => (context ? context.currentTime - startAt : performance.now() / 1000 - clockStart);

  let frame = 0;
  let lit = false;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    const now = elapsed();
    const on = spans.some((span) => now >= span.from && now < span.to);
    if (on !== lit) {
      lit = on;
      options.onSignal(on);
    }
    if (now >= total) {
      finish();
      options.onEnd();
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  function finish() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    if (lit) options.onSignal(false);
    lit = false;
    void context?.close().catch(() => undefined);
    context = null;
  }

  return {
    stop: finish,
    setVolume: (volume) => {
      if (master && context) master.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)) * MAX_GAIN, context.currentTime, 0.02);
    },
  };
}
