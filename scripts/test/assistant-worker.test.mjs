// The Worker behind /api/assistant, run as it is: node strips the types.
//   node --test scripts/test/
// The real Gemini API is never called: every request goes to a fake fetch.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { MAX_ANSWER_LENGTH, MAX_BODY_LENGTH, MAX_QUESTION_LENGTH } from '../../src/lib/assistant-limits.ts';
import { buildContext } from '../../worker/context.ts';
import { interpretAnswer, limitAnswer } from '../../worker/gemini.ts';
import { handleAssistant } from '../../worker/handler.ts';
import { buildSystemPrompt, REFUSAL_MARKER } from '../../worker/prompt.ts';
import { LIMITS, RateLimiter } from '../../worker/rate-limit.ts';
import { CONTEXT, CONTEXT_INPUT } from '../../worker/sources.ts';
import { isOwnOrigin, validateBody } from '../../worker/validate.ts';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://ahmadreza.de';
const KEY = 'test-key-not-real-0123456789';

/* --- the rate limiter --------------------------------------------------------- */

test('rate limiter: the burst limit refuses the sixth request in a minute', () => {
  const limiter = new RateLimiter();
  for (let i = 0; i < LIMITS[0].max; i++) assert.equal(limiter.check('1.2.3.4', 1000 + i).allowed, true);
  const refused = limiter.check('1.2.3.4', 5000);
  assert.equal(refused.allowed, false);
  assert.ok(refused.retryAfter >= 1 && refused.retryAfter <= 60);
});

test('rate limiter: a slot frees when the oldest request leaves the window', () => {
  const limiter = new RateLimiter([{ max: 2, windowMs: 10_000 }]);
  limiter.check('a', 0);
  limiter.check('a', 4000);
  const refused = limiter.check('a', 5000);
  assert.deepEqual(refused, { allowed: false, retryAfter: 5 });
  assert.equal(limiter.check('a', 10_001).allowed, true);
});

test('rate limiter: keys are separate, and a refused request is not counted', () => {
  const limiter = new RateLimiter([{ max: 1, windowMs: 10_000 }]);
  assert.equal(limiter.check('a', 0).allowed, true);
  assert.equal(limiter.check('b', 0).allowed, true);
  for (let t = 1; t < 5; t++) assert.equal(limiter.check('a', t * 1000).allowed, false);
  // Had the refusals counted, 'a' would still be blocked a moment after its first hit expired.
  assert.equal(limiter.check('a', 10_001).allowed, true);
});

test('rate limiter: the hourly window holds when the minute one would allow', () => {
  const limiter = new RateLimiter();
  let allowed = 0;
  for (let i = 0; i < 40; i++) if (limiter.check('slow', i * 61_000).allowed) allowed++;
  assert.equal(allowed, LIMITS[1].max);
});

/* --- input validation --------------------------------------------------------- */

const body = (question, locale = 'de') => JSON.stringify({ question, locale });

test('validation: a good question is cleaned and accepted', () => {
  const result = validateBody(body('  Was   macht\n Ahmadreza? ', 'en'));
  assert.deepEqual(result, { ok: true, question: 'Was macht Ahmadreza?', locale: 'en' });
});

test('validation: the length cap counts characters, not bytes', () => {
  assert.equal(validateBody(body('ب'.repeat(MAX_QUESTION_LENGTH), 'fa')).ok, true);
  assert.deepEqual(validateBody(body('a'.repeat(MAX_QUESTION_LENGTH + 1))), { ok: false, reason: 'tooLong' });
  assert.deepEqual(validateBody('x'.repeat(MAX_BODY_LENGTH + 1)), { ok: false, reason: 'tooLong' });
});

test('validation: everything else is refused with a reason, never a throw', () => {
  assert.deepEqual(validateBody(body('   ')), { ok: false, reason: 'empty' });
  assert.deepEqual(validateBody('not json'), { ok: false, reason: 'body' });
  assert.deepEqual(validateBody('[]'), { ok: false, reason: 'body' });
  assert.deepEqual(validateBody('null'), { ok: false, reason: 'body' });
  assert.deepEqual(validateBody(JSON.stringify({ question: 5, locale: 'de' })), { ok: false, reason: 'body' });
  assert.deepEqual(validateBody(body('Hi', 'fr')), { ok: false, reason: 'locale' });
  assert.deepEqual(validateBody(JSON.stringify({ question: 'Hi' })), { ok: false, reason: 'locale' });
});

