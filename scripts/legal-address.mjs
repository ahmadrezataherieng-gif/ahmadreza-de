// The guard that keeps the Impressum from ever shipping without a postal
// address, while the address itself stays out of the repository (DECISIONS.md 60).
//
// The address lives in src/content/legal.local.ts, which is git-ignored. On a
// machine without it, a build environment may supply LEGAL_STREET and
// LEGAL_POSTCODE_CITY (a Cloudflare build secret, ROADMAP.md POST-04) and the
// file is written from them. Anything else stops the build with an error that
// says what to do - never a silent Impressum without an address.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../src/content/legal.local.ts', import.meta.url);
// The dummies in legal.example.ts: a copy that was never filled in must not ship.
const DUMMIES = ['Musterstraße 1', '00000 Musterstadt'];

export function ensureLegalAddress() {
  if (!existsSync(file)) {
    const street = process.env.LEGAL_STREET?.trim();
    const postcodeCity = process.env.LEGAL_POSTCODE_CITY?.trim();
    if (!street || !postcodeCity) {
      throw new Error(
        'Missing src/content/legal.local.ts - the Impressum needs a postal address.\n' +
          'Copy src/content/legal.example.ts to src/content/legal.local.ts and fill in the real address,\n' +
          'or set LEGAL_STREET and LEGAL_POSTCODE_CITY in the build environment.',
      );
    }
    const quote = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    writeFileSync(
      file,
      `// Written by scripts/legal-address.mjs from the build environment. Git-ignored.\nexport const LEGAL_ADDRESS = {\n  street: ${quote(street)},\n  postcodeCity: ${quote(postcodeCity)},\n} as const;\n`,
    );
  }
  const source = readFileSync(file, 'utf8');
  if (!/street:\s*'[^']+'/.test(source) || !/postcodeCity:\s*'[^']+'/.test(source)) {
    throw new Error('src/content/legal.local.ts must export LEGAL_ADDRESS with a non-empty street and postcodeCity.');
  }
  if (DUMMIES.some((dummy) => source.includes(dummy))) {
    throw new Error('src/content/legal.local.ts still holds the dummy address from legal.example.ts - fill in the real one.');
  }
}
