// The guard that keeps the Impressum from ever shipping without a postal
// address, while the address itself stays out of the repository (DECISIONS.md 60).
//
// The address lives in src/content/legal.local.ts, which is git-ignored. On a
// machine without it, a build environment may supply LEGAL_STREET and
// LEGAL_POSTCODE_CITY (a Cloudflare build secret, ROADMAP.md POST-04) and the
// file is written from them. Anything else stops the build with an error that
// says what to do - never a silent Impressum without an address.
//
// One exception, for cloud sessions that never see the real address: with
// AMONEL_PREVIEW_BUILD=1 a missing local file is filled with a copy of the dummy
// template (legal.example.ts), so the site can be built, linted and tested. That
// is a non-production build only: it is refused on Cloudflare's build machines
// (WORKERS_CI, CF_PAGES), and without the flag the dummy address is refused
// exactly as before - the Impressum can never ship with the placeholder.

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const defaultFile = new URL('../src/content/legal.local.ts', import.meta.url);
const example = new URL('../src/content/legal.example.ts', import.meta.url);
/** The switch for building with the dummy address; never set it for a deploy. */
export const PREVIEW_FLAG = 'AMONEL_PREVIEW_BUILD';
// The dummies in legal.example.ts: a copy that was never filled in must not ship.
const DUMMIES = ['Musterstraße 1', '00000 Musterstadt'];

export function ensureLegalAddress({ file = defaultFile, env = process.env } = {}) {
  const preview = env[PREVIEW_FLAG] === '1';
  if (preview && (env.WORKERS_CI || env.CF_PAGES)) {
    throw new Error(`${PREVIEW_FLAG}=1 builds with the dummy address and must never run on Cloudflare: unset it and provide the real address (LEGAL_STREET, LEGAL_POSTCODE_CITY).`);
  }
  if (!existsSync(file)) {
    const street = env.LEGAL_STREET?.trim();
    const postcodeCity = env.LEGAL_POSTCODE_CITY?.trim();
    if (street && postcodeCity) {
      const quote = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      writeFileSync(
        file,
        `// Written by scripts/legal-address.mjs from the build environment. Git-ignored.\nexport const LEGAL_ADDRESS = {\n  street: ${quote(street)},\n  postcodeCity: ${quote(postcodeCity)},\n} as const;\n`,
      );
    } else if (preview) {
      copyFileSync(example, file);
      console.warn(`${PREVIEW_FLAG}=1: building with the DUMMY address from legal.example.ts - not a production build, never deploy it.`);
    } else {
      throw new Error(
        'Missing src/content/legal.local.ts - the Impressum needs a postal address.\n' +
          'Copy src/content/legal.example.ts to src/content/legal.local.ts and fill in the real address,\n' +
          'or set LEGAL_STREET and LEGAL_POSTCODE_CITY in the build environment.\n' +
          `(A cloud session without the address sets ${PREVIEW_FLAG}=1 to build and test with dummy data; see CLAUDE.md, "Cloud sessions".)`,
      );
    }
  }
  const source = readFileSync(file, 'utf8');
  if (!/street:\s*'[^']+'/.test(source) || !/postcodeCity:\s*'[^']+'/.test(source)) {
    throw new Error('src/content/legal.local.ts must export LEGAL_ADDRESS with a non-empty street and postcodeCity.');
  }
  if (!preview && DUMMIES.some((dummy) => source.includes(dummy))) {
    throw new Error('src/content/legal.local.ts still holds the dummy address from legal.example.ts - fill in the real one.');
  }
}

// `npm run setup:preview` (with AMONEL_PREVIEW_BUILD=1): create the local file without building, so lint and tests work in a cloud session.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) ensureLegalAddress();
