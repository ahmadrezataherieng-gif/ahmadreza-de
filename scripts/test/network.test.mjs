// The Network tools app (APP-04): real subnet maths, honest simulations.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  addressKind,
  checkGateway,
  formatIPv4,
  formatPingLines,
  formatPingSummary,
  formatRecord,
  lookup,
  maskFromPrefix,
  parseCidr,
  parseIPv4,
  ping,
  pingStats,
  portRange,
  prefixFromMask,
  readPortQuery,
  splitSubnet,
  subnetInfo,
  toBinary,
} from '../../src/components/apps/network/net.ts';
import { dnsExamples, dnsZones, pingExamples, portStories, wellKnownPorts } from '../../src/content/network.ts';
import { routes } from '../../src/content/routes.ts';

const ip = (text) => parseIPv4(text);
const copy = (locale) => JSON.parse(readFileSync(new URL(`../../src/messages/apps/network/${locale}.json`, import.meta.url), 'utf8'));

test('IPv4: parsing is strict, formatting round-trips', () => {
  assert.equal(ip('192.168.1.10'), 3232235786);
  assert.equal(formatIPv4(3232235786), '192.168.1.10');
  for (const bad of ['256.1.1.1', '1.2.3', '1.2.3.4.5', '01.2.3.4', 'a.b.c.d', '', ' . . . ']) assert.equal(ip(bad), null, bad);
  assert.equal(toBinary(ip('192.168.1.10')), '11000000.10101000.00000001.00001010');
});

test('masks: prefix and dotted masks agree; a non-contiguous mask is refused', () => {
  assert.equal(formatIPv4(maskFromPrefix(24)), '255.255.255.0');
  assert.equal(formatIPv4(maskFromPrefix(0)), '0.0.0.0');
  assert.equal(formatIPv4(maskFromPrefix(32)), '255.255.255.255');
  assert.equal(prefixFromMask(ip('255.255.240.0')), 20);
  assert.equal(prefixFromMask(ip('255.0.255.0')), null);
  assert.deepEqual(parseCidr('172.16.5.4 255.255.240.0'), { ok: true, address: ip('172.16.5.4'), prefix: 20 });
  assert.deepEqual(parseCidr('10.0.0.1 / 8'), { ok: true, address: ip('10.0.0.1'), prefix: 8 });
  assert.deepEqual(parseCidr('10.0.0.1'), { ok: true, address: ip('10.0.0.1'), prefix: 32 });
  assert.deepEqual(parseCidr('10.0.0.1/33'), { ok: false, error: 'invalidPrefix' });
  assert.deepEqual(parseCidr('10.0.0.1 255.0.255.0'), { ok: false, error: 'invalidMask' });
  assert.deepEqual(parseCidr('10.0.0/8'), { ok: false, error: 'invalidAddress' });
  assert.deepEqual(parseCidr('   '), { ok: false, error: 'empty' });
});

test('subnets: network, broadcast, hosts - including /31 and /32', () => {
  const info = subnetInfo(ip('192.168.178.23'), 26);
  assert.equal(formatIPv4(info.network), '192.168.178.0');
  assert.equal(formatIPv4(info.broadcast), '192.168.178.63');
  assert.equal(formatIPv4(info.firstHost), '192.168.178.1');
  assert.equal(formatIPv4(info.lastHost), '192.168.178.62');
  assert.equal(info.usable, 62);
  assert.equal(info.total, 64);
  assert.equal(formatIPv4(info.wildcard), '0.0.0.63');
  assert.equal(subnetInfo(ip('10.0.0.0'), 8).role, 'network');
  assert.equal(subnetInfo(ip('10.255.255.255'), 8).role, 'broadcast');
  assert.equal(subnetInfo(ip('10.0.0.0'), 31).usable, 2);
  assert.equal(subnetInfo(ip('10.0.0.1'), 32).usable, 1);
  assert.equal(subnetInfo(ip('0.0.0.0'), 0).usable, 2 ** 32 - 2);
});

