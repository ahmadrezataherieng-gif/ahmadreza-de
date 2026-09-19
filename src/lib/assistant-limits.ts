/**
 * The assistant's contract, shared by the desktop app and the Worker behind
 * `/api/assistant`. Pure constants and types: nothing here may import anything,
 * because the plain-node tests and the Worker bundle both load this file as is.
 */

export const ASSISTANT_PATH = '/api/assistant';

/** A visitor's question, in characters. The app stops typing here; the Worker rejects above it. */
export const MAX_QUESTION_LENGTH = 400;

/** The largest request body the Worker reads at all, in characters. */
export const MAX_BODY_LENGTH = 2000;

/** The answer, in characters. Longer ones are cut at a sentence end. */
export const MAX_ANSWER_LENGTH = 900;

export const ASSISTANT_LOCALES = ['de', 'en', 'fa'] as const;
export type AssistantLocale = (typeof ASSISTANT_LOCALES)[number];

/**
 * What the Worker answers with. `status` is what the app shows; the HTTP status
 * says the same to anything else (200, 400, 403, 405, 413, 429, 502, 503, 504).
 */
export type AssistantReply =
  | { status: 'ready' }
  | { status: 'answered'; text: string }
  | { status: 'refused'; text?: string }
  | { status: 'notConfigured' }
  | { status: 'rateLimited'; retryAfter: number }
  | { status: 'invalid'; reason: 'method' | 'origin' | 'body' | 'empty' | 'tooLong' | 'locale' }
  | { status: 'unavailable' };
