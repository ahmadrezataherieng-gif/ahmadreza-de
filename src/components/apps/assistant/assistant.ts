/**
 * The Assistant's logic, with no React and only `import type`, so `npm test`
 * runs it in plain node: what an answer from the Worker means, and the local
 * demo that stands in while no key is connected.
 */

import type { AssistantReply } from '@/lib/assistant-limits';

/** Where the app is talking to: still finding out, the live Worker, or the local demo. */
export type AssistantMode = 'checking' | 'live' | 'demo';
/** Why the demo is on: the Worker has no key yet, or could not be reached at all. */
export type DemoReason = 'notConfigured' | 'offline';

/** What the visitor sees the assistant doing. Every phase has its own copy. */
export const phases = ['idle', 'thinking', 'answered', 'refused', 'rateLimited', 'offline', 'notConfigured'] as const;
export type Phase = (typeof phases)[number];

export type Outcome =
  | { kind: 'answered'; text: string }
  | { kind: 'refused'; text?: string }
  | { kind: 'rateLimited'; retryAfter: number }
  | { kind: 'notConfigured' }
  | { kind: 'ready' }
  | { kind: 'offline' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reads a Worker response. Anything that is not a well-formed reply - a 404
 * page from a server with no Worker behind it, an HTML error, an unknown status
 * - is `offline`: the app never trusts the shape of what it did not ask for.
 */
export function interpretReply(httpStatus: number, data: unknown): Outcome {
  if (!isRecord(data) || typeof data.status !== 'string') return { kind: 'offline' };
  const reply = data as Partial<AssistantReply> & { status: string };

  switch (reply.status) {
    case 'ready':
      return httpStatus === 200 ? { kind: 'ready' } : { kind: 'offline' };
    case 'answered':
      return httpStatus === 200 && typeof data.text === 'string' && data.text.trim() !== '' ? { kind: 'answered', text: data.text } : { kind: 'offline' };
    case 'refused':
      return httpStatus === 200 ? (typeof data.text === 'string' && data.text.trim() !== '' ? { kind: 'refused', text: data.text } : { kind: 'refused' }) : { kind: 'offline' };
    case 'rateLimited': {
      const wait = typeof data.retryAfter === 'number' && Number.isFinite(data.retryAfter) ? Math.ceil(data.retryAfter) : 60;
      return { kind: 'rateLimited', retryAfter: Math.min(3600, Math.max(1, wait)) };
    }
    case 'notConfigured':
      return { kind: 'notConfigured' };
    default:
      return { kind: 'offline' };
  }
}

/* --- the demo ------------------------------------------------------------------ */

/** The topics the demo has a prepared answer for. Their words are in the app's copy. */
export const demoTopicIds = ['who', 'skills', 'path', 'site', 'contact'] as const;
export type DemoTopicId = (typeof demoTopicIds)[number];

export interface DemoTopic {
  id: DemoTopicId;
  /** Lower-case fragments; a question that contains one is about this topic. */
  keywords: readonly string[];
}

/** Lower-case, without diacritics or punctuation, so "Fähigkeiten?" finds "fahigkeiten". */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ًͯ-ٟ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The prepared topic a question is closest to, or null. The topic with the most
 * keyword hits wins; a tie goes to the earlier one. No hit is an honest null:
 * the demo never guesses.
 */
export function matchDemoTopic(question: string, topics: readonly DemoTopic[]): DemoTopicId | null {
  const text = normalise(question);
  let best: { id: DemoTopicId; hits: number } | null = null;
  for (const topic of topics) {
    const hits = topic.keywords.filter((keyword) => text.includes(normalise(keyword))).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { id: topic.id, hits };
  }
  return best?.id ?? null;
}

/** How many characters to reveal per tick so that any answer types out in about 1.5 s. */
export function typingStep(length: number, ticks = 50): number {
  return Math.max(1, Math.ceil(length / ticks));
}
