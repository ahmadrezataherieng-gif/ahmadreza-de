'use client';

import { useId, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import { EraTitle } from '@/components/journey/eras/EraTitle';
import { asStatList } from '@/lib/message-shapes';
import { CARD_COLUMNS, CARD_ROWS, encodeCard, rowIndex } from '@/lib/punch-card';

/** What the holes in the card actually spell. Encoded, not drawn. */
// CONTENT-TODO CR-113
const CARD_TEXT = 'AHMADREZA TAHERI';

/** Vertical distance between card rows, in columns. */
const ROW_PITCH = 2.4;

const LAMP_COUNT = 120;
const LAMPS_PER_ROW = 20;

/**
 * 1946 - ENIAC.
 *
 * The defining fact of this era is that there is no screen. The visitor is
 * looking at a machine: a dark metal cabinet, rows of vacuum-tube lamps, toggle
 * switches and patch cables. Everything is CSS or SVG - no raster asset, so it
 * stays crisp at any resolution and inherits the theme tokens.
 *
 * The 120 lamps pulse on independent cycles driven entirely by per-lamp
 * animation-delay and animation-duration. 120 JS intervals would be a
 * performance disaster; this costs nothing after first paint.
 */
export function EraEniac({ headingId }: { headingId: string }) {
  const t = useTranslations('eras.eniac');
  const stats = asStatList(t.raw('visual.stats'));
  const columns = encodeCard(CARD_TEXT);

  return (
    <div className="ao-era-exit relative flex min-h-dvh w-full flex-col md:h-full">
      <MetalPanel />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-7 px-5 pt-20 pb-14 sm:px-10 md:pe-28 md:pt-16 md:pb-10 lg:flex-row lg:items-center lg:gap-12">
        {/* --- text column --- */}
        <div className="flex w-full flex-col gap-5 lg:w-[42%]">
          <EraTitle year="1946" title={t('name')} headingId={headingId} />

          <dl className="flex flex-wrap gap-x-7 gap-y-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="ao-glow font-display text-xl text-accent tabular-nums sm:text-2xl">
                  {stat.value}
                </dd>
                <dd className="font-mono text-[10px] tracking-wide text-muted uppercase sm:text-xs">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <p className="max-w-prose font-body text-sm leading-relaxed text-muted sm:text-base">
            {t('visual.body')}
          </p>
        </div>

        {/* --- machine column --- */}
        <div className="flex w-full flex-col gap-6 lg:w-[58%]">
          <LampPanel label={t('visual.panelLabel')} />

          <figure className="ao-depth-mid flex flex-col gap-2">
            <PunchCard columns={columns} label={t('visual.cardLabel')} />
            <figcaption className="font-mono text-[10px] tracking-wide text-muted sm:text-xs">
              {t('visual.cardCaption', { text: CARD_TEXT })}
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}

/**
 * Brushed metal: a fine repeating gradient for the grain plus a coarser one for
 * the milled panel seams. Two gradients, no image.
 */
function MetalPanel() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-background" aria-hidden="true">
      <div className="ao-metal-grain absolute inset-0 opacity-70" />
      <div className="ao-metal-seams absolute inset-0 opacity-50" />
      <div className="ao-metal-pool absolute inset-0" />
    </div>
  );
}

/**
 * The lamp bank, plus toggle switches and patch cables.
 *
 * Mobile keeps the first three rows. The extras are removed with `display: none`
 * rather than not rendered, so the markup is identical on server and client and
 * the hidden lamps cost nothing to paint.
 */
