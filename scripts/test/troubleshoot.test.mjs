// The Troubleshoot mode's logic (queue 2026-09-28 B item 2): three scenarios,
// one shared set of simulated commands, honest reachability.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  formatIpconfig,
  guessCause,
  guessFix,
  guessIds,
  hostReachable,
  initialGuess,
  nslookupCommand,
  pickScenario,
  pingCommand,
  resolveName,
  tracerouteCommand,
} from '../../src/components/apps/network/troubleshoot.ts';
import { TROUBLESHOOT_OFFICE_DNS, TROUBLESHOOT_OFFICE_GATEWAY, TROUBLESHOOT_REMOTE_IP, TROUBLESHOOT_REMOTE_NAME, troubleshootScenarioIds, troubleshootScenarios } from '../../src/content/network.ts';

const copy = (locale) => JSON.parse(readFileSync(new URL(`../../src/messages/apps/network/${locale}.json`, import.meta.url), 'utf8'));

test('every scenario, address and name is documentation space or the one deliberate exception (APIPA)', () => {
  const documentation = /^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/;
  for (const scenario of Object.values(troubleshootScenarios)) {
    const { ip, gateway, dns } = scenario.config;
    for (const address of [ip, gateway, dns]) {
      if (address === '0.0.0.0') continue;
      const apipa = address.startsWith('169.254.');
      assert.ok(documentation.test(address) || apipa, `${scenario.id}: ${address} is documentation space or APIPA`);
    }
  }
  assert.match(TROUBLESHOOT_REMOTE_IP, documentation);
  assert.match(TROUBLESHOOT_REMOTE_NAME, /\.example$/);
});

test('pickScenario: honours the injected random, in range for edge values', () => {
  assert.equal(pickScenario(() => 0).id, troubleshootScenarioIds[0]);
  assert.equal(pickScenario(() => 0.999).id, troubleshootScenarioIds[troubleshootScenarioIds.length - 1]);
  const middle = pickScenario(() => 0.5);
  assert.ok(troubleshootScenarioIds.includes(middle.id));
});

test('dhcpFailure: an APIPA address with no gateway and no DNS - nothing at all answers', () => {
  const scenario = troubleshootScenarios.dhcpFailure;
  assert.equal(pingCommand(scenario, 'gateway').kind, 'noGateway');
  assert.equal(pingCommand(scenario, TROUBLESHOOT_OFFICE_DNS).kind, 'unknownHost');
  assert.deepEqual(pingCommand(scenario, TROUBLESHOOT_REMOTE_IP), { kind: 'remote', via: 'ip', ok: false });
  assert.equal(resolveName(scenario, TROUBLESHOOT_REMOTE_NAME).ok, false);
  assert.equal(nslookupCommand(scenario, TROUBLESHOOT_REMOTE_NAME).ok, false);
  assert.deepEqual(tracerouteCommand(scenario, TROUBLESHOOT_REMOTE_IP), [{ host: 'gateway', ok: false }]);
  assert.deepEqual(tracerouteCommand(scenario, TROUBLESHOOT_OFFICE_DNS), [], 'an address the simulation cannot even name (dns was never reached) traces nowhere');
});

test('wrongGateway: the office DNS server answers (same subnet), but the misconfigured gateway and anything beyond it do not', () => {
  const scenario = troubleshootScenarios.wrongGateway;
  assert.equal(scenario.config.gateway, '192.0.2.1', 'a documentation address outside the office subnet - the fault');
  assert.deepEqual(pingCommand(scenario, 'gateway'), { kind: 'gateway', ok: false });
  assert.deepEqual(pingCommand(scenario, scenario.config.dns), { kind: 'dns', ok: true });
  assert.equal(hostReachable(scenario, scenario.config.dns), true);
  // The name still resolves (the DNS server answers) - but reaching the resolved address needs the broken gateway.
  const resolved = resolveName(scenario, TROUBLESHOOT_REMOTE_NAME);
  assert.deepEqual(resolved, { ok: true, ip: TROUBLESHOOT_REMOTE_IP });
  assert.deepEqual(pingCommand(scenario, TROUBLESHOOT_REMOTE_IP), { kind: 'remote', via: 'ip', ok: false });
  assert.deepEqual(pingCommand(scenario, TROUBLESHOOT_REMOTE_NAME), { kind: 'remote', via: 'name', ok: false });
  const hops = tracerouteCommand(scenario, TROUBLESHOOT_REMOTE_IP);
  assert.equal(hops.length, 1);
  assert.deepEqual(hops[0], { host: 'gateway', ok: false });
});

