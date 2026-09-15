/**
 * Turn a line of text into per-character glyphs for the mechanical printing
 * effect used by the 1956, 1971 and 1981 eras.
 *
 * Every value here is derived from a hash of the character's position, never
 * from Math.random. Two reasons: the server-rendered HTML and the first client
 * render have to agree or React throws a hydration mismatch, and a visitor who
 * scrolls back up should see the same page they just left.
 *
 * The glyphs carry timing and imperfection only. All the motion happens in CSS
 * (see `.ao-type` in globals.css), so printing a screen of text costs zero JS
 * timers and zero per-frame work.
 */

export interface Glyph {
  /** A single character, or a whole word when printing a joining script. */
  text: string;
  /** Seconds of animation-delay, so characters strike in sequence. */
  delay: number;
  /** Final opacity, 0..1. Uneven ink density. */
  ink: number;
  /** Horizontal offset in em. Carriage jitter. */
  jitter: number;
  /** Struck twice, slightly off-register. */
  overstruck: boolean;
}

export interface TypesetOptions {
  /** Seconds between characters. */
  step?: number;
  /** Seconds before the first character of this block. */
  startDelay?: number;
  /** 0 disables jitter and uneven ink - right for a CRT, wrong for a teletype. */
  imperfection?: number;
  /**
   * 'char' strikes one character at a time. 'word' strikes whole words, which is
   * mandatory for Persian: wrapping each letter of a joining script in its own
   * span breaks the contextual shaping that connects the letters.
   */
  unit?: 'char' | 'word';
}

/** Split into strike units. Word mode keeps runs of whitespace as their own units. */
function units(text: string, unit: 'char' | 'word'): string[] {
  if (unit === 'char') return Array.from(text);
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

/** Deterministic hash to a float in [0, 1). */
function noise(seed: number): number {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/**
 * @param text       the line to print
 * @param seedOffset a per-line offset so identical lines do not print identically
 */
export function typeset(
  text: string,
  seedOffset: number,
  options: TypesetOptions = {},
): Glyph[] {
  const { step = 0.028, startDelay = 0, imperfection = 1, unit = 'char' } = options;
  // A word takes roughly as long to strike as its letters would.
  const unitStep = unit === 'word' ? step * 4 : step;

  return units(text, unit).map((part, index) => {
    const seed = seedOffset * 7919 + index;
    const a = noise(seed);
    const b = noise(seed + 104729);

    // A little variance in the step keeps the rhythm mechanical rather than
    // metronomic: real print heads do not arrive exactly on the beat.
    const wobble = (a - 0.5) * unitStep * 0.6 * imperfection;

    return {
      text: part,
      delay: Math.max(0, startDelay + index * unitStep + wobble),
      ink: 1 - b * 0.28 * imperfection,
      jitter: (a - 0.5) * 0.06 * imperfection,
      // Roughly one character in forty is struck twice. Chosen by position, so
      // it lands on different characters in each locale but always looks the
      // same for a given one.
      overstruck: imperfection > 0 && a > 0.975,
    };
  });
}

/** Total seconds a block takes to print, for scheduling what follows it. */
export function typesetDuration(glyphs: Glyph[]): number {
  return glyphs.length === 0 ? 0 : glyphs[glyphs.length - 1].delay + 0.09;
}

export interface TypesetBlock {
  lines: Glyph[][];
  /** Seconds from the block's start until its last glyph has struck. */
  end: number;
}

/**
 * Typeset several lines that print one after another, as a print head or a
 * terminal would: each line starts where the previous one finished, with a
 * short carriage-return pause between them.
 */
export function typesetLines(
  lines: readonly string[],
  seedBase: number,
  options: TypesetOptions & { lineGap?: number } = {},
): TypesetBlock {
  const { lineGap = 0.12, startDelay = 0, ...rest } = options;
  let cursor = startDelay;

  const typeset_ = lines.map((line, index) => {
    const glyphs = typeset(line, seedBase + index, { ...rest, startDelay: cursor });
    cursor = (glyphs.length === 0 ? cursor : typesetDuration(glyphs)) + lineGap;
    return glyphs;
  });

  return { lines: typeset_, end: cursor };
}
