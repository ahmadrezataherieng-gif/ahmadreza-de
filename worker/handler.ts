import { ASSISTANT_PATH, MAX_BODY_LENGTH, type AssistantReply } from '../src/lib/assistant-limits.ts';
import { askGemini } from './gemini.ts';
import { buildSystemPrompt } from './prompt.ts';
import type { RateLimiter } from './rate-limit.ts';
import { isOwnOrigin, validateBody } from './validate.ts';

/** What the Worker is given by Cloudflare. Only the key is secret. */
export interface Env {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

export interface Deps {
  limiter: RateLimiter;
  /** The site's material, built once. */
  context: string;
  now: () => number;
  fetchImpl: typeof fetch;
  timeoutMs?: number;
}

const STATUS: Record<AssistantReply['status'], number> = {
  ready: 200,
  answered: 200,
  refused: 200,
  notConfigured: 503,
  rateLimited: 429,
  invalid: 400,
  unavailable: 502,
};
const INVALID_STATUS = { method: 405, origin: 403, body: 400, empty: 400, locale: 400, tooLong: 413 } as const;

function reply(body: AssistantReply, request: Request, extra: Record<string, string> = {}, status?: number): Response {
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    // An answer is for one visitor and one moment.
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    vary: 'Origin',
    ...extra,
  };
  // CORS: the site's own origin and no other. Same-origin needs no header at all;
  // this only makes the site's own preflight explicit.
  const origin = request.headers.get('origin');
  if (isOwnOrigin(origin, request.url) && origin) headers['access-control-allow-origin'] = origin;
  const code = status ?? (body.status === 'invalid' ? INVALID_STATUS[body.reason] : STATUS[body.status]);
  return new Response(JSON.stringify(body), { status: code, headers });
}

/**
 * `/api/assistant`. Order matters: the cheap refusals come first, and the
 * question is only read once the request is known to be the site's own.
 * Nothing is logged - the question is the visitor's, not ours.
 */
export async function handleAssistant(request: Request, env: Env, deps: Deps): Promise<Response> {
  const configured = Boolean(env.GEMINI_API_KEY);

  if (request.method === 'GET') return reply(configured ? { status: 'ready' } : { status: 'notConfigured' }, request, {}, 200);

  if (request.method === 'OPTIONS') {
    if (!isOwnOrigin(request.headers.get('origin'), request.url)) return reply({ status: 'invalid', reason: 'origin' }, request);
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': request.headers.get('origin') ?? '',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '600',
        vary: 'Origin',
      },
    });
  }

  if (request.method !== 'POST') return reply({ status: 'invalid', reason: 'method' }, request, { allow: 'GET, POST, OPTIONS' });
  if (!isOwnOrigin(request.headers.get('origin'), request.url)) return reply({ status: 'invalid', reason: 'origin' }, request);
  if (!configured) return reply({ status: 'notConfigured' }, request);

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const decision = deps.limiter.check(ip, deps.now());
  if (!decision.allowed) {
    return reply({ status: 'rateLimited', retryAfter: decision.retryAfter }, request, { 'retry-after': String(decision.retryAfter) });
  }

  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return reply({ status: 'invalid', reason: 'body' }, request);
  }
  // A declared size is checked before a byte is read; the text is checked again below.
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_LENGTH * 4) return reply({ status: 'invalid', reason: 'tooLong' }, request);

  const checked = validateBody(await request.text());
  if (!checked.ok) return reply({ status: 'invalid', reason: checked.reason }, request);

  const result = await askGemini({
    apiKey: env.GEMINI_API_KEY ?? '',
    model: env.GEMINI_MODEL,
    system: buildSystemPrompt(deps.context, checked.locale),
    question: checked.question,
    fetchImpl: deps.fetchImpl,
    timeoutMs: deps.timeoutMs,
  });

  switch (result.kind) {
    case 'answer':
      return reply({ status: 'answered', text: result.text }, request);
    case 'refused':
      return reply(result.text ? { status: 'refused', text: result.text } : { status: 'refused' }, request);
    case 'timeout':
      return reply({ status: 'unavailable' }, request, {}, 504);
    case 'unavailable':
      return reply({ status: 'unavailable' }, request);
  }
}

export function isAssistantRequest(request: Request): boolean {
  return new URL(request.url).pathname.replace(/\/+$/, '') === ASSISTANT_PATH;
}
