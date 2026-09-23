/**
 * Binary & Morse (Phase 9D-1, DECISIONS.md 57): the 1946 truth - text is
 * numbers - made visible. Pure functions only, so plain node tests them
 * (`scripts/test/binary.test.mjs`); the component renders what they return.
 *
 * Every conversion goes through UTF-8, the encoding the web actually uses:
 * a Latin letter is one byte, a Persian letter two, most emoji four.
 */

/** Longest input the converter takes; enough to play with, small enough to render. */
export const MAX_INPUT = 200;

export type ByteFormat = 'binary' | 'hex' | 'decimal';
export type SourceFormat = 'text' | ByteFormat;
export const sourceFormats: readonly SourceFormat[] = ['text', 'binary', 'hex', 'decimal'];

const encoder = new TextEncoder();

export function utf8(text: string): Uint8Array {
  return encoder.encode(text);
}

/** One byte in a format: 8 binary digits, 2 hex digits, or its decimal value. */
export function formatByte(byte: number, format: ByteFormat): string {
  switch (format) {
    case 'binary':
      return byte.toString(2).padStart(8, '0');
    case 'hex':
      return byte.toString(16).toUpperCase().padStart(2, '0');
    case 'decimal':
      return String(byte);
  }
}

export function formatBytes(bytes: Uint8Array, format: ByteFormat): string {
  return Array.from(bytes, (byte) => formatByte(byte, format)).join(' ');
}

/** Why a byte string could not be read back into text. */
export type ParseError = 'empty' | 'invalidDigit' | 'incompleteByte' | 'outOfRange' | 'invalidUtf8' | 'tooLong';

export type ParseResult = { ok: true; bytes: Uint8Array; text: string } | { ok: false; error: ParseError };

const decoder = new TextDecoder('utf-8', { fatal: true });

function decode(bytes: number[]): ParseResult {
  const array = Uint8Array.from(bytes);
  try {
    return { ok: true, bytes: array, text: decoder.decode(array) };
  } catch {
    return { ok: false, error: 'invalidUtf8' };
  }
}

/**
 * Read bytes typed in a format back into text. Binary and hex may be written
 * with or without spaces (then read in groups of 8 or 2 digits); decimal needs
 * separators. `0b` / `0x` prefixes are accepted.
 */
export function parseBytes(input: string, format: ByteFormat): ParseResult {
  const trimmed = input.trim();
  if (trimmed === '') return { ok: false, error: 'empty' };
  if (trimmed.length > MAX_INPUT * 9) return { ok: false, error: 'tooLong' };

  if (format === 'decimal') {
    const parts = trimmed.split(/[\s,;]+/).filter(Boolean);
    const bytes: number[] = [];
    for (const part of parts) {
      if (!/^\d+$/.test(part)) return { ok: false, error: 'invalidDigit' };
      const value = Number(part);
      if (value > 255) return { ok: false, error: 'outOfRange' };
      bytes.push(value);
    }
    return decode(bytes);
  }

  const width = format === 'binary' ? 8 : 2;
  const digit = format === 'binary' ? /^[01]+$/ : /^[0-9a-f]+$/i;
  const prefix = format === 'binary' ? /^0b/i : /^0x/i;
  const groups = trimmed.split(/[\s,;]+/).filter(Boolean).map((group) => group.replace(prefix, ''));
  const bytes: number[] = [];
  for (const group of groups) {
    if (!digit.test(group)) return { ok: false, error: 'invalidDigit' };
    // A short group is one byte without its leading zeros; a longer one is
    // several bytes written together, and must split into whole bytes.
    if (group.length > width && group.length % width !== 0) return { ok: false, error: 'incompleteByte' };
    for (let index = 0; index < group.length; index += width) {
      bytes.push(parseInt(group.slice(index, index + width), format === 'binary' ? 2 : 16));
    }
  }
  return decode(bytes);
}

/** Text from any source format: typed text as it is, bytes parsed. */
export function readSource(input: string, format: SourceFormat): ParseResult {
  if (format === 'text') {
    if (input.length > MAX_INPUT) return { ok: false, error: 'tooLong' };
    return { ok: true, bytes: utf8(input), text: input };
  }
  return parseBytes(input, format);
}

/** One character - one Unicode code point - and the UTF-8 bytes that carry it. */
export interface EncodedChar {
  char: string;
  /** "U+0041", the code point as Unicode writes it. */
  codePoint: string;
  bytes: number[];
}

export function utf8Breakdown(text: string): EncodedChar[] {
  return Array.from(text, (char) => ({
    char,
    codePoint: `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`,
    bytes: Array.from(utf8(char)),
  }));
}

