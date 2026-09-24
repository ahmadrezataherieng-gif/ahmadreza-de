/**
 * The provider's identity for the Impressum and the Datenschutzerklärung - and
 * for nothing else. Supplied by Ahmadreza on 2026-09-23 for exactly these two
 * pages: never import this anywhere else, never add it to the Assistant's
 * index, the Terminal, About or structured data. The legal name is the only
 * place "Momrabadi" may appear on the site (the `seo` skill).
 *
 * The postal address lives in the git-ignored `legal.local.ts` (template:
 * `legal.example.ts`), never in the repository: `scripts/legal-address.mjs`
 * stops every build that lacks it (DECISIONS.md 60).
 *
 * Machine text, identical in every language; the country name and the e-mail
 * label come from `messages/legal/`.
 */
import { EMAIL } from './profile.ts';
import { LEGAL_ADDRESS } from './legal.local.ts';

export const LEGAL_CONTACT = {
  name: 'Ahmadreza Taheri Momrabadi',
  street: LEGAL_ADDRESS.street,
  postcodeCity: LEGAL_ADDRESS.postcodeCity,
  email: EMAIL.address,
} as const;
