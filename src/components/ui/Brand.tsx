import { MARK_CURSOR, MARK_PATH, WORDMARK_PATH } from '@/components/ui/brand-paths';
import { cn } from '@/lib/cn';

/**
 * The Amonel logos (Phase 9A), drawn inline from the brand kit's outlines: no
 * image request, no font, colours from the fixed `--ao-brand-*` tokens.
 *
 * Kit rules kept here: the cursor is always amber and never recoloured; small
 * places get the mark alone; the "~$ amonel os" lockup is for OS contexts only.
 * None of these mirror in RTL - a logo is a picture, not text - so the SVGs need
 * nothing, and the lockup, which is text, is pinned to `dir="ltr"`.
 *
 * Without a `label` a logo is decoration (`aria-hidden`): the control or the
 * text beside it already names it. With one it is an image with that name.
 */

type Labelled = { label?: string; className?: string };

function a11y(label: string | undefined) {
  return label ? ({ role: 'img', 'aria-label': label } as const) : ({ 'aria-hidden': true } as const);
}

/**
 * The gradient needs an id, and ids are page-global: `uid` must be unique on
 * the page. A gradient defined inside a `display: none` subtree breaks every
 * other use of the same id, so two marks never share one.
 */
function MarkShapes({ uid }: { uid: string }) {
  const gradient = `${uid}-green`;
  return (
    <>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="[stop-color:var(--ao-brand-green-light)]" />
          <stop offset="0.6" className="[stop-color:var(--ao-brand-green)]" />
          <stop offset="1" className="[stop-color:var(--ao-brand-green-deep)]" />
        </linearGradient>
      </defs>
      <path
        d={MARK_PATH}
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect {...MARK_CURSOR} className="fill-brand-amber" />
    </>
  );
}

/** The mark alone: the one-line "A" with the amber cursor. For small places. */
export function AmonelMark({ uid, label, className }: Labelled & { uid: string }) {
  return (
    <svg viewBox="12 20 98 88" className={cn('block', className)} {...a11y(label)} focusable="false">
      <MarkShapes uid={uid} />
    </svg>
  );
}

/** The main logo: the mark and the W2 wordmark, on dark backgrounds. */
export function AmonelLogo({ uid, label, className }: Labelled & { uid: string }) {
  return (
    <svg viewBox="12 20 336.8 88" className={cn('block', className)} {...a11y(label)} focusable="false">
      <MarkShapes uid={uid} />
      <path d={WORDMARK_PATH} className="fill-brand-ink" />
    </svg>
  );
}

/** The lockup's prompt and command: machine text, the same in every locale. */
const LOCKUP_PROMPT = '~$';
const LOCKUP_COMMAND = 'amonel os';

/**
 * The Amonel OS lockup, `~$ amonel os` and a blinking amber block cursor, set
 * in JetBrains Mono 700 like the kit's outlines. Real text in a monospace face
 * rather than outlines: it sits in terminals and bars at text size, and scales
 * with the surrounding font. `.ao-cursor` blinks, and stops under reduced motion.
 */
export function AmonelOsLockup({ label, className }: Labelled) {
  return (
    <span
      dir="ltr"
      className={cn(
        'inline-flex items-center gap-[0.6ch] font-[family-name:var(--ao-font-jetbrains)] font-bold whitespace-nowrap',
        className,
      )}
      {...a11y(label)}
    >
      <span className="text-brand-muted" aria-hidden="true">
        {LOCKUP_PROMPT}
      </span>
      <span className="text-brand-green" aria-hidden="true">
        {LOCKUP_COMMAND}
      </span>
      <span className="ao-cursor inline-block h-[1.15em] w-[0.6em] bg-brand-amber" aria-hidden="true" />
    </span>
  );
}

/**
 * The glass app icon: the white mark on a CSS glass tile (`.ao-brand-glass`).
 * Fills its box; the caller sizes it.
 */
export function AmonelGlassIcon({ label, className }: Labelled) {
  return (
    <span className={cn('ao-brand-glass relative block overflow-hidden', className)} {...a11y(label)}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full text-brand-white" aria-hidden="true" focusable="false">
        {/* The kit's placement: the mark at 80 % of the tile, inside its safe area. */}
        <g transform="translate(12 12) scale(0.8)">
          <path
            d={MARK_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect {...MARK_CURSOR} fill="currentColor" />
        </g>
      </svg>
    </span>
  );
}
