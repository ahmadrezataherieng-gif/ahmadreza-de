/**
 * The scoring itself (Phase 8B, DECISIONS.md 53): plain token overlap, no
 * external search library (CLAUDE.md: no new dependency without asking
 * first). A question matches a passage by how many of its meaningful words
 * appear in that passage's text or keywords; a passage below the coverage
 * floor is not returned at all - an honest "I can't answer that" beats a
 * guess.
 */

import { tokenise } from './normalise.ts';
import type { Passage, SearchHit } from './types.ts';

/** Full credit for a whole-word hit, half for a shared prefix (so "Netzwerk" still finds "Netzwerke"). */
const WHOLE_WORD_SCORE = 2;
const PREFIX_SCORE = 1;
/** A passage needs at least this share of the question's words accounted for. Tuned against the test questions below. */
const MIN_COVERAGE = 0.4;
const DEFAULT_LIMIT = 2;

function sharesPrefix(a: string, b: string): boolean {
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length >= 3 && longer.startsWith(shorter);
}

function scorePassage(queryTokens: readonly string[], passage: Passage): number {
  const haystack = tokenise([passage.text, ...passage.keywords].join(' '));
  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += WHOLE_WORD_SCORE;
    else if (haystack.some((word) => sharesPrefix(token, word))) score += PREFIX_SCORE;
  }
  return score;
}

/**
 * The best passages for a question, best first, honestly empty when nothing
 * clears the coverage floor. `limit` caps how many passages one answer shows.
 */
export function search(question: string, passages: readonly Passage[], limit = DEFAULT_LIMIT): SearchHit[] {
  const queryTokens = tokenise(question);
  if (queryTokens.length === 0) return [];

  const ceiling = queryTokens.length * WHOLE_WORD_SCORE;
  const hits: SearchHit[] = [];
  for (const passage of passages) {
    const score = scorePassage(queryTokens, passage);
    if (score / ceiling >= MIN_COVERAGE) hits.push({ passage, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}
