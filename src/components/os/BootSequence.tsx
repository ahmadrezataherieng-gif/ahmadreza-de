import type { CSSProperties } from 'react';

/**
 * A short systemd-style boot log on a direct visit to /desktop/ (queue
 * 2026-09-28 B item 1). Machine text, English and LTR in every locale, like
 * the Terminal's own shell output (CLAUDE.md's machine-text exception) -
 * CONTENT-TODO CR-1138.
 *
 * No hooks, so the server renders it: the whole thing is static HTML, timed
 * by CSS alone (globals.css, `.ao-boot`), so it never delays interactivity.
 * Whether it plays at all - never after the Convergence hand-over, never
 * under reduced motion - is decided before the first paint by
 * `BOOT_SKIP_SCRIPT` (layout.tsx) and the reduced-motion media query in
 * globals.css.
 */
export const WELCOME_LINE = 'Welcome to Amonel OS';

export const LINES = [
  'Mounted /home/ahmadreza.',
  'Started Network Protocols.',
  'Started Hardware Skills.',
  'Started Linux Subsystem.',
  'Mounted Eighty Years of Computing History.',
  'Reached target Puzzles Solved.',
  'Started Amonel Shell.',
  'Started Window Manager.',
  'Started Amonel OS Desktop.',
  'Reached target Graphical Interface.',
] as const;

export function BootSequence() {
  return (
    <div className="ao-boot" aria-hidden="true" dir="ltr">
      {LINES.map((line, index) => (
        <p key={line} className="ao-boot-line" style={{ '--i': index } as CSSProperties}>
          <span className="ao-boot-ok">[  OK  ]</span> {line}
        </p>
      ))}
      <p className="ao-boot-line ao-boot-welcome" style={{ '--i': LINES.length } as CSSProperties}>
        {WELCOME_LINE}
      </p>
    </div>
  );
}
