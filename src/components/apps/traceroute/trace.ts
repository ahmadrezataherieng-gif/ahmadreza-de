/**
 * The Traceroute app's logic: which prepared route a target gets, what the
 * run adds up to, and the text a real traceroute would print for it.
 *
 * Pure and import-free at runtime (the route data is passed in), so
 * `node --test` runs it as it is (`scripts/test/apps.test.mjs`).
 */
import type { Hop, Route, RouteId } from '@/content/routes';

export type TraceTarget =
  | {
      ok: true;
      /** The route to play, its destination renamed to what was asked for. */
      route: Route;
      /** What the visitor asked for, cleaned up. */
      host: string;
      /** False for a prepared target; true when a free input borrowed a prepared route. */
      mapped: boolean;
    }
  | { ok: false; host: string };

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const HOSTNAME = /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

/** European country codes and the generic EU domain: the Frankfurt route. */
const NEAR = new Set(['de', 'at', 'ch', 'eu', 'nl', 'be', 'lu', 'fr', 'dk', 'pl', 'cz', 'it', 'es', 'uk', 'se', 'no', 'fi', 'ie', 'pt']);
/** Asia and Oceania: the Tokyo route. Everything else crosses the Atlantic. */
const PACIFIC = new Set(['jp', 'cn', 'kr', 'tw', 'hk', 'sg', 'au', 'nz', 'in', 'id', 'th', 'vn', 'my', 'ph']);

/** Accept what people paste - a URL, a port, a trailing dot - and keep the host. */
export function cleanHost(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

function isPrivate(octets: number[]): boolean {
  const [a = 0, b = 0] = octets;
  return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

/** A stable small number for a string, so the same input always gets the same address. */
function hash(value: string): number {
  let h = 0;
  for (const char of value) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

function byId(routes: readonly Route[], id: RouteId): Route {
  const route = routes.find((candidate) => candidate.id === id);
  if (!route) throw new Error(`Missing route: ${id}`);
  return route;
}

/** The prepared route, with its last hop renamed to the requested host. */
function renamed(route: Route, host: string, ip: string): Route {
  const hops = route.hops.map((hop, index) =>
    index === route.hops.length - 1 ? { ...hop, host: ip === host ? null : host, ip } : hop,
  );
  return { ...route, hops };
}

export function resolveTarget(routes: readonly Route[], input: string): TraceTarget {
  const host = cleanHost(input);
  const prepared = routes.find((route) => route.target === host || `www.${route.target}` === host);
  if (prepared) return { ok: true, route: prepared, host: prepared.target, mapped: false };

  const ip = IPV4.exec(host);
  if (ip) {
    const octets = ip.slice(1).map(Number);
    if (octets.some((octet) => octet > 255)) return { ok: false, host };
    const route = byId(routes, isPrivate(octets) ? 'router' : 'newyork');
    return { ok: true, route: renamed(route, host, host), host, mapped: true };
  }

  if (!HOSTNAME.test(host)) return { ok: false, host };

  const labels = host.split('.');
  const tld = labels.length > 1 ? (labels[labels.length - 1] ?? '') : '';
  // A single label ("printer", "nas") is a name on the local network.
  const id: RouteId = tld === '' ? 'router' : NEAR.has(tld) ? 'ahmadreza' : PACIFIC.has(tld) ? 'tokyo' : 'newyork';
  const route = byId(routes, id);
  const address = id === 'router' ? `192.168.1.${20 + (hash(host) % 200)}` : `203.0.113.${20 + (hash(host) % 200)}`;
  return { ok: true, route: renamed(route, host, address), host, mapped: true };
}

/** The middle of the three probes: what a person reads off a traceroute line. */
export function median(hop: Hop): number | null {
  if (!hop.rtt) return null;
  const sorted = [...hop.rtt].sort((a, b) => a - b);
  return sorted[1] ?? null;
}

export interface TraceSummary {
  hops: number;
  /** Round trip to the destination, in ms. */
  total: number;
  /** The largest step up between two answering hops: where the time is spent. */
  jump: { from: number; to: number; delta: number; role: Hop['role'] } | null;
}

export function summarise(route: Route): TraceSummary {
  let previous: { index: number; ms: number } | null = null;
  let jump: TraceSummary['jump'] = null;
  route.hops.forEach((hop, index) => {
    const ms = median(hop);
    if (ms === null) return;
    if (previous) {
      const delta = ms - previous.ms;
      if (!jump || delta > jump.delta) jump = { from: previous.index + 1, to: index + 1, delta, role: hop.role };
    }
    previous = { index, ms };
  });
  const last = route.hops[route.hops.length - 1];
  return { hops: route.hops.length, total: (last && median(last)) ?? 0, jump };
}

/** How long the run waits before a hop appears: longer for a farther hop, longest for a silent one. */
export function hopDelay(hop: Hop): number {
  const ms = median(hop);
  if (ms === null) return 1400;
  return Math.round(Math.min(1100, Math.max(320, 320 + ms * 3)));
}

/** One hop as Linux traceroute prints it. */
export function formatHop(hop: Hop, index: number): string {
  const number = String(index + 1).padStart(2);
  if (!hop.rtt || !hop.ip) return `${number}  * * *`;
  const times = hop.rtt.map((ms) => `${ms.toFixed(3)} ms`).join('  ');
  return `${number}  ${hop.host ?? hop.ip} (${hop.ip})  ${times}`;
}

export function formatHeader(route: Route, host: string): string {
  const last = route.hops[route.hops.length - 1];
  return `traceroute to ${host} (${last?.ip ?? host}), 30 hops max, 60 byte packets`;
}

export function formatUnknownHost(host: string): string {
  return `traceroute: ${host || '""'}: Name or service not known`;
}
