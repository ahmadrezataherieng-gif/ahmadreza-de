/**
 * The Traceroute app's prepared routes, as typed data.
 *
 * A simulation, and labelled as one: a browser cannot send the packets a real
 * traceroute sends. The routes start at an assumed home connection in
 * Frankfurt am Main. Every address is from a range reserved for examples -
 * `home.arpa` (RFC 8375) for the home network, `.example` (RFC 2606) for names,
 * 192.0.2.0/24, 198.51.100.0/24 and 203.0.113.0/24 (RFC 5737) for public
 * addresses - so nothing here claims to be a real machine.
 *
 * The times are not measured but they are honest: each hop is at least as slow
 * as light in glass fibre allows for the distance behind it (about 1 ms per
 * 100 km there and back), and times only grow along a route, apart from the
 * few tenths of a millisecond real probes jitter by. `scripts/test/apps.test.mjs`
 * checks both.
 */

/** What a hop is, for the visitor. Labels live in `traceroute.roles.<role>`. */
export type HopRole =
  | 'homeRouter'
  | 'ispAccess'
  | 'ispCore'
  | 'exchange'
  | 'carrier'
  | 'subsea'
  | 'hosting'
  | 'edge'
  | 'destination'
  | 'silent';

export interface Hop {
  role: HopRole;
  /** Machine text. Null for a router that did not answer (`* * *`). */
  host: string | null;
  ip: string | null;
  /** The three probes' round-trip times in milliseconds; null when silent. */
  rtt: readonly [number, number, number] | null;
  /** Great-circle kilometres from the start to this hop, for the fibre check. */
  km: number;
}

export const routeIds = ['router', 'ahmadreza', 'newyork', 'tokyo'] as const;
export type RouteId = (typeof routeIds)[number];

export interface Route {
  id: RouteId;
  /** What the visitor types or picks. Machine text. */
  target: string;
  hops: readonly Hop[];
}

const home: Hop = { role: 'homeRouter', host: 'router.home.arpa', ip: '192.168.1.1', rtt: [0.61, 0.5, 0.49], km: 0 };
const access: Hop = { role: 'ispAccess', host: 'bng1.fra.isp.example', ip: '198.51.100.1', rtt: [7.82, 7.21, 7.46], km: 2 };
const core: Hop = { role: 'ispCore', host: 'core1.fra.isp.example', ip: '198.51.100.17', rtt: [8.41, 8.12, 8.63], km: 5 };
const carrierFra: Hop = { role: 'carrier', host: 'be2.fra.carrier.example', ip: '192.0.2.33', rtt: [9.14, 9.38, 9.02], km: 5 };
const carrierLon: Hop = { role: 'carrier', host: 'ae7.lon.carrier.example', ip: '192.0.2.49', rtt: [16.9, 16.62, 17.3], km: 640 };
const carrierNyc: Hop = { role: 'subsea', host: 'ae1.nyc.carrier.example', ip: '192.0.2.57', rtt: [84.4, 84.12, 85.03], km: 6200 };

export const routes: readonly Route[] = [
  {
    id: 'router',
    target: '192.168.1.1',
    hops: [{ ...home, role: 'destination' }],
  },
  {
    id: 'ahmadreza',
    target: 'ahmadreza.de',
    hops: [
      home,
      access,
      core,
      { role: 'exchange', host: 'ix.fra.exchange.example', ip: '192.0.2.10', rtt: [9.02, 8.84, 9.31], km: 5 },
      { role: 'edge', host: 'edge.fra.cdn.example', ip: '203.0.113.5', rtt: [9.38, 9.12, 9.24], km: 5 },
      { role: 'destination', host: 'ahmadreza.de', ip: '203.0.113.80', rtt: [9.31, 9.22, 9.47], km: 5 },
    ],
  },
  {
    id: 'newyork',
    target: 'www.newyork.example',
    hops: [
      home,
      access,
      core,
      carrierFra,
      carrierLon,
      carrierNyc,
      { role: 'hosting', host: 'ae4.nyc.hosting.example', ip: '198.51.100.130', rtt: [85.2, 84.91, 85.62], km: 6200 },
      { role: 'destination', host: 'www.newyork.example', ip: '198.51.100.140', rtt: [85.51, 85.14, 85.83], km: 6200 },
    ],
  },
  {
    id: 'tokyo',
    target: 'www.tokyo.example',
    hops: [
      home,
      access,
      core,
      carrierFra,
      // Many routers are told not to answer traceroute probes. The packet still passes.
      { role: 'silent', host: null, ip: null, rtt: null, km: 300 },
      carrierLon,
      carrierNyc,
      { role: 'carrier', host: 'ae9.chi.carrier.example', ip: '192.0.2.65', rtt: [101.73, 101.4, 102.08], km: 7000 },
      { role: 'carrier', host: 'ae2.sjc.carrier.example', ip: '192.0.2.73', rtt: [134.22, 133.9, 134.61], km: 9100 },
      { role: 'subsea', host: 'ae5.tyo.carrier.example', ip: '192.0.2.81', rtt: [241.8, 241.33, 242.4], km: 9350 },
      { role: 'destination', host: 'www.tokyo.example', ip: '198.51.100.200', rtt: [242.6, 242.1, 243.05], km: 9350 },
    ],
  },
];
