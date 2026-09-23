/**
 * What the local search (Phase 8B, DECISIONS.md 53) indexes and returns.
 * A passage is always a real sentence from the site's own content - never
 * synthesised - carrying the id it came from, so an answer can be labelled
 * with its source and never claims a sentence the site does not say.
 */

export type PassageSource =
  | { kind: 'about' }
  | { kind: 'now' }
  | { kind: 'station'; id: string }
  | { kind: 'skillArea'; id: string }
  | { kind: 'language' }
  | { kind: 'project'; id: string }
  | { kind: 'era'; id: string; year: string }
  | { kind: 'ticket'; id: string; number: string }
  | { kind: 'contact' };

export interface Passage {
  /** Stable within one locale; used only for tests and React keys, never shown. */
  id: string;
  source: PassageSource;
  /** The visible text. Verbatim from the site's own copy, never generated. */
  text: string;
  /** Extra words that help matching without ever appearing in an answer (titles, a ticket's symptom). */
  keywords: readonly string[];
}

export interface SearchHit {
  passage: Passage;
  score: number;
}
