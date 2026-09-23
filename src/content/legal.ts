/**
 * The provider's identity for the Impressum and the Datenschutzerklärung - and
 * for nothing else. Supplied by Ahmadreza on 2026-09-23 for exactly these two
 * pages: never import this anywhere else, never add it to the Assistant's
 * index, the Terminal, About or structured data. The legal name is the only
 * place "Momrabadi" may appear on the site (the `seo` skill).
 *
 * Machine text, identical in every language; the country name and the e-mail
 * label come from `messages/legal/`.
 */
export const LEGAL_CONTACT = {
  name: 'Ahmadreza Taheri Momrabadi',
  street: '[Adresse entfernt]',
  postcodeCity: '[PLZ entfernt] Trier',
  email: 'ahmadrezataheride@gmail.com',
} as const;
