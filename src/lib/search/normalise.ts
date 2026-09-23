/**
 * Locale-aware text normalisation for the local search (Phase 8B,
 * DECISIONS.md 53): folds away case, diacritics and script variants that mean
 * the same letter to a reader but a different code point to a string
 * comparison, so "Fähigkeiten?" finds "fahigkeiten" and "کجاست" finds "كجاست".
 *
 * Pure and dependency-free so `npm test` runs it in plain node, and small
 * enough to ship in the Assistant's own chunk rather than pull in a search
 * library (CLAUDE.md: no new dependency without asking first).
 */

/** Combining marks: Latin diacritics after NFKD, and Arabic/Persian harakat. */
const COMBINING_MARKS = /[̀-ًͯ-ٰٟۖ-ۭ]/g;
/** Zero-width joiners and marks - Persian's ZWNJ (نیم‌فاصله) among them. */
const ZERO_WIDTH = /[​-‏﻿]/g;
/** Arabic letterforms that Persian text also uses, folded onto their Persian letters. */
const PERSIAN_VARIANTS: readonly [RegExp, string][] = [
  [/ي/g, 'ی'], // ي -> ی
  [/ك/g, 'ک'], // ك -> ک
  [/ة/g, 'ه'], // ة -> ه
];
/** Persian and Eastern Arabic-Indic digits, folded onto ASCII - the same idea as the 1995 puzzle's subnet field (DECISIONS.md 38). */
function foldDigits(text: string): string {
  return text.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.codePointAt(0) ?? 0;
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

/**
 * Closed-class words - pronouns, articles, auxiliaries, question words -
 * common to German, English and Persian. They carry no topic on their own and
 * appear in nearly every sentence, so leaving them in would let "Wie ist
 * sein Werdegang?" or "wie backe ich einen Kuchen?" both look like they are
 * "about" the site's own intro, which happens to start with "Ich bin …".
 * One shared set rather than a per-locale one: a German stopword never
 * collides with a meaningful English or Persian word, or the reverse.
 */
const STOPWORDS = new Set([
  // German
  'ist', 'sind', 'war', 'waren', 'sein', 'seine', 'seiner', 'seinem', 'seinen',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'ihm', 'ihn', 'uns', 'euch',
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'einen', 'einem',
  'und', 'oder', 'nicht', 'auch', 'noch', 'nur', 'schon',
  'wie', 'was', 'wer', 'wo', 'warum', 'wann', 'welche', 'welcher', 'welches',
  'hat', 'habe', 'haben', 'kann', 'konnen', 'wird', 'werden',
  'mit', 'fur', 'von', 'zu', 'im', 'in', 'auf', 'an', 'bei', 'aus', 'nach', 'uber', 'durch', 'um', 'als', 'dass', 'ob',
  // English
  'is', 'are', 'was', 'were', 'be', 'been', 'am',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'him', 'her', 'his', 'them',
  'the', 'a', 'an', 'and', 'or', 'not', 'also', 'still', 'just',
  'how', 'what', 'who', 'where', 'why', 'when', 'which',
  'has', 'have', 'can', 'will', 'does', 'do', 'did',
  'with', 'for', 'of', 'to', 'on', 'at', 'by', 'from', 'after', 'through', 'about', 'that', 'this', 'in',
  // Persian
  'است', 'هست', 'هستند', 'بود', 'بودند',
  'من', 'تو', 'او', 'ما', 'شما', 'انها', 'ان',
  'و', 'یا', 'نه', 'هم', 'فقط', 'هنوز',
  'چطور', 'چگونه', 'چه', 'چیزی', 'کیست', 'کجا', 'چرا', 'کی', 'کدام', 'یک',
  'دارد', 'دارند', 'میتواند', 'میتوانند', 'میدهد', 'میدهند', 'میکند', 'میکنند',
  'با', 'برای', 'از', 'به', 'در', 'روی', 'که', 'این', 'آن', 'را',
]);

/** Lower-case, unaccented, script- and digit-folded, punctuation stripped to single spaces. */
export function normalise(text: string): string {
  let value = text.toLowerCase().normalize('NFKD').replace(COMBINING_MARKS, '').replace(ZERO_WIDTH, '');
  value = value.replace(/ß/g, 'ss');
  for (const [pattern, replacement] of PERSIAN_VARIANTS) value = value.replace(pattern, replacement);
  value = foldDigits(value);
  return value
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Meaningful words: more than one character, and not a closed-class word common to de/en/fa. */
export function tokenise(text: string): string[] {
  return normalise(text)
    .split(' ')
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}
