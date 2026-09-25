/** The crossing into the Convergence, and into any era with nothing between. */
export const BOUNDARY_LENGTH = 1.4;

/**
 * Where, in a crossing's 0..1, the technologies between the two eras play. The
 * old machine has handed over before it and the new one arrives after it; the
 * background changes hands in the middle, behind the cards (globals.css, BR-10).
 */
export const TECH_FROM = 0.24;
export const TECH_TO = 0.74;

/**
 * Scroll distance of a crossing in viewport heights: the base 1.2 plus
 * 0.3 for every technology it shows, so each card gets about a third of a
 * screen of scrolling however many there are. A crossing with no cards keeps
 * the original length.
 */
export function crossingLength(cards: number): number {
  return cards === 0 ? BOUNDARY_LENGTH : 1.2 + 0.3 * cards;
}
