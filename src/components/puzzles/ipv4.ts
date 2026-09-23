/**
 * IPv4 arithmetic for the 1995 puzzle - real subnetting, not a string compare.
 *
 * A wrong configuration fails for the reason a real network would give, in the
 * order a real stack meets them: a malformed value, a malformed mask, a host
 * address that is not a host, a gateway the PC cannot reach, an address that
 * collides, a router that cannot answer, and finally no router at all.
 */

/** The network the PC has to join. Fixed facts of the puzzle's world. */
// CONTENT-TODO CR-297
export const ROUTER = '192.168.1.1';
export const PRINTER = '192.168.1.20';
const ROUTER_NETWORK = '192.168.1.0';
const ROUTER_PREFIX = 24;

export type SubnetError =
  | { key: 'invalidAddress'; values: { value: string } }
  | { key: 'invalidMask'; values: { value: string } }
  | { key: 'networkAddress'; values: { ip: string } }
  | { key: 'broadcastAddress'; values: { ip: string } }
  | { key: 'gatewayOutside'; values: { gateway: string; network: string } }
  | { key: 'sameAsGateway'; values: { ip: string } }
  | { key: 'conflictRouter'; values: { ip: string } }
  | { key: 'conflictPrinter'; values: { ip: string } }
  | { key: 'routerCannotReply'; values: { ip: string } }
  | { key: 'noRouter'; values: { gateway: string } };

export type SubnetResult = { ok: true } | ({ ok: false } & SubnetError);

/** Persian and Arabic-Indic digits become ASCII; a Persian keyboard types those. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[٫،]/g, '.');
}

/** Parse dotted quad to an unsigned 32-bit number, or null. */
export function parseAddress(value: string): number | null {
  const text = normalizeDigits(value).trim();
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) return null;
  const octets = text.split('.').map(Number);
  if (octets.some((octet) => octet > 255)) return null;
  return octets.reduce((sum, octet) => sum * 256 + octet, 0);
}

export function formatAddress(address: number): string {
  return [24, 16, 8, 0].map((shift) => Math.floor(address / 2 ** shift) % 256).join('.');
}

/** Prefix length of a contiguous mask, or null if the ones have gaps. */
export function maskPrefix(mask: number): number | null {
  const bits = mask.toString(2).padStart(32, '0');
  const prefix = bits.indexOf('0') === -1 ? 32 : bits.indexOf('0');
  return bits.slice(prefix).includes('1') ? null : prefix;
}

function networkOf(address: number, prefix: number): number {
  const size = 2 ** (32 - prefix);
  return Math.floor(address / size) * size;
}

function broadcastOf(address: number, prefix: number): number {
  return networkOf(address, prefix) + 2 ** (32 - prefix) - 1;
}

export function checkConfiguration(ip: string, mask: string, gateway: string): SubnetResult {
  const ipValue = parseAddress(ip);
  if (ipValue === null) return { ok: false, key: 'invalidAddress', values: { value: ip } };

  const maskValue = parseAddress(mask);
  const prefix = maskValue === null ? null : maskPrefix(maskValue);
  // /31 and /32 leave no room for a PC and a gateway; /0 is not a subnet.
  if (prefix === null || prefix < 1 || prefix > 30) {
    return { ok: false, key: 'invalidMask', values: { value: mask } };
  }

  const gatewayValue = parseAddress(gateway);
  if (gatewayValue === null) return { ok: false, key: 'invalidAddress', values: { value: gateway } };

  const ipText = formatAddress(ipValue);
  const gatewayText = formatAddress(gatewayValue);

  // The PC's own view of its subnet.
  const network = networkOf(ipValue, prefix);
  if (ipValue === network) return { ok: false, key: 'networkAddress', values: { ip: ipText } };
  if (ipValue === broadcastOf(ipValue, prefix)) return { ok: false, key: 'broadcastAddress', values: { ip: ipText } };

  if (networkOf(gatewayValue, prefix) !== network) {
    return {
      ok: false,
      key: 'gatewayOutside',
      values: { gateway: gatewayText, network: `${formatAddress(network)}/${prefix}` },
    };
  }
  if (gatewayValue === ipValue) return { ok: false, key: 'sameAsGateway', values: { ip: ipText } };

  const router = parseAddress(ROUTER) ?? 0;
  const printer = parseAddress(PRINTER) ?? 0;
  if (ipValue === router) return { ok: false, key: 'conflictRouter', values: { ip: ipText } };
  if (ipValue === printer) return { ok: false, key: 'conflictPrinter', values: { ip: ipText } };

  // The router's view: it only answers hosts inside its own /24. A PC with a
  // wider mask can believe it is local and still get no reply.
  const routerNetwork = parseAddress(ROUTER_NETWORK) ?? 0;
  if (networkOf(ipValue, ROUTER_PREFIX) !== routerNetwork) {
    return { ok: false, key: 'routerCannotReply', values: { ip: ipText } };
  }
  if (ipValue === routerNetwork) return { ok: false, key: 'networkAddress', values: { ip: ipText } };
  if (ipValue === broadcastOf(routerNetwork, ROUTER_PREFIX)) {
    return { ok: false, key: 'broadcastAddress', values: { ip: ipText } };
  }

  if (gatewayValue !== router) return { ok: false, key: 'noRouter', values: { gateway: gatewayText } };

  return { ok: true };
}
