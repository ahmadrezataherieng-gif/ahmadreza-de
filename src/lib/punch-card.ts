/**
 * IBM 80-column punch card encoding.
 *
 * The card has 12 rows. Reading top to bottom they are the two "zone" rows 12
 * and 11, then the digit rows 0 through 9. A character is one zone punch plus
 * one digit punch, which is the scheme an IBM 029 keypunch produced:
 *
 *   A-I  zone 12 + digits 1-9
 *   J-R  zone 11 + digits 1-9
 *   S-Z  zone 0  + digits 2-9
 *   0-9  the digit row alone
 *
 * This is the real encoding, not a decorative approximation, so the holes in
 * the 1946 visual genuinely spell what the caption says they do.
 */

/** Row labels from the top of the card downwards. */
export const CARD_ROWS = [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const CARD_COLUMNS = 80;

const ROW_ORDER = new Map<number, number>(
  CARD_ROWS.map((rowLabel, index) => [rowLabel, index]),
);

/** Position of a row label from the top of the card, 0-based. */
export function rowIndex(rowLabel: number): number {
  return ROW_ORDER.get(rowLabel) ?? 0;
}

export interface PunchedColumn {
  /** 1-based column number on the card. */
  column: number;
  character: string;
  /** Row labels punched in this column. Empty for a space. */
  rows: number[];
}

function punchesFor(character: string): number[] {
  const upper = character.toUpperCase();

  if (upper >= '0' && upper <= '9') {
    return [Number(upper)];
  }

  if (upper >= 'A' && upper <= 'I') {
    return [12, upper.charCodeAt(0) - 64];
  }

  if (upper >= 'J' && upper <= 'R') {
    return [11, upper.charCodeAt(0) - 73];
  }

  if (upper >= 'S' && upper <= 'Z') {
    return [0, upper.charCodeAt(0) - 81];
  }

  // Space, and anything this card does not represent, leaves the column blank.
  return [];
}

/** Encode a string into the columns of a punch card, one column per character. */
export function encodeCard(text: string): PunchedColumn[] {
  return Array.from(text.slice(0, CARD_COLUMNS)).map((character, index) => ({
    column: index + 1,
    character,
    rows: punchesFor(character),
  }));
}

/**
 * Read one column back. The inverse of `punchesFor`, strict enough to catch a
 * misprint: a combination the code does not define reads as '?'.
 */
export function decodeColumn(rows: readonly number[]): string {
  const punched = [...new Set(rows)];
  if (punched.length === 0) return ' ';
  if (punched.length === 1) {
    const [only] = punched;
    return only !== undefined && only >= 0 && only <= 9 ? String(only) : '?';
  }
  if (punched.length !== 2) return '?';

  const zone = punched.find((row) => row === 12 || row === 11 || row === 0);
  const digit = punched.find((row) => row !== zone);
  if (zone === undefined || digit === undefined || digit < 1 || digit > 9) return '?';

  if (zone === 12) return String.fromCharCode(64 + digit);
  if (zone === 11) return String.fromCharCode(73 + digit);
  // Zone 0 starts at digit 2: 0-1 is not a letter in this code.
  return digit >= 2 ? String.fromCharCode(81 + digit) : '?';
}