test('address kinds follow the RFCs', () => {
  const expected = {
    '10.1.2.3': 'private',
    '172.31.255.1': 'private',
    '172.32.0.1': 'public',
    '192.168.0.1': 'private',
    '127.0.0.1': 'loopback',
    '169.254.12.7': 'linkLocal',
    '100.64.0.1': 'sharedCgnat',
    '192.0.2.99': 'documentation',
    '198.51.100.140': 'documentation',
    '203.0.113.80': 'documentation',
    '224.0.0.1': 'multicast',
    '240.0.0.1': 'reserved',
    '255.255.255.255': 'broadcast',
    '0.0.0.0': 'unspecified',
    '8.8.4.4': 'public',
  };
  for (const [address, kind] of Object.entries(expected)) assert.equal(addressKind(ip(address)), kind, address);
});

test('gateway check: the 1995 question', () => {
  const host = ip('192.168.1.10');
  assert.equal(checkGateway(host, 24, ip('192.168.1.1')), 'ok');
  assert.equal(checkGateway(host, 24, ip('192.168.2.1')), 'otherSubnet');
  assert.equal(checkGateway(host, 24, ip('192.168.1.0')), 'isNetwork');
  assert.equal(checkGateway(host, 24, ip('192.168.1.255')), 'isBroadcast');
  assert.equal(checkGateway(host, 24, host), 'isSelf');
  assert.equal(checkGateway(ip('10.0.0.0'), 31, ip('10.0.0.1')), 'ok');
});

test('splitting: equal blocks that tile the parent exactly', () => {
  const { blocks, count } = splitSubnet(ip('192.168.1.0'), 24, 26);
  assert.equal(count, 4);
  assert.deepEqual(blocks.map((block) => `${formatIPv4(block.network)}/${block.prefix}`), ['192.168.1.0/26', '192.168.1.64/26', '192.168.1.128/26', '192.168.1.192/26']);
  assert.equal(splitSubnet(ip('10.0.0.0'), 8, 16).blocks.length, 16, 'listing is capped');
  assert.equal(splitSubnet(ip('10.0.0.0'), 8, 16).count, 256);
  assert.equal(splitSubnet(ip('10.0.0.0'), 24, 8).count, 0);
});

test('ping: agrees with the Traceroute routes and never beats their fastest probe', () => {
  for (const route of routes) {
    const result = ping(routes, route.target);
    const destination = route.hops.at(-1);
    assert.ok(result.ok, route.target);
    assert.equal(result.ip, destination.ip);
    for (const reply of result.replies) {
      assert.ok(reply.ms >= Math.min(...destination.rtt), `${route.target} ${reply.ms}`);
      assert.ok(reply.ms <= Math.max(...destination.rtt) + 1, `${route.target} ${reply.ms}`);
      assert.equal(reply.ttl, 64 - (route.hops.length - 1));
    }
  }
  // The same run prints the same times: nothing random in the output.
  assert.deepEqual(ping(routes, 'www.tokyo.example'), ping(routes, 'www.tokyo.example'));
});

test('ping: loopback is instant, a documentation address stays silent, a stranger is unknown', () => {
  const loop = ping(routes, '127.0.0.1');
  assert.equal(loop.kind, 'loopback');
  assert.ok(loop.replies.every((reply) => reply.ms < 1));
  assert.ok(formatPingLines(loop).some((line) => line.includes('time<1ms')));
  assert.equal(ping(routes, 'localhost').ip, '127.0.0.1');
  const silent = ping(routes, '192.0.2.99');
  assert.equal(silent.kind, 'silent');
  assert.deepEqual(pingStats(silent.replies), { sent: 4, received: 0, lossPercent: 100, min: null, max: null, average: null });
  assert.equal(formatPingSummary('192.0.2.99', pingStats(silent.replies)).length, 2);
  assert.deepEqual(ping(routes, 'nowhere.example'), { ok: false, host: 'nowhere.example' });
  for (const example of pingExamples) assert.ok(ping(routes, example).ok, example);
});

test('ping: Windows 95 output format', () => {
  const lines = formatPingLines(ping(routes, 'www.newyork.example'));
  assert.equal(lines[0], 'Pinging www.newyork.example [198.51.100.140] with 32 bytes of data:');
  assert.match(lines[2], /^Reply from 198\.51\.100\.140: bytes=32 time=8\dms TTL=57$/);
});