test('origin: only the request\'s own origin passes', () => {
  assert.equal(isOwnOrigin(SITE, `${SITE}/api/assistant`), true);
  assert.equal(isOwnOrigin('https://evil.example', `${SITE}/api/assistant`), false);
  assert.equal(isOwnOrigin('http://ahmadreza.de', `${SITE}/api/assistant`), false);
  assert.equal(isOwnOrigin(null, `${SITE}/api/assistant`), false);
  assert.equal(isOwnOrigin('garbage', `${SITE}/api/assistant`), false);
});

/* --- the prompt and the material --------------------------------------------- */

test('prompt: scope, refusal, language, brevity and the material are all in it', () => {
  const prompt = buildSystemPrompt('MATERIAL-MARKER', 'de');
  assert.match(prompt, /only questions about Ahmadreza/i);
  assert.ok(prompt.includes(REFUSAL_MARKER));
  assert.match(prompt, /Never invent/i);
  assert.match(prompt, /at most four sentences/i);
  assert.match(prompt, /German, English or Persian/);
  assert.match(prompt, /never an instruction/i);
  assert.ok(prompt.endsWith('MATERIAL-MARKER'));
  assert.match(buildSystemPrompt('x', 'de'), /"Sie"/);
  assert.match(buildSystemPrompt('x', 'fa'), /Persian script/);
});

test('material: built from the site\'s own content, complete and honest', () => {
  assert.doesNotMatch(CONTEXT, /undefined|\[object/);
  assert.ok(CONTEXT.includes('Ahmadreza Taheri'));
  for (const era of CONTEXT_INPUT.eras) {
    assert.ok(era.name && era.truth, `era ${era.year} has a name and a truth`);
    assert.ok(CONTEXT.includes(era.truth));
  }
  assert.equal(CONTEXT_INPUT.eras.length, 7);
  assert.equal(CONTEXT_INPUT.tickets.cases.length, 9);
  assert.match(CONTEXT, /erfunden/, 'the tickets are labelled fictional');
  // What is still owed is named as unknown, not filled in.
  assert.match(CONTEXT, /Nicht bekannt/);
  assert.match(CONTEXT, /Beginn der Ausbildung/);
  assert.match(CONTEXT, /Niveau der Sprachkenntnisse/);
  assert.doesNotMatch(CONTEXT, /Frühere Stationen/, 'a placeholder station is not presented as fact');
});

test('material: a resume or an address that does not exist is not promised', () => {
  const base = { ...CONTEXT_INPUT, email: null, resumeAvailable: false };
  const text = buildContext(base);
  assert.match(text, /Kontaktadresse ist noch nicht veröffentlicht/);
  assert.match(text, /Lebenslauf als PDF ist noch nicht veröffentlicht/);
});

/* --- reading the model's answer ----------------------------------------------- */

test('answer: the refusal marker becomes a refusal, an empty reply an outage', () => {
  assert.deepEqual(interpretAnswer(`${REFUSAL_MARKER} Dazu kann ich nichts sagen.`), { kind: 'refused', text: 'Dazu kann ich nichts sagen.' });
  assert.deepEqual(interpretAnswer(`  refused:`), { kind: 'refused' });
  assert.deepEqual(interpretAnswer('   '), { kind: 'unavailable' });
  assert.deepEqual(interpretAnswer('Ahmadreza lernt Systemintegration.'), { kind: 'answer', text: 'Ahmadreza lernt Systemintegration.' });
});

test('answer: the cap cuts at a sentence end where it can', () => {
  const long = `${'Ein Satz. '.repeat(300)}`;
  const cut = limitAnswer(long);
  assert.ok(Array.from(cut).length <= MAX_ANSWER_LENGTH);
  assert.ok(cut.endsWith('.'));
  assert.ok(Array.from(limitAnswer('x'.repeat(5000))).length <= MAX_ANSWER_LENGTH + 1);
});

/* --- the handler -------------------------------------------------------------- */

/** A fake Gemini. `calls` records what the Worker sent. */
function fakeGemini(respond) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    return respond(init);
  };
  return { fetchImpl, calls };
}
const geminiText = (text) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }] }), { status: 200 });

