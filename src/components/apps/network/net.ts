/**
 * The Network tools app's logic (Phase 9D-2, DECISIONS.md 63): IPv4 subnetting
 * for real, and ping and DNS as labelled simulations over prepared data.
 *
 * Pure and dependency-free - only `import type` - so `npm test` runs it in
 * plain node. Every string here is machine text (addresses, command output);
 * the words a visitor reads live in `messages/apps/network/`.
 */
import type { Route } from '@/content/routes';
import type { DnsRecord, DnsRecordType, DnsZone } from '@/content/network';

/* --- IPv4 --------------------------------------------------------------------- */

/** Parses a dotted quad into an unsigned 32-bit number, or null. */
export function parseIPv4(input: string): number | null {
  const parts = input.trim().split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    // No leading zeros: "010" means octal to some tools and decimal to others.
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value;
}

export function formatIPv4(value: number): string {
  return [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join('.');
}

/** The address as 32 bits in four dotted groups. */
export function toBinary(value: number): string {
  return formatIPv4(value)
    .split('.')
    .map((octet) => Number(octet).toString(2).padStart(8, '0'))
    .join('.');
}

export function maskFromPrefix(prefix: number): number {
  return prefix === 0 ? 0 : (2 ** 32 - 2 ** (32 - prefix)) >>> 0;
}

/** The prefix length of a contiguous mask, or null for one like 255.0.255.0. */
export function prefixFromMask(mask: number): number | null {
  for (let prefix = 0; prefix <= 32; prefix++) if (maskFromPrefix(prefix) === mask) return prefix;
  return null;
}

export type CidrError = 'empty' | 'invalidAddress' | 'invalidPrefix' | 'invalidMask';
export type CidrResult = { ok: true; address: number; prefix: number } | { ok: false; error: CidrError };

/**
 * Reads "192.168.1.10/24", "192.168.1.10 255.255.255.0" or
 * "192.168.1.10/255.255.255.0" - the three ways people write it. A bare
 * address is a single host, /32.
 */
export function parseCidr(input: string): CidrResult {
  const text = input.trim();
  if (text === '') return { ok: false, error: 'empty' };
  const [addressPart = '', maskPart, ...rest] = text.split(/\s*\/\s*|\s+/);
  if (rest.length > 0) return { ok: false, error: 'invalidAddress' };
  const address = parseIPv4(addressPart);
  if (address === null) return { ok: false, error: 'invalidAddress' };
  if (maskPart === undefined) return { ok: true, address, prefix: 32 };
  if (/^\d{1,2}$/.test(maskPart)) {
    const prefix = Number(maskPart);
    return prefix <= 32 ? { ok: true, address, prefix } : { ok: false, error: 'invalidPrefix' };
  }
  const mask = parseIPv4(maskPart);
  if (mask === null) return { ok: false, error: 'invalidPrefix' };
  const prefix = prefixFromMask(mask);
  return prefix === null ? { ok: false, error: 'invalidMask' } : { ok: true, address, prefix };
}

/** What kind of address this is. Labels: `network.kinds.<kind>`. */
export type AddressKind =
  | 'unspecified'
  | 'loopback'
  | 'private'
  | 'sharedCgnat'
  | 'linkLocal'
  | 'documentation'
  | 'multicast'
  | 'reserved'
  | 'broadcast'
  | 'public';

const RANGES: readonly (readonly [string, number, AddressKind])[] = [
  ['255.255.255.255', 32, 'broadcast'],
  ['0.0.0.0', 8, 'unspecified'],
  ['127.0.0.0', 8, 'loopback'],
  ['10.0.0.0', 8, 'private'],
  ['172.16.0.0', 12, 'private'],
  ['192.168.0.0', 16, 'private'],
  ['100.64.0.0', 10, 'sharedCgnat'],
  ['169.254.0.0', 16, 'linkLocal'],
  ['192.0.2.0', 24, 'documentation'],
  ['198.51.100.0', 24, 'documentation'],
  ['203.0.113.0', 24, 'documentation'],
  ['224.0.0.0', 4, 'multicast'],
  ['240.0.0.0', 4, 'reserved'],
];

export function inRange(address: number, network: number, prefix: number): boolean {
  const mask = maskFromPrefix(prefix);
  return ((address & mask) >>> 0) === ((network & mask) >>> 0);
}

export function addressKind(address: number): AddressKind {
  for (const [network, prefix, kind] of RANGES) {
    const base = parseIPv4(network);
    if (base !== null && inRange(address, base, prefix)) return kind;
  }
  return 'public';
}

export interface SubnetInfo {
  address: number;
  prefix: number;
  mask: number;
  wildcard: number;
  network: number;
  broadcast: number;
  firstHost: number;
  lastHost: number;
  /** Every address in the block. */
  total: number;
  /** Addresses a machine may use: total minus network and broadcast, except /31 (RFC 3021) and /32. */
  usable: number;
  kind: AddressKind;
  /** The typed address is the network or broadcast address itself, not a host. */
  role: 'host' | 'network' | 'broadcast';
}

export function subnetInfo(address: number, prefix: number): SubnetInfo {
  const mask = maskFromPrefix(prefix);
  const wildcard = (~mask >>> 0) >>> 0;
  const network = (address & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = 2 ** (32 - prefix);
  const pointToPoint = prefix >= 31;
  const firstHost = pointToPoint ? network : network + 1;
  const lastHost = pointToPoint ? broadcast : broadcast - 1;
  const usable = pointToPoint ? total : total - 2;
  const role = pointToPoint ? 'host' : address === network ? 'network' : address === broadcast ? 'broadcast' : 'host';
  return { address, prefix, mask, wildcard, network, broadcast, firstHost, lastHost, total, usable, kind: addressKind(address), role };
}

/** Splits a block into equal smaller ones: 192.168.1.0/24 into four /26. At most `limit` are listed. */
export function splitSubnet(network: number, prefix: number, newPrefix: number, limit = 16): { blocks: SubnetInfo[]; count: number } {
  if (newPrefix < prefix || newPrefix > 32) return { blocks: [], count: 0 };
  const count = 2 ** (newPrefix - prefix);
  const size = 2 ** (32 - newPrefix);
  const base = (network & maskFromPrefix(prefix)) >>> 0;
  const blocks = Array.from({ length: Math.min(count, limit) }, (_, index) => subnetInfo(base + index * size, newPrefix));
  return { blocks, count };
}

/**
 * The 1995 question: can this machine reach its gateway directly? The
 * gateway must sit in the machine's own subnet and be neither the network nor
 * the broadcast address - nor the machine itself.
 */
export type GatewayVerdict = 'ok' | 'otherSubnet' | 'isNetwork' | 'isBroadcast' | 'isSelf';

export function checkGateway(host: number, prefix: number, gateway: number): GatewayVerdict {
  const info = subnetInfo(host, prefix);
  if (gateway === host) return 'isSelf';
  if (!inRange(gateway, info.network, prefix)) return 'otherSubnet';
  if (prefix < 31 && gateway === info.network) return 'isNetwork';
  if (prefix < 31 && gateway === info.broadcast) return 'isBroadcast';
  return 'ok';
}

/* --- ping (simulated) --------------------------------------------------------- */

/** A small deterministic jitter per host and probe, so a replay prints the same. */
function jitter(seed: string, index: number): number {
  let hash = 2166136261;
  for (const char of `${seed}#${index}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return (hash % 1000) / 1000;
}

export interface PingReply {
  /** Round trip in milliseconds, or null for a probe that got no answer. */
  ms: number | null;
  ttl: number | null;
}

export type PingTarget =
  | { ok: true; host: string; ip: string; replies: PingReply[]; kind: 'route' | 'loopback' | 'silent' }
  | { ok: false; host: string };

/** The four probes a Windows 95 `ping` sends by default. */
export const PING_COUNT = 4;
/** Most servers start a reply at TTL 64; each router on the way takes one off. */
const SERVER_TTL = 64;

/**
 * Pings a target from the prepared routes (the Traceroute app's, so both tools
 * agree on every time), the loopback address, or a documentation address that
 * is not on any route - which, honestly, never answers.
 */
export function ping(routes: readonly Route[], input: string): PingTarget {
  const host = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (host === '') return { ok: false, host };
  if (host === 'localhost' || (parseIPv4(host) !== null && addressKind(parseIPv4(host) ?? 0) === 'loopback')) {
    const ip = host === 'localhost' ? '127.0.0.1' : host;
    return {
      ok: true,
      host,
      ip,
      kind: 'loopback',
      replies: Array.from({ length: PING_COUNT }, (_, index) => ({ ms: 0.03 + jitter(ip, index) * 0.04, ttl: 128 })),
    };
  }
  const route = routes.find((candidate) => {
    const destination = candidate.hops[candidate.hops.length - 1];
    return candidate.target === host || destination?.host === host || destination?.ip === host;
  });
  const destination = route?.hops[route.hops.length - 1];
  if (route && destination?.rtt && destination.ip) {
    const floor = Math.min(...destination.rtt);
    const spread = Math.max(...destination.rtt) - floor;
    return {
      ok: true,
      host: route.target,
      ip: destination.ip,
      kind: 'route',
      replies: Array.from({ length: PING_COUNT }, (_, index) => ({
        ms: floor + jitter(route.target, index) * Math.max(spread, 0.3),
        ttl: SERVER_TTL - (route.hops.length - 1),
      })),
    };
  }
  const address = parseIPv4(host);
  if (address !== null) {
    return { ok: true, host, ip: host, kind: 'silent', replies: Array.from({ length: PING_COUNT }, () => ({ ms: null, ttl: null })) };
  }
  return { ok: false, host };
}

/** Windows 95 prints whole milliseconds, and "<1ms" below one. */
export function formatPingTime(ms: number): string {
  return ms < 1 ? 'time<1ms' : `time=${Math.round(ms)}ms`;
}

export function formatPingLines(target: Extract<PingTarget, { ok: true }>): string[] {
  const header = target.host === target.ip ? `Pinging ${target.ip} with 32 bytes of data:` : `Pinging ${target.host} [${target.ip}] with 32 bytes of data:`;
  return [
    header,
    '',
    ...target.replies.map((reply) =>
      reply.ms === null ? 'Request timed out.' : `Reply from ${target.ip}: bytes=32 ${formatPingTime(reply.ms)} TTL=${reply.ttl}`,
    ),
  ];
}

export interface PingStats {
  sent: number;
  received: number;
  lossPercent: number;
  min: number | null;
  max: number | null;
  average: number | null;
}

export function pingStats(replies: readonly PingReply[]): PingStats {
  const times = replies.flatMap((reply) => (reply.ms === null ? [] : [reply.ms]));
  const sent = replies.length;
  const received = times.length;
  return {
    sent,
    received,
    lossPercent: sent === 0 ? 0 : Math.round(((sent - received) / sent) * 100),
    min: received ? Math.min(...times) : null,
    max: received ? Math.max(...times) : null,
    average: received ? times.reduce((sum, time) => sum + time, 0) / received : null,
  };
}

export function formatPingSummary(ip: string, stats: PingStats): string[] {
  const lines = [
    `Ping statistics for ${ip}:`,
    `    Packets: Sent = ${stats.sent}, Received = ${stats.received}, Lost = ${stats.sent - stats.received} (${stats.lossPercent}% loss),`,
  ];
  if (stats.min !== null && stats.max !== null && stats.average !== null) {
    lines.push(
      'Approximate round trip times in milli-seconds:',
      `    Minimum = ${Math.round(stats.min)}ms, Maximum = ${Math.round(stats.max)}ms, Average = ${Math.round(stats.average)}ms`,
    );
  }
  return lines;
}

/* --- DNS (simulated) ---------------------------------------------------------- */

/** One step of an iterative lookup: who was asked and what they said. */
export interface DnsStep {
  /** Who answers. Labels: `network.dns.servers.<server>`. */
  server: 'cache' | 'resolver' | 'root' | 'tld' | 'authoritative';
  /** The zone that server is responsible for, machine text ("." for the root). */
  zone: string;
  /** What it answered: a referral to the next server, the records, or "no such name". */
  answer: 'asks' | 'referral' | 'records' | 'nxdomain' | 'cached';
  ms: number;
}

export interface DnsLookup {
  name: string;
  type: DnsRecordType;
  steps: DnsStep[];
  /** The records, CNAMEs first, in the order a resolver follows them. */
  records: DnsRecord[];
  found: boolean;
}

export function normaliseName(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '');
}

/**
 * Resolves a name the way a recursive resolver does: root, then the TLD, then
 * the zone's own name server - unless the answer is already cached, which is
 * the whole point of the TTL. CNAMEs are followed within the prepared data.
 */
export function lookup(zones: readonly DnsZone[], input: string, type: DnsRecordType, cached: ReadonlySet<string>): DnsLookup {
  const name = normaliseName(input);
  const key = `${name}|${type}`;
  const zone = zones.find((candidate) => name === candidate.zone || name.endsWith(`.${candidate.zone}`));
  const records: DnsRecord[] = [];
  let current = name;
  for (let depth = 0; zone && depth < 5; depth++) {
    const cname = zone.records.find((record) => record.name === current && record.type === 'CNAME');
    if (cname && type !== 'CNAME') {
      records.push(cname);
      current = cname.value;
      continue;
    }
    records.push(...zone.records.filter((record) => record.name === current && record.type === type));
    break;
  }
  const found = records.length > 0 && (type === 'CNAME' || records.some((record) => record.type === type));

  if (cached.has(key)) return { name, type, records, found, steps: [{ server: 'cache', zone: name, answer: 'cached', ms: 0 }] };

  const tld = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : name;
  const steps: DnsStep[] = [
    { server: 'resolver', zone: name, answer: 'asks', ms: 7 + jitter(name, 0) * 2 },
    { server: 'root', zone: '.', answer: 'referral', ms: 12 + jitter(name, 1) * 8 },
  ];
  if (!zone) {
    steps.push({ server: 'tld', zone: tld, answer: 'nxdomain', ms: 14 + jitter(name, 2) * 10 });
    return { name, type, records: [], found: false, steps };
  }
  steps.push(
    { server: 'tld', zone: tld, answer: 'referral', ms: 14 + jitter(name, 2) * 10 },
    { server: 'authoritative', zone: zone.zone, answer: found ? 'records' : 'nxdomain', ms: zone.ms + jitter(name, 3) * 3 },
  );
  return { name, type, records, found, steps };
}

/**
 * A record as `dig` prints it: name, TTL, class, type, value. Padded with
 * spaces rather than tabs, so the columns line up in any font and width.
 */
export function formatRecord(record: DnsRecord): string {
  const value = record.type === 'MX' ? `${record.priority ?? 10} ${record.value}.` : record.type === 'TXT' ? `"${record.value}"` : record.type === 'CNAME' ? `${record.value}.` : record.value;
  return `${`${record.name}.`.padEnd(24)} ${String(record.ttl).padEnd(5)} IN  ${record.type.padEnd(6)}${value}`;
}

/* --- ports -------------------------------------------------------------------- */

export type PortRange = 'wellKnown' | 'registered' | 'dynamic';

export function portRange(port: number): PortRange {
  return port <= 1023 ? 'wellKnown' : port <= 49151 ? 'registered' : 'dynamic';
}

export type PortQuery = { kind: 'number'; port: number } | { kind: 'name'; text: string } | { kind: 'invalid' } | { kind: 'empty' };

export function readPortQuery(input: string): PortQuery {
  const text = input.trim().toLowerCase();
  if (text === '') return { kind: 'empty' };
  if (/^\d+$/.test(text)) {
    const port = Number(text);
    return port >= 0 && port <= 65535 ? { kind: 'number', port } : { kind: 'invalid' };
  }
  return /^[a-z0-9-]{1,20}$/.test(text) ? { kind: 'name', text } : { kind: 'invalid' };
}
