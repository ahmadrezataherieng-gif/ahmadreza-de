/**
 * The Computer-Quiz's rules, pure (Phase 9B, DECISIONS.md 55): which ten
 * questions a round asks, in which order the options stand, and what a round
 * scored. Only `import type`, so `npm test` runs it in plain node. Randomness
 * comes in as a function, so the tests can seed it.
 */

import type { EraId } from '@/content/eras';
import type { QuizOptionId, QuizQuestion } from '@/content/quiz';

export const ROUND_SIZE = 10;

/** A number in [0, 1), like `Math.random`. */
export type Random = () => number;

export interface RoundQuestion {
  id: string;
  era: EraId;
  /** The question's options, in this round's order. */
  options: readonly QuizOptionId[];
  correct: QuizOptionId;
}

/** Fisher-Yates on a copy. */
export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const held = copy[index] as T;
    copy[index] = copy[other] as T;
    copy[other] = held;
  }
  return copy;
}

/**
 * Ten questions, spread across the eras: every era once before any era twice,
 * so a round of ten asks all seven eras and three of them a second time. The
 * order is shuffled again at the end, so the eras do not come in blocks.
 */
export function pickRound(bank: readonly QuizQuestion[], random: Random = Math.random, size: number = ROUND_SIZE): RoundQuestion[] {
  const byEra = new Map<EraId, QuizQuestion[]>();
  for (const question of bank) byEra.set(question.era, [...(byEra.get(question.era) ?? []), question]);
  const queues = shuffle([...byEra.values()], random).map((questions) => shuffle(questions, random));

  const picked: QuizQuestion[] = [];
  while (picked.length < size && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      if (picked.length >= size) break;
      const next = queue.shift();
      if (next) picked.push(next);
    }
  }

  return shuffle(picked, random).map((question) => ({
    id: question.id,
    era: question.era,
    options: shuffle(question.options, random),
    correct: question.correct,
  }));
}

export interface RoundScore {
  score: number;
  total: number;
  /** Eras with at least one wrong or missing answer, each once, in the order they were asked. */
  missedEras: EraId[];
}

/** `answers[i]` is the option chosen for `round[i]`, or null if none was. */
export function scoreRound(round: readonly RoundQuestion[], answers: readonly (QuizOptionId | null)[]): RoundScore {
  let score = 0;
  const missedEras: EraId[] = [];
  round.forEach((question, index) => {
    if (answers[index] === question.correct) score += 1;
    else if (!missedEras.includes(question.era)) missedEras.push(question.era);
  });
  return { score, total: round.length, missedEras };
}

/** Which friendly line closes a round. It speaks about the round, never about the visitor. */
export type ResultBand = 'all' | 'most' | 'half' | 'start';

export function resultBand(score: number, total: number): ResultBand {
  if (total > 0 && score === total) return 'all';
  if (score >= total * 0.7) return 'most';
  if (score >= total * 0.4) return 'half';
  return 'start';
}

/** The better of a stored best and a new score. */
export function bestOf(best: number | null, score: number): number {
  return best === null ? score : Math.max(best, score);
}