/** How many bytes UTF-8 needs for one code point: 1 to 4, from its value alone. */
export function utf8Length(codePoint: number): 1 | 2 | 3 | 4 {
  if (codePoint < 0x80) return 1;
  if (codePoint < 0x800) return 2;
  if (codePoint < 0x10000) return 3;
  return 4;
}

/* --- Morse ------------------------------------------------------------------- */

/**
 * International Morse code, ITU-R M.1677-1: the 26 Latin letters, é, the ten
 * digits and the punctuation it defines. Nothing else - no umlauts, no ß, no
 * Persian letters: those are national extensions or none at all, and the app
 * says so rather than guessing.
 */
export const MORSE: Readonly<Record<string, string>> = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..',
  j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.',
  s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
  é: '..-..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', ':': '---...', '?': '..--..', "'": '.----.', '-': '-....-',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '"': '.-..-.', '=': '-...-', '+': '.-.-.',
  '@': '.--.-.', '!': '-.-.--', '&': '.-...', ';': '-.-.-.', _: '..--.-', $: '...-..-',
} as const;

const FROM_MORSE: ReadonlyMap<string, string> = new Map(Object.entries(MORSE).map(([char, code]) => [code, char]));

export interface MorseEncoding {
  /** Letters separated by one space, words by " / ". */
  code: string;
  /** Characters Morse has no code for, each once, in order of appearance. */
  unsupported: string[];
}

export function textToMorse(text: string): MorseEncoding {
  const unsupported: string[] = [];
  const words = text
    .normalize('NFC')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      Array.from(word)
        .map((char) => {
          const key = char.toLowerCase();
          if (Object.hasOwn(MORSE, key)) return MORSE[key] ?? null;
          if (!unsupported.includes(char)) unsupported.push(char);
          return null;
        })
        .filter((code): code is string => code !== null)
        .join(' '),
    )
    .filter(Boolean);
  return { code: words.join(' / '), unsupported };
}

export interface MorseDecoding {
  text: string;
  /** Sequences that are not a Morse character, each once. */
  unknown: string[];
}

/** Read dots and dashes back. Accepts `.` `-`, the typographic `·` `–` `—` and `_`. */
export function morseToText(input: string): MorseDecoding {
  const unknown: string[] = [];
  const normalised = input.replace(/[·•]/g, '.').replace(/[–—_−]/g, '-').trim();
  const text = normalised
    .split(/\s*[/|]\s*|\s{3,}/)
    .map((word) =>
      word
        .split(/\s+/)
        .filter(Boolean)
        .map((symbol) => {
          const char = FROM_MORSE.get(symbol);
          if (char !== undefined) return char;
          if (!unknown.includes(symbol)) unknown.push(symbol);
          return '';
        })
        .join(''),
    )
    .filter(Boolean)
    .join(' ');
  return { text: text.toUpperCase(), unknown };
}

/** A stretch of the signal: on (a dot or a dash) or off (a gap), in units. */
export interface MorseStep {
  on: boolean;
  units: number;
}

/**
 * Standard timing: dot 1 unit, dash 3, the gap inside a letter 1, between
 * letters 3, between words 7. Only the "on" steps and the gaps between them;
 * no trailing gap.
 */
export function morseTimeline(code: string): MorseStep[] {
  const steps: MorseStep[] = [];
  const gap = (units: number) => {
    const last = steps.at(-1);
    if (!last) return;
    if (!last.on) last.units = Math.max(last.units, units);
    else steps.push({ on: false, units });
  };
  for (const word of code.split(' / ')) {
    gap(7);
    for (const letter of word.split(' ')) {
      gap(3);
      for (const symbol of letter) {
        if (symbol !== '.' && symbol !== '-') continue;
        gap(1);
        steps.push({ on: true, units: symbol === '.' ? 1 : 3 });
      }
    }
  }
  return steps;
}

export function timelineUnits(steps: readonly MorseStep[]): number {
  return steps.reduce((sum, step) => sum + step.units, 0);
}

/**
 * One unit, in milliseconds. 240 ms (5 words a minute) keeps the light far
 * from photosensitive rates: the fastest pattern, dots back to back, is one
 * flash per 2 units = about 2 flashes a second, well under the 3 per second
 * WCAG 2.3.1 allows. Tested.
 */
export const MORSE_UNIT_MS = 240;

/** The fastest the light can flash, in flashes per second. */
export function maxFlashRate(unitMs: number): number {
  return 1000 / (2 * unitMs);
}
