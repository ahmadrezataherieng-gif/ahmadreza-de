/**
 * Ahmadreza's public profiles, for the Contact app and, once filled in, the
 * JSON-LD `sameAs` (ROADMAP OWN-03, SEO-03). Nothing is guessed: a profile
 * without a URL is not shown, and while none has one the Contact app says the
 * links will follow. Machine text - URLs and brand names are the same in
 * every language.
 * CONTENT-TODO CR-1063
 */
export interface Profile {
  id: 'linkedin' | 'github' | 'xing';
  /** The brand's own name, identical in every language. */
  name: string;
  url: string | null;
}

export const PROFILES: readonly Profile[] = [
  { id: 'linkedin', name: 'LinkedIn', url: null },
  { id: 'github', name: 'GitHub', url: null },
  { id: 'xing', name: 'XING', url: null },
];
