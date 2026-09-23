import type { ReactNode } from 'react';
import type { AppId } from '@/content/eras';

/**
 * One line glyph per app, drawn on a 24-unit grid with a 1.6 stroke, in
 * `currentColor` so the theme colours them. Original drawings: nothing here
 * copies another system's icon set.
 */
const GLYPHS: Record<AppId, ReactNode> = {
  about: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.8 3.5-6 7-6s6.2 2.2 7 6" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M7 10l3 2.5L7 15M12.5 15.5H17" />
    </>
  ),
  tickets: (
    <>
      <path d="M3.5 7.5h17v3a2 2 0 000 3v3h-17v-3a2 2 0 000-3z" />
      <path d="M14.5 7.5v9" strokeDasharray="1.6 1.6" />
    </>
  ),
  traceroute: (
    <>
      <circle cx="5" cy="17.5" r="1.8" />
      <circle cx="11" cy="7" r="1.8" />
      <circle cx="19" cy="13" r="1.8" />
      <path d="M6 16l4-7.3M12.6 8.2l4.9 3.6" />
    </>
  ),
  assistant: (
    <>
      <path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z" />
      <path d="M12 8l.9 2.1 2.1.9-2.1.9L12 14l-.9-2.1L9 11l2.1-.9z" />
    </>
  ),
  contact: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  timeline: (
    <>
      <path d="M3 12h18" />
      <circle cx="6.5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="17.5" cy="12" r="1.8" />
      <path d="M6.5 9.5V6M12 14.5V18M17.5 9.5V6" />
    </>
  ),
  cv: (
    <>
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 12h6M9 15h6M9 18h3.5" />
    </>
  ),
  quiz: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M9.5 9.6a2.5 2.5 0 114 2c-.9.6-1.5 1.1-1.5 2.1v.4M12 17.2v.1" />
    </>
  ),
  binary: (
    <>
      <rect x="4" y="4" width="5" height="7" rx="2.5" />
      <path d="M13.5 5.5L15.5 4v7M13.5 11h4" />
      <circle cx="5" cy="17" r="1" />
      <path d="M9 17h4M16.5 17h3.5" />
    </>
  ),
  scheduler: (
    <>
      <rect x="4" y="4.5" width="11" height="3.5" rx="1" />
      <rect x="4" y="10.3" width="8" height="3.5" rx="1" />
      <rect x="4" y="16" width="14" height="3.5" rx="1" />
      <path d="M19 5v6.5l1.5 1.5" />
    </>
  ),
  filesystem: (
    <>
      <rect x="9" y="3.5" width="6" height="4" rx="1" />
      <rect x="3.5" y="16.5" width="6" height="4" rx="1" />
      <rect x="14.5" y="16.5" width="6" height="4" rx="1" />
      <path d="M12 7.5v4.5M6.5 16.5V12h11v4.5" />
    </>
  ),
  snake: (
    <>
      <path d="M4 18.5h8.5a3 3 0 000-6h-4a3 3 0 010-6H17" />
      <circle cx="18.5" cy="6.5" r="1.5" />
      <rect x="16.5" y="15.5" width="3" height="3" rx=".5" />
    </>
  ),
  paint: (
    <>
      <path d="M14.5 4.5l5 5-8 8-5-5z" />
      <path d="M6.5 12.5c-2 .5-3 2.2-3 4.5v2.5H6c2.3 0 4-1 4.5-3" />
    </>
  ),
  'network-tools': (
    <>
      <rect x="3.5" y="12" width="17" height="6.5" rx="1.5" />
      <path d="M7 15.3h2M8.5 9a5 5 0 017 0M6 6.5a8.5 8.5 0 0112 0" />
    </>
  ),
  'time-machine': (
    <>
      <path d="M4.5 12a7.5 7.5 0 102.2-5.3" />
      <path d="M4.5 4v3.5H8M12 8v4.5l3 2" />
    </>
  ),
};

export function AppGlyph({ appId, className }: { appId: AppId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[appId]}
    </svg>
  );
}

/** The padlock laid over a locked app's glyph. */
export function LockGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M5 7V5a3 3 0 016 0v2h1.2c.4 0 .8.4.8.8v6.4c0 .4-.4.8-.8.8H3.8a.8.8 0 01-.8-.8V7.8c0-.4.4-.8.8-.8zm1.5 0h3V5a1.5 1.5 0 00-3 0z" />
    </svg>
  );
}