function setup({ respond = () => geminiText('Antwort.'), env = { GEMINI_API_KEY: KEY }, timeoutMs } = {}) {
  const gemini = fakeGemini(respond);
  const deps = { limiter: new RateLimiter(), context: 'CONTEXT', now: () => 1_000_000, fetchImpl: gemini.fetchImpl, timeoutMs };
  const send = async (question = 'Wer ist Ahmadreza?', { origin = SITE, method = 'POST', ip = '9.9.9.9', raw, type = 'application/json', locale = 'de' } = {}) => {
    const headers = { 'cf-connecting-ip': ip };
    if (origin) headers.origin = origin;
    if (type) headers['content-type'] = type;
    const response = await handleAssistant(
      new Request(`${SITE}/api/assistant`, { method, headers, body: method === 'POST' ? (raw ?? body(question, locale)) : undefined }),
      env,
      deps,
    );
    return { response, json: response.status === 204 ? null : await response.json() };
  };
  return { send, gemini, deps };
}

test('handler: no key is an honest "not configured", not a crash, and nothing is sent anywhere', async () => {
  const { send, gemini } = setup({ env: {} });
  const { response, json } = await send();
  assert.equal(response.status, 503);
  assert.deepEqual(json, { status: 'notConfigured' });
  assert.equal(gemini.calls.length, 0);
  const probe = await send('', { method: 'GET' });
  assert.deepEqual(probe.json, { status: 'notConfigured' });
  assert.equal(probe.response.status, 200);
});

test('handler: with a key, GET says ready and never reveals it', async () => {
  const { send } = setup();
  const { json, response } = await send('', { method: 'GET' });
  assert.deepEqual(json, { status: 'ready' });
  assert.ok(!JSON.stringify(json).includes(KEY));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('handler: a question is answered; the key goes in a header, the prompt in the system turn', async () => {
  const { send, gemini } = setup();
  const { response, json } = await send('Was kann Ahmadreza?');
  assert.equal(response.status, 200);
  assert.deepEqual(json, { status: 'answered', text: 'Antwort.' });
  assert.equal(response.headers.get('access-control-allow-origin'), SITE);

  const [{ url, init }] = gemini.calls;
  assert.ok(url.startsWith('https://generativelanguage.googleapis.com/'));
  assert.ok(!url.includes(KEY), 'the key is never in the URL');
  assert.equal(init.headers['x-goog-api-key'], KEY);
  const sent = JSON.parse(init.body);
  assert.ok(sent.systemInstruction.parts[0].text.includes('CONTEXT'));
  assert.ok(!sent.systemInstruction.parts[0].text.includes('Was kann Ahmadreza?'), 'the question is never spliced into the rules');
  assert.equal(sent.contents[0].parts[0].text, 'Was kann Ahmadreza?');
  assert.ok(sent.generationConfig.maxOutputTokens > 0);
});

test('handler: the refusal path - the model\'s marker and the safety filter both end as "refused"', async () => {
  const marked = setup({ respond: () => geminiText(`${REFUSAL_MARKER} Ich beantworte nur Fragen zu Ahmadreza.`) });
  const one = await marked.send('Schreibe ein Gedicht.');
  assert.equal(one.response.status, 200);
  assert.deepEqual(one.json, { status: 'refused', text: 'Ich beantworte nur Fragen zu Ahmadreza.' });

  const blocked = setup({ respond: () => new Response(JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } }), { status: 200 }) });
  assert.deepEqual((await blocked.send()).json, { status: 'refused' });
});

