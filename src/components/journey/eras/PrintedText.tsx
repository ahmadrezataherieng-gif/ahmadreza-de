import type { CSSProperties } from 'react';
import type { Glyph } from '@/lib/typeset';
import { cn } from '@/lib/cn';

interface PrintedLineProps {
  glyphs: Glyph[];
  className?: string;
}

/**
 * One line of mechanically printed text.
 *
 * The spans carry nothing but timing and imperfection as custom properties;
 * lib/print-controller.ts strikes them when the era section is marked
 * `data-started`, and `.ao-type` in globals.css says what a struck glyph looks
 * like. The reduced-motion query resolves it to its finished state in one rule.
 *
 * The inline styles are per-glyph animation timings, not theme values, so they
 * are within the "no inline styles for anything themeable" convention.
 */
export function PrintedLine({ glyphs, className }: PrintedLineProps) {
  // A blank line still has to occupy its row.
  if (glyphs.length === 0) {
    return (
      <span className={cn('block', className)} aria-hidden="true">
        {/* A non-breaking space: a plain space in an empty block collapses to
            zero height and the blank line disappears. */}
        {'\u00a0'}
      </span>
    );
  }

  return (
    // dir="auto": every glyph is an inline-block, which bidi treats as a neutral
    // object, so a Latin line inside a Persian page would lay its words out right
    // to left. Resolving direction per line from its first strong character
    // keeps "GM-NAA I/O" in order while Persian lines stay RTL.
    <span dir="auto" className={cn('ao-type block', className)}>
      {glyphs.map((glyph, index) => (
        <span
          key={index}
          data-glyph={glyph.text}
          data-overstruck={glyph.overstruck ? 'true' : undefined}
          style={
            {
              '--strike-delay': `${glyph.delay.toFixed(3)}s`,
              '--strike-ink': glyph.ink.toFixed(3),
              '--strike-jitter': `${glyph.jitter.toFixed(3)}em`,
            } as CSSProperties
          }
        >
          {glyph.text}
        </span>
      ))}
    </span>
  );
}

/** Print unit for a locale: Persian joins its letters, so it prints word by word. */
export function printUnit(locale: string): 'char' | 'word' {
  return locale === 'fa' ? 'word' : 'char';
}
