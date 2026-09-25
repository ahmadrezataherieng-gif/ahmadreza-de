// The one icon set of the site's own pages and the coming-soon page (BR-09,
// DECISIONS 75). Every icon sits on a 24 px grid and is drawn with strokes only
// (plus a few filled dots); the stroke width, joins and colours come from
// illustrations.css, so an icon looks the same wherever it appears. A part
// without a tone takes the icon's own colour (currentColor, set by the parent);
// a toned part is one of the palette's signal colours.
//
// Plain data with no imports: the React <Icon> renders it on the site, and
// scripts/soon-pages.mjs renders it as a string into the static coming-soon
// pages (Node strips the types when it imports this file).

export type IconTone = 'cyan' | 'mint' | 'amber';

export interface IconPart {
  readonly d: string;
  readonly tone?: IconTone;
  /** A filled dot rather than a stroke. */
  readonly fill?: boolean;
}

// A dot of radius r at (x, y), as a path.
const dot = (x: number, y: number, r = 1) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const ICONS = {
  // History: an hourglass, time running through.
  history: [
    { d: 'M6.5 3.5h11M6.5 20.5h11' },
    { d: 'M8 3.5c0 4.2 4 5.3 4 8.5s-4 4.3-4 8.5M16 3.5c0 4.2-4 5.3-4 8.5s4 4.3 4 8.5' },
    { d: 'M9.5 18.5c.8-1.3 1.6-2 2.5-2s1.7.7 2.5 2z', tone: 'amber' },
  ],
  puzzle: [
    { d: 'M4 8.5h4.2a2 2 0 1 1 3.6 0H16v4.2a2 2 0 1 1 0 3.6V20.5H4z' },
    { d: dot(8.5, 15.5, 1.1), tone: 'amber', fill: true },
  ],
  // A window of an operating system: title bar with its buttons.
  window: [
    { d: 'M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5zM3.5 8.5h17' },
    { d: dot(6.3, 6.5, 0.8), tone: 'amber', fill: true },
    { d: dot(8.8, 6.5, 0.8), fill: true },
    { d: 'M7 12.5h6M7 15.5h4', tone: 'mint' },
  ],
  // From one place to another: a start, a dashed way, a pin (Tehran to Trier).
  route: [
    { d: dot(5.5, 18, 1.8) },
    { d: 'M7.5 17.2c3.5-.8 3-5.2 6.5-6.7', tone: 'amber' },
    { d: 'M18 13.5s-3.3-3-3.3-5.5a3.3 3.3 0 0 1 6.6 0c0 2.5-3.3 5.5-3.3 5.5z' },
    { d: dot(18, 8, 0.9), tone: 'mint', fill: true },
  ],
  network: [
    { d: `${dot(12, 5, 2)}${dot(5, 18.5, 2)}${dot(19, 18.5, 2)}` },
    { d: 'M10.9 6.7 6.1 16.8M13.1 6.7l4.8 10.1M7 18.5h10', tone: 'mint' },
  ],
  terminal: [
    { d: 'M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5z' },
    { d: 'm7.5 9.5 3 2.5-3 2.5', tone: 'mint' },
    { d: 'M12.5 15h4', tone: 'amber' },
  ],
  chip: [
    { d: 'M8 6.5h8A1.5 1.5 0 0 1 17.5 8v8a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 16V8A1.5 1.5 0 0 1 8 6.5z' },
    { d: 'M10 3.5v3M14 3.5v3M10 17.5v3M14 17.5v3M3.5 10h3M3.5 14h3M17.5 10h3M17.5 14h3' },
    { d: 'M10 10h4v4h-4z', tone: 'amber' },
  ],
  shield: [
    { d: 'M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z' },
    { d: 'm9 12 2 2 4-4', tone: 'mint' },
  ],
  search: [
    { d: `${dot(10.5, 10.5, 6)}M15 15l5 5` },
    { d: 'M7.8 10.5a2.7 2.7 0 0 1 2.7-2.7', tone: 'amber' },
  ],
  rocket: [
    { d: 'M12 3c3 2 4.5 5.2 4.5 8.7L14.5 16h-5l-2-4.3C7.5 8.2 9 5 12 3z' },
    { d: dot(12, 9.5, 1.5), tone: 'mint' },
    { d: 'M9 13.5 6 15.5l1 3 2.5-1.5M15 13.5l3 2-1 3-2.5-1.5' },
    { d: 'M11 18.5l1 2.5 1-2.5', tone: 'amber' },
  ],
  // Support: a headset.
  support: [
    { d: 'M5 13.5V12a7 7 0 0 1 14 0v1.5' },
    { d: 'M4 13.5h3v5H5a1 1 0 0 1-1-1zM20 13.5h-3v5h2a1 1 0 0 0 1-1z' },
    { d: 'M18.5 18.5c0 1.4-1.6 2.2-4.5 2.2', tone: 'amber' },
  ],
  languages: [
    { d: 'M4.5 4.5h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3 2.5v-2.5H4.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z' },
    { d: 'M17.5 9h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1.5v2.5L15 17h-4a1 1 0 0 1-1-1v-1', tone: 'mint' },
  ],
  pin: [
    { d: 'M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z' },
    { d: dot(12, 11, 2), tone: 'amber' },
  ],
  // A server: two stacked units with their status lights.
  server: [
    { d: 'M5 4.5h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zM5 13.5h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z' },
    { d: `${dot(7.5, 7.5, 0.9)}${dot(7.5, 16.5, 0.9)}`, tone: 'mint', fill: true },
    { d: 'M11 7.5h5.5M11 16.5h5.5' },
  ],
  play: [
    { d: dot(12, 12, 8.5) },
    { d: 'M10 8.5v7l5.5-3.5z', tone: 'amber' },
  ],
  // The mouse pointer: doing it yourself.
  pointer: [
    { d: 'M6 3.5v14.5l3.8-3.6 2.6 5.8 2.6-1.2-2.6-5.7 5.3-.3z' },
    { d: 'M16.5 4.5l1.5-1.5M18.5 8h2', tone: 'amber' },
  ],
  // A light bulb: the "Did you know?" snippets.
  bulb: [
    { d: 'M9.5 17.5h5M10.5 20.5h3' },
    { d: 'M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3.5z', tone: 'amber' },
  ],
} as const satisfies Record<string, readonly IconPart[]>;

export type IconName = keyof typeof ICONS;

/** The icon as SVG markup, for the static coming-soon pages. Decorative: always aria-hidden. */
export function iconSvg(name: IconName, className = ''): string {
  const parts: readonly IconPart[] = ICONS[name];
  const paths = parts
    .map((part) => {
      const classes = [part.tone ? `t-${part.tone}` : '', part.fill ? 'fill' : ''].filter(Boolean).join(' ');
      return `<path${classes ? ` class="${classes}"` : ''} d="${part.d}"/>`;
    })
    .join('');
  return `<svg class="ill ill-icon${className ? ` ${className}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}
