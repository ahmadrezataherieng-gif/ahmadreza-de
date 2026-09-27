/**
 * The Troubleshoot mode's logic (Phase 9D-2 follow-up, queue 2026-09-28 B item
 * 2): "the office's internet is down." Reuses the subnet arithmetic from
 * `net.ts` to decide, for any of the three prepared scenarios, what
 * `ipconfig`/`ip addr`, `ping`, `traceroute` and `nslookup` would honestly
 * show - a host is reachable when it shares the client's subnet, or when it
 * does not but the configured gateway is itself on that subnet and answering.
 *
 * Pure and dependency-free (its one runtime import is `net.ts`, the app's own
 * other pure module), so `npm test` runs it in plain node. Every string a
 * visitor reads is in `messages/apps/network/<locale>.json` under
 * `troubleshoot`.
 */
// Runtime (not just type) imports, so relative with an explicit extension - as
// `filesystem/paths.ts` does for `terminal/shell.ts` - since `node --test` runs
// this file directly and does not know the `@/` alias.
import type { TroubleshootConfig, TroubleshootScenario, TroubleshootScenarioId } from '../../../content/network.ts';
import { TROUBLESHOOT_REMOTE_IP, TROUBLESHOOT_REMOTE_NAME, troubleshootCauseIds, troubleshootScenarioIds, troubleshootScenarios } from '../../../content/network.ts';
import { inRange, parseIPv4, prefixFromMask } from './net.ts';

/** A number in [0, 1), like `Math.random`. */
export type Random = () => number;

/** One of the three scenarios, chosen at random (dependency-injected so tests are deterministic). */
export function pickScenario(random: Random = Math.random): TroubleshootScenario {
  const index = Math.floor(random() * troubleshootScenarioIds.length);
  const id = troubleshootScenarioIds[Math.min(index, troubleshootScenarioIds.length - 1)] as TroubleshootScenarioId;
  return troubleshootScenarios[id];
}

/** The configured gateway is a real, usable next hop: not 0.0.0.0, and on the client's own subnet. */
function gatewayOnLink(config: TroubleshootConfig): boolean {
  if (config.gateway === '0.0.0.0') return false;
  const address = parseIPv4(config.ip);
  const gateway = parseIPv4(config.gateway);
  const prefix = prefixFromMask(parseIPv4(config.mask) ?? -1);
  if (address === null || gateway === null || prefix === null) return false;
  return inRange(gateway, address, prefix);
}

/** Whether `destination` shares the client's own subnet - reachable without any gateway at all. */
function onClientLink(config: TroubleshootConfig, destination: number): boolean {
  const address = parseIPv4(config.ip);
  const prefix = prefixFromMask(parseIPv4(config.mask) ?? -1);
  if (address === null || prefix === null) return false;
  return inRange(destination, address, prefix);
}

/**
 * Would a ping to this address get a reply? A host on `downHosts` never
 * answers regardless of routing (it is simply off); otherwise a host on the
 * client's own subnet always answers, and a host beyond it answers only if
 * the gateway is itself reachable.
 */
export function hostReachable(scenario: TroubleshootScenario, targetIp: string): boolean {
  if (scenario.downHosts.includes(targetIp)) return false;
  const destination = parseIPv4(targetIp);
  if (destination === null) return false;
  if (onClientLink(scenario.config, destination)) return true;
  return gatewayOnLink(scenario.config);
}

export type ResolveOutcome = { ok: true; ip: string } | { ok: false };

/** `nslookup`: only resolves the one remote name here, and only if the configured DNS server answers. */
export function resolveName(scenario: TroubleshootScenario, name: string): ResolveOutcome {
  if (normaliseHost(name) !== TROUBLESHOOT_REMOTE_NAME) return { ok: false };
  if (scenario.config.dns === '0.0.0.0') return { ok: false };
  if (!hostReachable(scenario, scenario.config.dns)) return { ok: false };
  return { ok: true, ip: TROUBLESHOOT_REMOTE_IP };
}

function normaliseHost(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '');
}

/** What a target in `ping`/`traceroute` turned out to be, for the console line and the note under it. */
export type PingOutcome =
  | { kind: 'gateway'; ok: boolean }
  | { kind: 'dns'; ok: boolean }
  | { kind: 'remote'; via: 'ip' | 'name'; ok: boolean }
  | { kind: 'noGateway' }
  | { kind: 'unknownHost'; host: string };