function LampPanel({ label }: { label: string }) {
  return (
    <div
      className="ao-themed relative rounded-window border border-edge bg-surface/70 p-4 shadow-window sm:p-5"
      role="img"
      aria-label={label}
    >
      <div className="ao-lamp-grid grid grid-cols-10 gap-2 sm:grid-cols-[repeat(20,minmax(0,1fr))] sm:gap-1.5">
        {Array.from({ length: LAMP_COUNT }, (_, index) => {
          const row = Math.floor(index / LAMPS_PER_ROW);
          // Deterministic spread of phase and speed, so no two neighbours
          // breathe together and nothing depends on Math.random.
          const duration = 1.2 + ((index * 37) % 23) / 10;
          const delay = ((index * 53) % 41) / 10;

          return (
            <span
              key={index}
              className={
                row >= 3
                  ? 'ao-lamp hidden h-2 w-2 sm:block sm:h-1.5 sm:w-1.5'
                  : 'ao-lamp h-2 w-2 sm:h-1.5 sm:w-1.5'
              }
              style={
                {
                  '--lamp-duration': `${duration}s`,
                  '--lamp-delay': `${delay}s`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>

      <MachineControls />
    </div>
  );
}

/** Toggle switches and patch cables, as one crisp SVG. */
function MachineControls() {
  return (
    <svg
      viewBox="0 0 320 54"
      className="mt-4 w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* Patch cables: bezier curves between two panel sockets. */}
      <g fill="none" strokeLinecap="round">
        <path
          d="M24 46 C 70 6, 130 6, 176 44"
          stroke="var(--ao-color-accent-muted)"
          strokeWidth="3"
          opacity="0.75"
        />
        <path
          d="M52 46 C 110 14, 190 58, 258 30"
          stroke="var(--ao-color-error)"
          strokeWidth="3"
          opacity="0.6"
        />
        <path
          d="M96 46 C 150 22, 220 8, 296 40"
          stroke="var(--ao-color-warning)"
          strokeWidth="2.5"
          opacity="0.5"
        />
      </g>

      {/* Chunky toggle switches: a plate, a bat handle, a highlight. */}
      {[132, 178, 224, 270].map((x, index) => (
        <g key={x}>
          <rect
            x={x}
            y="30"
            width="18"
            height="20"
            rx="2"
            fill="var(--ao-color-surface-elevated)"
            stroke="var(--ao-color-border)"
          />
          <rect
            x={x + 7}
            y={index % 2 === 0 ? 20 : 34}
            width="4"
            height="14"
            rx="2"
            fill="var(--ao-color-text-muted)"
          />
          <circle
            cx={x + 9}
            cy={index % 2 === 0 ? 20 : 48}
            r="2.5"
            fill="var(--ao-color-accent)"
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * A real IBM 80-column card, drawn at the true 7 3/8 x 3 1/4 inch proportion
 * (2.27:1) with the corner cut on the top left, as the originals had.
 *
 * It slides in from the right as the era scrubs: transform only, so it stays on
 * the compositor.
 */
function PunchCard({
  columns,
  label,
}: {
  columns: ReturnType<typeof encodeCard>;
  label: string;
}) {
  // 1 unit = 1 column. Height picked to hold 12 rows at the real aspect ratio.
  const width = CARD_COLUMNS;
  const height = 35;
  const rowY = (rowLabel: number) => 5.5 + rowIndex(rowLabel) * ROW_PITCH;
  const gridId = `${useId().replace(/[^a-zA-Z0-9]/g, '')}-card-grid`;

  return (
    // Phones crop to the first 40 columns at twice the size. The name is punched
    // in columns 1-16, and at full width a column is four pixels wide - the
    // holes stop reading as holes. The card is a physical LTR object, so the
    // crop always keeps its left edge, in Persian too.
    <div dir="ltr" className="ao-card-slide w-full overflow-hidden sm:overflow-visible">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="ao-themed w-[200%] max-w-none sm:w-full"
        role="img"
        aria-label={label}
      >
        {/* Card stock, with the classic clipped top-left corner. */}
        <path
          d={`M3 0 H${width} V${height} H0 V3 Z`}
          fill="var(--ao-color-surface-elevated)"
          stroke="var(--ao-color-border)"
          strokeWidth="0.35"
        />

        {/* The characters the operator keyed, printed along the top edge. */}
        <g
          fill="var(--ao-color-text-muted)"
          fontSize="1.9"
          fontFamily="var(--ao-font-mono)"
          textAnchor="middle"
        >
          {columns.map((column) => (
            <text key={column.column} x={column.column - 0.5} y="3.4">
              {column.character === ' ' ? '' : column.character}
            </text>
          ))}
        </g>

        {/* Unpunched positions: the faint printed digit grid. One pattern tile
            per column and row pitch, not 960 separate rects - the page's HTML
            weight is a tracked budget, and this grid alone was ~45 kB of it. */}
        <defs>
          <pattern id={gridId} x="0" y={rowY(CARD_ROWS[0])} width="1" height={ROW_PITCH} patternUnits="userSpaceOnUse">
            <rect x="0.3" y="0" width="0.4" height="1.5" fill="var(--ao-color-border)" />
          </pattern>
        </defs>
        <rect
          x="0"
          y={rowY(CARD_ROWS[0])}
          width={CARD_COLUMNS}
          height={CARD_ROWS.length * ROW_PITCH}
          fill={`url(#${gridId})`}
          opacity="0.45"
        />

        {/* Punched holes: rectangular, as a keypunch cut them. */}
        <g fill="var(--ao-color-background)">
          {columns.flatMap((column) =>
            column.rows.map((rowLabel) => (
              <rect
                key={`${column.column}-${rowLabel}`}
                x={column.column - 0.82}
                y={rowY(rowLabel)}
                width="0.62"
                height="1.7"
                rx="0.1"
              />
            )),
          )}
        </g>
      </svg>
    </div>
  );
}
