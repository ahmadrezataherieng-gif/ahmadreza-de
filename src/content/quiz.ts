import type { EraId } from '@/content/eras';

/**
 * The Computer-Quiz's question bank, as structure only (Phase 9B, DECISIONS.md
 * 55).
 *
 * Every question goes back to one era's one truth (CLAUDE.md, `eras.ts`). This
 * file holds which era a question belongs to, which options it has and which
 * one is right; every word a visitor reads - the question, each option, the
 * explanation - lives in `messages/apps/quiz/<locale>.json` under the same ids.
 *
 * Deliberately not part of the Assistant's index: `src/lib/search/` imports
 * named content modules one by one, and neither it nor the Assistant's copy
 * loader ever imports this file or the quiz copy. `scripts/test/quiz.test.mjs`
 * checks that stays true.
 */

export const quizOptionIds = ['a', 'b', 'c', 'd'] as const;

export type QuizOptionId = (typeof quizOptionIds)[number];

export interface QuizQuestion {
  /** Stable id; the copy is `questions.<id>` in the quiz messages. */
  id: string;
  era: EraId;
  /** Three or four options; their order is shuffled for every round. */
  options: readonly QuizOptionId[];
  correct: QuizOptionId;
}

const FOUR = ['a', 'b', 'c', 'd'] as const;

// CONTENT-TODO CR-907
export const quizQuestions: readonly QuizQuestion[] = [
  // 1946 - text is numbers
  { id: 'byte-bits', era: 'eniac', options: FOUR, correct: 'b' },
  { id: 'ascii-a', era: 'eniac', options: FOUR, correct: 'c' },
  { id: 'three-bits', era: 'eniac', options: FOUR, correct: 'a' },
  { id: 'binary-five', era: 'eniac', options: FOUR, correct: 'd' },

  // 1956 - scheduling, and why operating systems exist
  { id: 'shortest-first', era: 'batch', options: FOUR, correct: 'a' },
  { id: 'first-os', era: 'batch', options: FOUR, correct: 'c' },
  { id: 'batch-meaning', era: 'batch', options: FOUR, correct: 'b' },
  { id: 'scheduler', era: 'batch', options: FOUR, correct: 'd' },

  // 1971 - the filesystem tree and paths
  { id: 'root', era: 'unix', options: FOUR, correct: 'a' },
  { id: 'dot-dot', era: 'unix', options: FOUR, correct: 'c' },
  { id: 'absolute-path', era: 'unix', options: FOUR, correct: 'b' },
  { id: 'pwd', era: 'unix', options: FOUR, correct: 'd' },

  // 1981 - memory is finite
  { id: 'conventional-memory', era: 'dos', options: FOUR, correct: 'c' },
  { id: 'kibibyte', era: 'dos', options: ['a', 'b', 'c'], correct: 'a' },
  { id: 'ram-power', era: 'dos', options: ['a', 'b', 'c'], correct: 'b' },
  { id: 'free-memory', era: 'dos', options: FOUR, correct: 'd' },

  // 1984 - pointing is easier than remembering
  { id: 'wimp', era: 'macintosh', options: FOUR, correct: 'a' },
  { id: 'macintosh-1984', era: 'macintosh', options: FOUR, correct: 'b' },
  { id: 'point-and-choose', era: 'macintosh', options: ['a', 'b', 'c'], correct: 'c' },
  { id: 'copy-shortcut', era: 'macintosh', options: FOUR, correct: 'b' },

  // 1995 - a network needs addresses
  { id: 'ip-address', era: 'win95', options: FOUR, correct: 'd' },
  { id: 'ipv4-bits', era: 'win95', options: FOUR, correct: 'c' },
  { id: 'gateway', era: 'win95', options: FOUR, correct: 'a' },
  { id: 'same-network', era: 'win95', options: FOUR, correct: 'b' },
  { id: 'prefix-24', era: 'win95', options: FOUR, correct: 'd' },

  // Today - programs run isolated, in many places at once; ports and firewalls
  { id: 'https-port', era: 'cloud', options: FOUR, correct: 'b' },
  { id: 'ssh-port', era: 'cloud', options: FOUR, correct: 'a' },
  { id: 'port-purpose', era: 'cloud', options: FOUR, correct: 'c' },
  { id: 'first-match', era: 'cloud', options: ['a', 'b', 'c'], correct: 'a' },
  { id: 'container', era: 'cloud', options: FOUR, correct: 'd' },
];
