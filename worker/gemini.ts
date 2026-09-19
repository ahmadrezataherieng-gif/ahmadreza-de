import { MAX_ANSWER_LENGTH } from '../src/lib/assistant-limits.ts';
import { REFUSAL_MARKER } from './prompt.ts';

/** The model is not a secret; the key is. Overridable with the GEMINI_MODEL variable (TODO.md, Phase 8B). */
export const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
export const TIMEOUT_MS = 8000;
/** Tokens, not characters: the character cap below is the hard one. */
export const MAX_OUTPUT_TOKENS = 400;

export type GeminiResult =
  | { kind: 'answer'; text: string }
  | { kind: 'refused'; text?: string }
  | { kind: 'unavailable' }
  | { kind: 'timeout' };

/** Cuts an answer to the cap, at a sentence end when there is one in the second half. */
export function limitAnswer(text: string, max = MAX_ANSWER_LENGTH): string {
  const clean = text.trim();
  if (Array.from(clean).length <= max) return clean;
  const cut = Array.from(clean).slice(0, max).join('');
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '), cut.lastIndexOf('؟ '));
  if (end > max / 2) return cut.slice(0, end + 1);
  return `${cut.replace(/\s+\S*$/, '')}…`;
}

/** Turns the model's text into a result: the refusal marker, an empty reply, or an answer. */
export function interpretAnswer(raw: string): GeminiResult {
  const text = raw.trim();
  if (text === '') return { kind: 'unavailable' };
  if (text.toUpperCase().startsWith(REFUSAL_MARKER)) {
    const rest = limitAnswer(text.slice(REFUSAL_MARKER.length));
    return rest === '' ? { kind: 'refused' } : { kind: 'refused', text: rest };
  }
  return { kind: 'answer', text: limitAnswer(text) };
}

interface GeminiBody {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

export interface AskOptions {
  apiKey: string;
  model?: string;
  system: string;
  question: string;
  fetchImpl: typeof fetch;
  timeoutMs?: number;
}

/**
 * One question, one answer. The key travels in a header, never in the URL, so
 * it cannot end up in a log line. Nothing here logs: not the question, not the
 * answer.
 */
export async function askGemini(options: AskOptions): Promise<GeminiResult> {
  const model = options.model || DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS);

  try {
    const response = await options.fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': options.apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.system }] },
        contents: [{ role: 'user', parts: [{ text: options.question }] }],
        generationConfig: {
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.3,
          // Short factual answers gain nothing from thinking, and thinking tokens count against the cap.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (!response.ok) return { kind: 'unavailable' };

    const body = (await response.json()) as GeminiBody;
    // A prompt the model's own filters blocked is a refusal, not an outage.
    if (body.promptFeedback?.blockReason) return { kind: 'refused' };
    const candidate = body.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') return { kind: 'refused' };
    return interpretAnswer((candidate?.content?.parts ?? []).map((part) => part.text ?? '').join(''));
  } catch (error) {
    return error instanceof Error && error.name === 'AbortError' ? { kind: 'timeout' } : { kind: 'unavailable' };
  } finally {
    clearTimeout(timer);
  }
}
