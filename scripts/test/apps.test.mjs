// The Phase 7 apps' logic and data, run as they are: node strips the types.
//   node --test scripts/test/
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { careerStations, languages, skillAreas } from '../../src/content/about.ts';
import { projects } from '../../src/content/projects.ts';
import { routes } from '../../src/content/routes.ts';
import { tickets, ticketStatuses } from '../../src/content/tickets.ts';
import { cleanHost, formatHop, median, resolveTarget, summarise } from '../../src/components/apps/traceroute/trace.ts';
import { PORTFOLIO_COMMANDS, SHELL_COMMANDS } from '../../src/components/apps/terminal/shell.ts';

const LOCALES = ['de', 'en', 'fa'];
const APPS = ['about', 'contact', 'timeline', 'terminal', 'tickets', 'traceroute', 'assistant', 'assistant-journey', 'quiz', 'stats', 'binary', 'snake', 'paint', 'network', 'time-machine'];
const copy = (app, locale) => JSON.parse(readFileSync(new URL(`../../src/messages/apps/${app}/${locale}.json`, import.meta.url), 'utf8'));
const get = (object, path) => path.split('.').reduce((node, key) => node?.[key], object);

/** Every key path, with array lengths, so the three locales can be compared. */
function shape(value, prefix = '') {
  // Keyword lists are per-language matching aids: they may differ in length.
  if (Array.isArray(value)) return [prefix.endsWith('keywords') ? prefix : `${prefix}[${value.length}]`];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, child]) => shape(child, prefix ? `${prefix}.${key}` : key));
  return [prefix];
}

/* --- copy -------------------------------------------------------------------- */

test('every app has the same keys in de, en and fa', () => {
  for (const app of APPS) {
    const reference = shape(copy(app, 'de')).sort();
    for (const locale of ['en', 'fa']) assert.deepEqual(shape(copy(app, locale)).sort(), reference, `${app}/${locale}`);
  }
});

test('German copy says "Sie", never "du"; Persian never "تو"', () => {
  for (const app of APPS) {
    const de = JSON.stringify(copy(app, 'de'));
    assert.doesNotMatch(de, /\b(du|dich|dir|dein|deine|deinen)\b/i, app);
    const fa = JSON.stringify(copy(app, 'fa'));
    assert.doesNotMatch(fa, /(^|[\s«"])تو([\s»".،]|$)/, app);
  }
});

test('About: every content id has its copy', () => {
  for (const locale of LOCALES) {
    const about = copy('about', locale);
    for (const station of careerStations) assert.ok(get(about, `path.stations.${station.id}.title`), `${locale} ${station.id}`);
    for (const area of skillAreas) {
      assert.ok(get(about, `skills.areas.${area.id}.title`), `${locale} ${area.id}`);
      for (const skill of area.skills) assert.ok(get(about, `skills.areas.${area.id}.skills.${skill}`), `${locale} ${skill}`);
    }
    for (const language of languages) assert.ok(get(about, `languages.names.${language.id}`), `${locale} ${language.id}`);
  }
});

test('About: no fact is guessed', () => {
  // Dates Ahmadreza has not supplied stay null and render as placeholders.
  for (const station of careerStations) {
    for (const month of [station.start, station.end]) assert.ok(month === null || /^\d{4}-\d{2}$/.test(month));
  }
  for (const language of languages) assert.equal(language.level, null);
});

test('Terminal: every command in help is described, projects have copy', () => {
  for (const locale of LOCALES) {
    const terminal = copy('terminal', locale);
    for (const command of [...PORTFOLIO_COMMANDS, ...SHELL_COMMANDS.filter((name) => name !== 'help' && name !== 'sudo')]) {
      assert.ok(get(terminal, `help.commands.${command}`), `${locale} ${command}`);
    }
    for (const project of projects) assert.ok(get(terminal, `projects.items.${project.id}.text`), `${locale} ${project.id}`);
  }
});

/* --- tickets ----------------------------------------------------------------- */

test('Tickets: 6 to 10, several statuses, every step explained in every language', () => {
  assert.ok(tickets.length >= 6 && tickets.length <= 10, `${tickets.length} tickets`);
  assert.ok(new Set(tickets.map((ticket) => ticket.status)).size >= 2);
  for (const ticket of tickets) assert.ok(ticketStatuses.includes(ticket.status));
  assert.equal(new Set(tickets.map((ticket) => ticket.number)).size, tickets.length, 'numbers are unique');
  for (const locale of LOCALES) {
    const all = copy('tickets', locale).tickets;
    for (const ticket of tickets) {
      const text = all[ticket.id];
      assert.ok(text, `${locale} ${ticket.id}`);
      for (const key of ['title', 'reporter', 'symptom', 'solution', 'lesson']) assert.ok(text[key], `${locale} ${ticket.id}.${key}`);
      assert.equal(text.steps.length, ticket.steps.length, `${locale} ${ticket.id} steps`);
    }
  }
});

