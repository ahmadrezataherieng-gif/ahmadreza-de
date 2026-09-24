/**
 * Template for `legal.local.ts`, the git-ignored file that holds the postal
 * address for the Impressum. The real address never enters the repository
 * (ROADMAP.md A1, DECISIONS.md 60): copy this file to `legal.local.ts` and fill
 * in the real values, or set LEGAL_STREET and LEGAL_POSTCODE_CITY in the build
 * environment and `next.config.mjs` writes the file for you.
 *
 * The values below are dummies. The build refuses to run without the local
 * file, and refuses these dummies too, so the Impressum can never ship without
 * a real address.
 */
export const LEGAL_ADDRESS = {
  street: 'Musterstraße 1',
  postcodeCity: '00000 Musterstadt',
} as const;