test('dnsDown: routing is fine (ping by address works), but the DNS server host itself is off - ping by name fails', () => {
  const scenario = troubleshootScenarios.dnsDown;
  assert.equal(scenario.config.gateway, TROUBLESHOOT_OFFICE_GATEWAY);
  assert.deepEqual(pingCommand(scenario, 'gateway'), { kind: 'gateway', ok: true });
  assert.deepEqual(pingCommand(scenario, scenario.config.dns), { kind: 'dns', ok: false }, 'the DNS server itself does not answer a ping either - it is off, not just refusing DNS');
  assert.deepEqual(pingCommand(scenario, TROUBLESHOOT_REMOTE_IP), { kind: 'remote', via: 'ip', ok: true }, 'ping by IP works');
  assert.equal(resolveName(scenario, TROUBLESHOOT_REMOTE_NAME).ok, false, 'ping by name fails');
  assert.equal(pingCommand(scenario, TROUBLESHOOT_REMOTE_NAME).kind, 'unknownHost');
  const hops = tracerouteCommand(scenario, TROUBLESHOOT_REMOTE_IP);
  assert.deepEqual(hops, [
    { host: 'gateway', ok: true },
    { host: 'isp', ok: true },
    { host: 'remote', ok: true },
  ]);
});

test('the three scenarios are pairwise distinguishable by ping alone (gateway, dns, remote-by-ip)', () => {
  const signature = (id) => {
    const scenario = troubleshootScenarios[id];
    const gateway = pingCommand(scenario, 'gateway');
    const dns = pingCommand(scenario, scenario.config.dns === '0.0.0.0' ? TROUBLESHOOT_OFFICE_DNS : scenario.config.dns);
    const remote = pingCommand(scenario, TROUBLESHOOT_REMOTE_IP);
    return JSON.stringify([gateway, dns, remote]);
  };
  const signatures = troubleshootScenarioIds.map(signature);
  assert.equal(new Set(signatures).size, signatures.length, 'no two scenarios look identical over ping alone');
});

test('formatIpconfig: Windows and Linux styles both name every configured value, and an unset gateway/DNS is empty rather than "0.0.0.0"', () => {
  const scenario = troubleshootScenarios.dhcpFailure;
  const windows = formatIpconfig(scenario.config, 'windows').join('\n');
  assert.match(windows, /169\.254\.23\.87/);
  assert.doesNotMatch(windows, /0\.0\.0\.0/);
  const linux = formatIpconfig(scenario.config, 'linux').join('\n');
  assert.match(linux, /169\.254\.23\.87\/16/);
  assert.match(linux, /no default route/);
  const configured = troubleshootScenarios.dnsDown.config;
  assert.match(formatIpconfig(configured, 'windows').join('\n'), new RegExp(configured.gateway));
});

test('guessing: cause locks in only once correct, fix only unlocks after the cause, wrong tries count without exposing the answer', () => {
  const scenario = troubleshootScenarios.wrongGateway;
  let state = initialGuess();
  assert.equal(guessFix(scenario, state, 'wrongGateway'), state, 'no fix before a cause');
  state = guessCause(scenario, state, 'dhcpFailure');
  assert.equal(state.cause, null);
  assert.equal(state.wrongCauseTries, 1);
  state = guessCause(scenario, state, 'wrongGateway');
  assert.equal(state.cause, 'wrongGateway');
  assert.equal(state.solved, false);
  state = guessFix(scenario, state, 'dnsDown');
  assert.equal(state.fix, null);
  assert.equal(state.wrongFixTries, 1);
  assert.equal(state.solved, false);
  state = guessFix(scenario, state, 'wrongGateway');
  assert.equal(state.fix, 'wrongGateway');
  assert.equal(state.solved, true);
  // Solved: guessing again changes nothing.
  const after = guessCause(scenario, state, 'dnsDown');
  assert.deepEqual(after, state);
});

test('guessIds: exactly the three scenario ids, same set both places', () => {
  assert.deepEqual([...guessIds].sort(), [...troubleshootScenarioIds].sort());
});

test('copy: every scenario id has a cause and a fix in all three languages, "Sie" not "du" in German', () => {
  for (const locale of ['de', 'en', 'fa']) {
    const messages = copy(locale).troubleshoot;
    assert.ok(messages, `${locale}: network.troubleshoot exists`);
    for (const id of troubleshootScenarioIds) {
      assert.ok(messages.causes?.[id], `${locale}: causes.${id}`);
      assert.ok(messages.fixes?.[id], `${locale}: fixes.${id}`);
    }
  }
  const de = JSON.stringify(copy('de').troubleshoot);
  assert.doesNotMatch(de, /\bdu\b|\bdein/i, 'German troubleshoot copy uses Sie, not du');
});