/** `ping <target>`: the target may be the gateway, the DNS server, the remote server's address, or its name. */
export function pingCommand(scenario: TroubleshootScenario, input: string): PingOutcome {
  const text = input.trim();
  const host = normaliseHost(text);
  if (host === 'gateway' || text === scenario.config.gateway) {
    if (scenario.config.gateway === '0.0.0.0') return { kind: 'noGateway' };
    return { kind: 'gateway', ok: gatewayOnLink(scenario.config) };
  }
  if (host === 'dns' || text === scenario.config.dns) {
    if (scenario.config.dns === '0.0.0.0') return { kind: 'unknownHost', host: text };
    return { kind: 'dns', ok: hostReachable(scenario, scenario.config.dns) };
  }
  if (text === TROUBLESHOOT_REMOTE_IP) return { kind: 'remote', via: 'ip', ok: hostReachable(scenario, TROUBLESHOOT_REMOTE_IP) };
  if (host === TROUBLESHOOT_REMOTE_NAME) {
    const resolved = resolveName(scenario, text);
    if (!resolved.ok) return { kind: 'unknownHost', host: text };
    return { kind: 'remote', via: 'name', ok: hostReachable(scenario, resolved.ip) };
  }
  return { kind: 'unknownHost', host: text };
}

/** `nslookup <name>`, as its own command: only the remote name resolves, and only when the DNS server answers. */
export function nslookupCommand(scenario: TroubleshootScenario, input: string): ResolveOutcome & { name: string } {
  const name = normaliseHost(input);
  return { ...resolveName(scenario, input), name };
}

export interface TraceHop {
  host: 'gateway' | 'dns' | 'isp' | 'remote';
  ok: boolean;
}

/**
 * `traceroute <target>`: a target on the client's own subnet (the gateway or
 * the DNS server) is one direct hop; a remote target goes through the
 * gateway, one synthetic ISP hop, then the destination - stopping at the
 * first hop that does not answer.
 */
export function tracerouteCommand(scenario: TroubleshootScenario, input: string): TraceHop[] {
  const ping = pingCommand(scenario, input);
  if (ping.kind === 'noGateway' || ping.kind === 'unknownHost') return [];
  if (ping.kind === 'gateway' || ping.kind === 'dns') return [{ host: ping.kind, ok: ping.ok }];
  const gatewayOk = gatewayOnLink(scenario.config);
  if (!gatewayOk) return [{ host: 'gateway', ok: false }];
  return [
    { host: 'gateway', ok: true },
    { host: 'isp', ok: true },
    { host: 'remote', ok: ping.ok },
  ];
}

/** `ipconfig` (Windows) and `ip addr` (Linux) print the same four facts, in their own house styles. */
export function formatIpconfig(config: TroubleshootConfig, style: 'windows' | 'linux'): string[] {
  if (style === 'linux') {
    const prefix = prefixFromMask(parseIPv4(config.mask) ?? 0) ?? 0;
    return [
      '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>',
      `    inet ${config.ip}/${prefix} brd ${config.ip === '169.254.23.87' ? '169.254.255.255' : '198.51.100.255'} scope global eth0`,
      `    ${config.gateway === '0.0.0.0' ? '# no default route' : `default via ${config.gateway}`}`,
    ];
  }
  return [
    'Ethernet adapter Ethernet:',
    '',
    `   IPv4 Address. . . . . . . . . . : ${config.ip}`,
    `   Subnet Mask . . . . . . . . . . : ${config.mask}`,
    `   Default Gateway . . . . . . . . : ${config.gateway === '0.0.0.0' ? '' : config.gateway}`,
    `   DNS Servers . . . . . . . . . . : ${config.dns === '0.0.0.0' ? '' : config.dns}`,
  ];
}

/* --- guessing the cause and the fix -------------------------------------------- */

/** Same ids for cause and fix: naming the right cause names the right fix. */
export type GuessId = TroubleshootScenarioId;
export const guessIds: readonly GuessId[] = troubleshootCauseIds;

export interface GuessState {
  cause: GuessId | null;
  fix: GuessId | null;
  wrongCauseTries: number;
  wrongFixTries: number;
  solved: boolean;
}

export function initialGuess(): GuessState {
  return { cause: null, fix: null, wrongCauseTries: 0, wrongFixTries: 0, solved: false };
}

export function guessCause(scenario: TroubleshootScenario, state: GuessState, causeId: GuessId): GuessState {
  if (state.cause !== null) return state;
  const correct = causeId === scenario.id;
  return { ...state, cause: correct ? causeId : null, wrongCauseTries: correct ? state.wrongCauseTries : state.wrongCauseTries + 1 };
}

export function guessFix(scenario: TroubleshootScenario, state: GuessState, fixId: GuessId): GuessState {
  if (state.cause === null || state.fix !== null) return state;
  const correct = fixId === scenario.id;
  return { ...state, fix: correct ? fixId : null, wrongFixTries: correct ? state.wrongFixTries : state.wrongFixTries + 1, solved: correct };
}
