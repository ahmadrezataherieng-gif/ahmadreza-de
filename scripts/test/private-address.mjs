// The postal address is never written into the repository, not even into a
// test (DECISIONS.md 60). The tests read it from the git-ignored
// src/content/legal.local.ts, when there is one, and check that it appears
// nowhere else; on a machine without it there is nothing to leak.

import { existsSync, readFileSync } from 'node:fs';

const file = new URL('../../src/content/legal.local.ts', import.meta.url);

/** The street, the house-number-less street name and the postcode, if the local file exists. */
export function privateAddressParts() {
  if (!existsSync(file)) return [];
  const source = readFileSync(file, 'utf8');
  const street = source.match(/street:\s*'([^']+)'/)?.[1] ?? '';
  const postcodeCity = source.match(/postcodeCity:\s*'([^']+)'/)?.[1] ?? '';
  // A preview build (AMONEL_PREVIEW_BUILD) holds the dummy template, which is public and no secret.
  if (street.startsWith('Musterstra')) return [];
  const streetName = street.replace(/\s*\d.*$/, '');
  const postcode = postcodeCity.match(/\d{4,5}/)?.[0] ?? '';
  return [street, streetName, postcode].filter((part) => part.length >= 4);
}

/** True when the text contains any part of the private address. */
export function leaksAddress(text) {
  return privateAddressParts().some((part) => text.includes(part));
}