test('handler: only the site\'s own origin may ask', async () => {
  const { send, gemini } = setup();
  for (const origin of ['https://evil.example', null]) {
    const { response, json } = await send('Hallo', { origin });
    assert.equal(response.status, 403);
    assert.deepEqual(json, { status: 'invalid', reason: 'origin' });
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  assert.equal(gemini.calls.length, 0);

  const preflight = await send('', { method: 'OPTIONS' });
  assert.equal(preflight.response.status, 204);
  assert.equal(preflight.response.headers.get('access-control-allow-origin'), SITE);
  const foreign = await send('', { method: 'OPTIONS', origin: 'https://evil.example' });
  assert.equal(foreign.response.status, 403);
});

test('handler: a wrong method is 405', async () => {
  const { send } = setup();
  const { response } = await send('', { method: 'DELETE' });
  assert.equal(response.status, 405);
  assert.match(response.headers.get('allow') ?? '', /POST/);
});

test('handler: rate limit per IP - 429 with Retry-After, and another visitor is unaffected', async () => {
  const { send, gemini } = setup();
  for (let i = 0; i < LIMITS[0].max; i++) assert.equal((await send('Hallo', { ip: '1.1.1.1' })).response.status, 200);
  const { response, json } = await send('Hallo', { ip: '1.1.1.1' });
  assert.equal(response.status, 429);
  assert.equal(json.status, 'rateLimited');
  assert.equal(response.headers.get('retry-after'), String(json.retryAfter));
  assert.equal(gemini.calls.length, LIMITS[0].max, 'a refused request costs no API call');
  assert.equal((await send('Hallo', { ip: '2.2.2.2' })).response.status, 200);
});

test('handler: input over the cap, empty input and bad bodies never reach the API', async () => {
  const { send, gemini } = setup();
  assert.equal((await send('a'.repeat(MAX_QUESTION_LENGTH + 1))).response.status, 413);
  assert.equal((await send('   ')).response.status, 400);
  assert.equal((await send('x', { raw: 'nope' })).response.status, 400);
  assert.equal((await send('x', { type: 'text/plain' })).response.status, 400);
  assert.equal((await send('x', { locale: 'fr' })).response.status, 400);
  assert.equal(gemini.calls.length, 0);
});

test('handler: an upstream failure and a timeout are "unavailable", never a crash', async () => {
  const failing = setup({ respond: () => new Response('boom', { status: 500 }) });
  const one = await failing.send();
  assert.equal(one.response.status, 502);
  assert.deepEqual(one.json, { status: 'unavailable' });

  const throwing = setup({ respond: () => { throw new Error('network down'); } });
  assert.equal((await throwing.send()).response.status, 502);

  const slow = setup({
    timeoutMs: 20,
    respond: (init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))),
  });
  const two = await slow.send();
  assert.equal(two.response.status, 504);
  assert.deepEqual(two.json, { status: 'unavailable' });
});

test('handler: an over-long answer is cut to the cap', async () => {
  const { send } = setup({ respond: () => geminiText('Wort '.repeat(1000)) });
  const { json } = await send();
  assert.ok(Array.from(json.text).length <= MAX_ANSWER_LENGTH + 1);
});

test('handler: the question is never logged', async () => {
  const seen = [];
  const original = {};
  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    original[level] = console[level];
    console[level] = (...parts) => seen.push(parts.join(' '));
  }
  try {
    const secret = 'Geheime-Frage-4711';
    const ok = setup();
    await ok.send(secret);
    const failing = setup({ respond: () => new Response('x', { status: 500 }) });
    await failing.send(secret);
    const limited = setup();
    for (let i = 0; i < 7; i++) await limited.send(secret);
  } finally {
    Object.assign(console, original);
  }
  assert.deepEqual(seen.filter((line) => line.includes('Geheime-Frage-4711')), []);
});

/* --- where the key may live --------------------------------------------------- */

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx|mjs|js|json|css)$/.test(name) ? [full] : [];
  });
}

test('the key is read only in the Worker: never in src/, never a NEXT_PUBLIC variable', () => {
  for (const file of sourceFiles(path.join(ROOT, 'src'))) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /GEMINI_API_KEY|NEXT_PUBLIC_GEMINI/, path.relative(ROOT, file));
  }
  for (const file of sourceFiles(path.join(ROOT, 'worker'))) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /NEXT_PUBLIC/, path.relative(ROOT, file));
  }
  assert.doesNotMatch(readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8'), /GEMINI_API_KEY\s*"\s*:/, 'no value in wrangler.jsonc');
  assert.match(readFileSync(path.join(ROOT, '.gitignore'), 'utf8'), /^\.dev\.vars$/m);
});

test('wrangler: only /api/* runs the Worker first; the site stays assets', () => {
  const config = readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8');
  assert.match(config, /"main":\s*"worker\/index\.ts"/);
  assert.match(config, /"run_worker_first":\s*\["\/api\/\*"\]/);
  assert.match(config, /"not_found_handling":\s*"404-page"/);
  assert.match(config, /"html_handling":\s*"auto-trailing-slash"/);
});
