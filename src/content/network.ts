/**
 * The Network tools app's prepared data (Phase 9D-2, DECISIONS.md 63): a small
 * DNS world and the well-known ports. Machine text only; every word a visitor
 * reads is in `messages/apps/network/`.
 *
 * Like the Traceroute routes, the DNS data is a labelled simulation: every
 * name is under `.example` (RFC 2606) or `home.arpa` (RFC 8375), every address
 * from a documentation range (RFC 5737, and 2001:db8::/32 from RFC 3849) - so
 * nothing claims to be a real machine. The addresses agree with
 * `content/routes.ts`, so Ping, Traceroute and DNS tell one story.
 */

export const dnsRecordTypes = ['A', 'AAAA', 'MX', 'TXT', 'CNAME'] as const;
export type DnsRecordType = (typeof dnsRecordTypes)[number];

export interface DnsRecord {
  name: string;
  type: DnsRecordType;
  /** Seconds a resolver may keep the answer. */
  ttl: number;
  value: string;
  /** MX only: lower is tried first. */
  priority?: number;
}

export interface DnsZone {
  zone: string;
  /** Round trip to this zone's name server in ms, from the same home line as the routes. */
  ms: number;
  records: readonly DnsRecord[];
}

// CONTENT-TODO CR-1067 (the names are machine text, but the story they tell is content)
export const dnsZones: readonly DnsZone[] = [
  {
    zone: 'newyork.example',
    ms: 86,
    records: [
      { name: 'www.newyork.example', type: 'CNAME', ttl: 3600, value: 'web.newyork.example' },
      { name: 'web.newyork.example', type: 'A', ttl: 300, value: '198.51.100.140' },
      { name: 'web.newyork.example', type: 'AAAA', ttl: 300, value: '2001:db8:140::1' },
      { name: 'newyork.example', type: 'A', ttl: 300, value: '198.51.100.140' },
      { name: 'newyork.example', type: 'MX', ttl: 3600, priority: 10, value: 'mx1.newyork.example' },
      { name: 'newyork.example', type: 'MX', ttl: 3600, priority: 20, value: 'mx2.newyork.example' },
      { name: 'mx1.newyork.example', type: 'A', ttl: 300, value: '198.51.100.150' },
      { name: 'mx2.newyork.example', type: 'A', ttl: 300, value: '198.51.100.151' },
      { name: 'newyork.example', type: 'TXT', ttl: 3600, value: 'v=spf1 mx -all' },
    ],
  },
  {
    zone: 'tokyo.example',
    ms: 243,
    records: [
      { name: 'www.tokyo.example', type: 'A', ttl: 600, value: '198.51.100.200' },
      { name: 'www.tokyo.example', type: 'AAAA', ttl: 600, value: '2001:db8:200::1' },
      { name: 'tokyo.example', type: 'MX', ttl: 3600, priority: 10, value: 'mail.tokyo.example' },
      { name: 'mail.tokyo.example', type: 'A', ttl: 600, value: '198.51.100.210' },
    ],
  },
  {
    zone: 'amonel.example',
    ms: 10,
    records: [
      { name: 'amonel.example', type: 'A', ttl: 300, value: '203.0.113.80' },
      // A hidden greeting for whoever asks for TXT (APP-15).
      { name: 'amonel.example', type: 'TXT', ttl: 60, value: 'hello=curious-visitor; you-read-dns-records-for-fun; ask-ahmadreza-about-networks' },
    ],
  },
  {
    zone: 'home.arpa',
    ms: 1,
    records: [{ name: 'router.home.arpa', type: 'A', ttl: 60, value: '192.168.1.1' }],
  },
];

/** The names offered as one-click examples, in this order. */
export const dnsExamples: readonly { name: string; type: DnsRecordType }[] = [
  { name: 'www.newyork.example', type: 'A' },
  { name: 'newyork.example', type: 'MX' },
  { name: 'www.tokyo.example', type: 'AAAA' },
  { name: 'amonel.example', type: 'TXT' },
];

/** Hosts offered as one-click ping targets: the Traceroute routes plus loopback and a silent address. */
export const pingExamples: readonly string[] = ['192.168.1.1', 'www.newyork.example', 'www.tokyo.example', '127.0.0.1', '192.0.2.99'];

export interface WellKnownPort {
  port: number;
  /** The IANA service name, machine text. */
  service: string;
  protocols: readonly ('tcp' | 'udp')[];
  /** Copy key under `network.ports.services.<id>`. */
  id: string;
}

/**
 * The ports an administrator meets every week - IANA's registry is the
 * source for numbers and service names. Descriptions are in the app's copy.
 */
// CONTENT-TODO CR-1068
export const wellKnownPorts: readonly WellKnownPort[] = [
  { port: 20, service: 'ftp-data', protocols: ['tcp'], id: 'ftpData' },
  { port: 21, service: 'ftp', protocols: ['tcp'], id: 'ftp' },
  { port: 22, service: 'ssh', protocols: ['tcp'], id: 'ssh' },
  { port: 23, service: 'telnet', protocols: ['tcp'], id: 'telnet' },
  { port: 25, service: 'smtp', protocols: ['tcp'], id: 'smtp' },
  { port: 53, service: 'domain', protocols: ['tcp', 'udp'], id: 'dns' },
  { port: 67, service: 'bootps', protocols: ['udp'], id: 'dhcpServer' },
  { port: 68, service: 'bootpc', protocols: ['udp'], id: 'dhcpClient' },
  { port: 80, service: 'http', protocols: ['tcp'], id: 'http' },
  { port: 110, service: 'pop3', protocols: ['tcp'], id: 'pop3' },
  { port: 123, service: 'ntp', protocols: ['udp'], id: 'ntp' },
  { port: 143, service: 'imap', protocols: ['tcp'], id: 'imap' },
  { port: 161, service: 'snmp', protocols: ['udp'], id: 'snmp' },
  { port: 389, service: 'ldap', protocols: ['tcp', 'udp'], id: 'ldap' },
  { port: 443, service: 'https', protocols: ['tcp', 'udp'], id: 'https' },
  { port: 445, service: 'microsoft-ds', protocols: ['tcp'], id: 'smb' },
  { port: 514, service: 'syslog', protocols: ['udp'], id: 'syslog' },
  { port: 587, service: 'submission', protocols: ['tcp'], id: 'submission' },
  { port: 636, service: 'ldaps', protocols: ['tcp'], id: 'ldaps' },
  { port: 993, service: 'imaps', protocols: ['tcp'], id: 'imaps' },
  { port: 995, service: 'pop3s', protocols: ['tcp'], id: 'pop3s' },
  { port: 3306, service: 'mysql', protocols: ['tcp'], id: 'mysql' },
  { port: 3389, service: 'ms-wbt-server', protocols: ['tcp', 'udp'], id: 'rdp' },
  { port: 5432, service: 'postgresql', protocols: ['tcp'], id: 'postgresql' },
  { port: 8080, service: 'http-alt', protocols: ['tcp'], id: 'httpAlt' },
];

/** Ports with a story rather than a service (APP-15). Copy: `network.ports.stories.<id>`. */
export const portStories: readonly { port: number; id: string }[] = [{ port: 31337, id: 'elite' }];
