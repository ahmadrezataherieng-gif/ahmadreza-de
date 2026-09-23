/**
 * The shape of `messages/legal/<locale>.json`: the Impressum and the
 * Datenschutzerklärung as data, rendered by `components/legal/LegalPage` on
 * the site and by `scripts/build-soon.mjs` on the "coming soon" page.
 *
 * A section or block can carry a `scope`: `site` only on the real site,
 * `soon` only on the coming-soon page, none on both. Both pages describe only
 * what really happens on them - the coming-soon page has no counters, no
 * Assistant and a single storage entry.
 */

export type LegalScope = 'site' | 'soon';

export type LegalBlock =
  | { type: 'p'; text: string; scope?: LegalScope }
  | { type: 'list'; items: string[]; scope?: LegalScope }
  | { type: 'table'; head: string[]; rows: string[][]; scope?: LegalScope }
  | { type: 'contact'; scope?: LegalScope };

export interface LegalSection {
  heading: string;
  scope?: LegalScope;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  description: string;
  sections: LegalSection[];
}

export interface LegalCopy {
  updated: string;
  /** Empty in German, the binding version. */
  bindingNote: string;
  bindingLink: string;
  backHome: string;
  country: string;
  emailLabel: string;
  imprint: LegalDocument;
  privacy: LegalDocument;
}

export type LegalKind = 'imprint' | 'privacy';

/** The sections and blocks that apply to one of the two sites. */
export function sectionsFor(document: LegalDocument, scope: LegalScope): LegalSection[] {
  return document.sections
    .filter((section) => !section.scope || section.scope === scope)
    .map((section) => ({
      ...section,
      blocks: section.blocks.filter((block) => !block.scope || block.scope === scope),
    }));
}

/** Splits text into plain runs and bare https URLs, so the URLs can be links. */
export function linkify(text: string): Array<{ text: string; href?: string }> {
  const parts: Array<{ text: string; href?: string }> = [];
  const pattern = /https:\/\/[^\s,;)]+/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index) });
    parts.push({ text: match[0], href: match[0] });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
