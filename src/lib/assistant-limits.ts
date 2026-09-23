/**
 * Constants shared by the Assistant app and its local search (Phase 8B,
 * DECISIONS.md 53). Pure and import-free, so `npm test` runs it in plain
 * node.
 */

export const ASSISTANT_LOCALES = ['de', 'en', 'fa'] as const;
export type AssistantLocale = (typeof ASSISTANT_LOCALES)[number];

/** A visitor's question, in characters. The field stops accepting input here. */
export const MAX_QUESTION_LENGTH = 400;