test('Tickets: the organisation is fictional and nothing points at a real employer', () => {
  const everything = [JSON.stringify(tickets), ...LOCALES.map((locale) => JSON.stringify(copy('tickets', locale)))].join('\n');
  assert.doesNotMatch(everything, /Trier|Stadtverwaltung|IT-HAUS|شهرداری/i);
  // Names under the reserved .example domain; addresses private or public DNS.
  for (const host of everything.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\.(?:[a-z]{2,})\b/gi) ?? []) {
    if (/^\d/.test(host) || /\.(?:xlsx|pdf|txt)$/i.test(host)) continue;
    assert.match(host, /\.example$|^dns\.google$/, host);
  }
  for (const ip of everything.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) ?? []) {
    assert.match(ip, /^(10\.|169\.254\.|255\.|8\.8\.8\.8$)/, ip);
  }
});

/* --- traceroute ------------------------------------------------------------- */

test('Traceroute: prepared targets resolve to themselves', () => {
  for (const route of routes) {
    const target = resolveTarget(routes, route.target);
    assert.equal(target.ok, true);
    assert.equal(target.mapped, false);
    assert.equal(target.route.id, route.id);
  }
  assert.equal(resolveTarget(routes, 'https://www.ahmadreza.de/amonel/').route.id, 'ahmadreza');
  assert.equal(cleanHost('  HTTPS://Example.ORG:443/path?q=1 '), 'example.org');
});

test('Traceroute: free input borrows a prepared route, deterministically and visibly', () => {
  const cases = [
    ['192.168.1.20', 'router'],
    ['10.0.0.1', 'router'],
    ['nas', 'router'],
    ['heise.de', 'ahmadreza'],
    ['example.fr', 'ahmadreza'],
    ['example.jp', 'tokyo'],
    ['example.com.au', 'tokyo'],
    ['example.org', 'newyork'],
    ['1.1.1.1', 'newyork'],
  ];
  for (const [input, id] of cases) {
    const target = resolveTarget(routes, input);
    assert.equal(target.ok, true, input);
    assert.equal(target.mapped, true, input);
    assert.equal(target.route.id, id, input);
    const last = target.route.hops.at(-1);
    assert.equal(last.role, 'destination');
    assert.equal(last.host ?? last.ip, input, 'the destination is what was asked for');
    assert.deepEqual(resolveTarget(routes, input), target, 'same input, same route');
  }
});

test('Traceroute: invalid targets fail', () => {
  for (const input of ['foo_bar', '300.1.1.1', '-bad.de', 'a..b', '']) assert.equal(resolveTarget(routes, input).ok, false, input);
});

test('Traceroute: every time respects the speed of light in fibre, and times only grow', () => {
  for (const route of routes) {
    let previous = 0;
    route.hops.forEach((hop, index) => {
      if (!hop.rtt) {
        assert.equal(hop.role, 'silent');
        return;
      }
      // About 200 000 km/s in glass: 1 ms round trip per 100 km.
      assert.ok(Math.min(...hop.rtt) >= hop.km / 100, `${route.id} hop ${index + 1} faster than light`);
      const ms = median(hop);
      assert.ok(ms >= previous - 0.5, `${route.id} hop ${index + 1} gets faster by more than jitter`);
      previous = Math.max(previous, ms);
    });
    assert.equal(route.hops.at(-1).role, 'destination');
  }
});

test('Traceroute: every address is reserved for examples', () => {
  for (const route of routes) {
    for (const hop of route.hops) {
      if (hop.ip) assert.match(hop.ip, /^(192\.168\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/, hop.ip);
      if (hop.host && hop.role !== 'destination') assert.match(hop.host, /\.(example|arpa)$/, hop.host);
    }
  }
});

test('Traceroute: the summary finds where the time goes', () => {
  const byId = (id) => routes.find((route) => route.id === id);
  assert.equal(summarise(byId('router')).jump, null);
  assert.equal(summarise(byId('ahmadreza')).jump.role, 'ispAccess');
  assert.equal(summarise(byId('newyork')).jump.role, 'subsea');
  const tokyo = summarise(byId('tokyo'));
  assert.equal(tokyo.jump.role, 'subsea');
  assert.ok(tokyo.total > 200);
  assert.equal(formatHop({ role: 'silent', host: null, ip: null, rtt: null, km: 0 }, 4), ' 5  * * *');
  assert.equal(formatHop(byId('router').hops[0], 0), ' 1  router.home.arpa (192.168.1.1)  0.610 ms  0.500 ms  0.490 ms');
});

test('the Assistant is never called an AI, in any language (DECISIONS.md 53)', () => {
  for (const locale of LOCALES) {
    const site = JSON.parse(readFileSync(new URL(`../../src/messages/${locale}.json`, import.meta.url), 'utf8'));
    const claims = [JSON.stringify(site.os.apps.assistant), site.eras.cloud.visual.promptLabel];
    for (const text of claims) assert.doesNotMatch(text, /\bKI\b|\bAI\b|هوش مصنوعی/, `${locale}: ${text}`);
  }
});