test('DNS: iterative steps, CNAMEs followed, NXDOMAIN, and the cache', () => {
  const first = lookup(dnsZones, 'WWW.NewYork.example.', 'A', new Set());
  assert.equal(first.name, 'www.newyork.example');
  assert.deepEqual(first.steps.map((step) => step.server), ['resolver', 'root', 'tld', 'authoritative']);
  assert.deepEqual(first.steps.map((step) => step.answer), ['asks', 'referral', 'referral', 'records']);
  assert.deepEqual(first.records.map((record) => record.type), ['CNAME', 'A']);
  assert.equal(first.records.at(-1).value, '198.51.100.140');
  assert.ok(first.found);
  const again = lookup(dnsZones, 'www.newyork.example', 'A', new Set(['www.newyork.example|A']));
  assert.deepEqual(again.steps, [{ server: 'cache', zone: 'www.newyork.example', answer: 'cached', ms: 0 }]);
  const missing = lookup(dnsZones, 'nothing.here.test', 'A', new Set());
  assert.equal(missing.found, false);
  assert.equal(missing.steps.at(-1).answer, 'nxdomain');
  assert.equal(lookup(dnsZones, 'newyork.example', 'MX', new Set()).records.length, 2);
  assert.equal(formatRecord({ name: 'newyork.example', type: 'MX', ttl: 3600, priority: 10, value: 'mx1.newyork.example' }), 'newyork.example.         3600  IN  MX    10 mx1.newyork.example.');
  for (const example of dnsExamples) assert.ok(lookup(dnsZones, example.name, example.type, new Set()).found, `${example.name} ${example.type}`);
});

test('DNS data is a simulation only: example names and documentation addresses', () => {
  for (const zone of dnsZones) {
    assert.match(zone.zone, /\.example$|^home\.arpa$/);
    for (const record of zone.records) {
      assert.ok(record.name === zone.zone || record.name.endsWith(`.${zone.zone}`), record.name);
      if (record.type === 'A') assert.ok(['documentation', 'private'].includes(addressKind(parseIPv4(record.value))), record.value);
      if (record.type === 'AAAA') assert.match(record.value, /^2001:db8:/);
    }
  }
});

test('ports: ranges, queries, and every listed port has copy in every language', () => {
  assert.equal(portRange(443), 'wellKnown');
  assert.equal(portRange(3389), 'registered');
  assert.equal(portRange(50000), 'dynamic');
  assert.deepEqual(readPortQuery(' 443 '), { kind: 'number', port: 443 });
  assert.deepEqual(readPortQuery('SSH'), { kind: 'name', text: 'ssh' });
  assert.deepEqual(readPortQuery('70000'), { kind: 'invalid' });
  assert.deepEqual(readPortQuery(''), { kind: 'empty' });
  assert.equal(new Set(wellKnownPorts.map((entry) => entry.port)).size, wellKnownPorts.length, 'no port listed twice');
  for (const locale of ['de', 'en', 'fa']) {
    const ports = copy(locale).ports;
    for (const entry of wellKnownPorts) assert.ok(ports.services[entry.id], `${locale} ${entry.id}`);
    for (const story of portStories) assert.ok(ports.stories[story.id], `${locale} ${story.id}`);
  }
});

test('network copy: every address kind and verdict is explained, and the simulations say so', () => {
  const kinds = ['unspecified', 'loopback', 'private', 'sharedCgnat', 'linkLocal', 'documentation', 'multicast', 'reserved', 'broadcast', 'public'];
  for (const locale of ['de', 'en', 'fa']) {
    const network = copy(locale);
    for (const kind of kinds) assert.ok(network.subnet.kinds[kind].name && network.subnet.kinds[kind].note, `${locale} ${kind}`);
    for (const verdict of ['ok', 'otherSubnet', 'isNetwork', 'isBroadcast', 'isSelf']) assert.ok(network.subnet.gateway.verdicts[verdict], `${locale} ${verdict}`);
    assert.ok(network.ping.simulation.length > 60 && network.dns.simulation.length > 60, locale);
  }
});
