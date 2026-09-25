'use client';

import { useId, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import { EraTitle } from '@/components/journey/eras/EraTitle';
import { asStringList } from '@/lib/message-shapes';
import {
  ICON_DISK,
  ICON_DOCUMENT,
  ICON_FOLDER,
  ICON_NETWORK,
  ICON_TRASH,
  MENU_GLYPH,
  POINTER,
  bitmapPath,
  type Bitmap,
} from '@/lib/pixel-art';

/**
 * The screen's logical resolution. Everything inside is authored on this integer
 * grid and the SVG is drawn at exactly 1x (320px) or 2x (640px) of it, never a
 * fractional scale, so 1-bit pixels stay square and sharp.
 */
const W = 320;
const H = 214;
const MENU_H = 12;

/** Where things sit on the 320x214 grid. */
const MENU_X = [22, 76, 170] as const;
const DROPDOWN = { x: 20, y: MENU_H, w: 88, rowH: 12 } as const;
// Labels are 8px per character, so slots are 72px apart: "Projekte" and
// "Netzwerk" are 64px wide and must clear each other and the scroll bar.
const WINDOW = { x: 30, y: 56, w: 236, h: 120, titleH: 13 } as const;
const ICON_SLOTS = [32, 104, 176] as const;
const SELECTED_ICON = 2;

/**
 * Pointer choreography, in era progress:
 *   0.14-0.32  enters from the bottom right and travels to the first menu
 *   0.36-0.46  runs down the open menu to the second item
 *   0.64-0.80  crosses the new window to the network icon
 * Coordinates are the hotspot, on the 320x214 grid.
 */
const POINTER_PATH = {
  '--x0': 336, '--y0': 236,
  '--x1': MENU_X[0] + 6, '--y1': 6,
  '--x2': MENU_X[0] + 16, '--y2': MENU_H + DROPDOWN.rowH + 6,
  '--x3': WINDOW.x + ICON_SLOTS[SELECTED_ICON] + 8, '--y3': WINDOW.y + 44,
  '--t0': 0.14, '--t1': 0.32,
  '--t2': 0.36, '--t3': 0.46,
  '--t4': 0.64, '--t5': 0.8,
} as CSSProperties;

/**
 * 1984 - the Apple Macintosh. The second pivot of the journey: the first mouse
 * pointer. Everything before this was typed.
 *
 * The 1981 amber screen hands over to a black screen whose lights come on into
 * a white, 1-bit desktop. Then the pointer enters - marked by a ring, and a
 * caption - pulls down a menu, chooses Open, and a window zooms out of the
 * Finder's zoom rectangles. The pointer finally selects an icon.
 *
 * All of it is SVG on a 320x214 grid, shaded only with dither patterns, and all
 * of it is a pure function of --era-progress.
 */
export function EraMac({ headingId }: { headingId: string }) {
  const t = useTranslations('eras.macintosh');
  const menu = asStringList(t.raw('visual.menu'));
  const menuItems = asStringList(t.raw('visual.menuItems'));
  const icons = asStringList(t.raw('visual.icons'));
  const desktopIcons = asStringList(t.raw('visual.desktopIcons'));

  return (
    <div className="ao-era-exit ao-final-frame relative flex min-h-[calc(var(--ao-vh)*100)] w-full flex-col bg-background md:h-full">
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-8 px-5 pt-20 pb-14 sm:px-10 md:pe-28 md:py-0 lg:flex-row lg:items-center lg:gap-12">
        <EraTitle
          year="1984"
          title={t('name')}
          headingId={headingId}
          className="lg:w-[34%]"
          // Press Start 2P is a full em per character; "Macintosh" at the shared
          // size broke mid-word.
          titleClassName="text-lg leading-snug sm:text-xl lg:text-xl"
        >
          <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-ink sm:text-base">
            {t('visual.body')}
          </p>
        </EraTitle>

        <div className="ao-sr-only">
          <p>{menu.join(', ')}</p>
          <p>{menuItems.join(', ')}</p>
          <p>{t('visual.windowTitle')}</p>
          <p>{[...icons, ...desktopIcons].join(', ')}</p>
        </div>

        <figure className="ao-depth-mid flex flex-col items-center gap-4 lg:flex-1">
          <div className="ao-mac-case p-3 sm:p-4">
            <div className="ao-mac-screen relative">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                // 1x on phones and small laptops, exactly 2x from xl up.
                className="ao-pixelated block h-auto w-[320px] xl:w-[640px]"
                role="img"
                aria-label={t('visual.screenLabel')}
              >
                <MacScreen
                  menu={menu}
                  menuItems={menuItems}
                  windowTitle={t('visual.windowTitle')}
                  icons={icons}
                  desktopIcons={desktopIcons}
                />
              </svg>

              {/* Lights on: black over the screen, draining away. The border token is
                  black in 1984 and a dark amber while 1981's theme is still
                  handing over - the old screen showing through as it goes. */}
              <div
                className="ao-mac-lights pointer-events-none absolute inset-0 bg-edge"
                aria-hidden="true"
              />
            </div>
          </div>

          <figcaption className="ao-mac-caption ao-rm-show text-center font-display text-[10px] leading-relaxed text-ink sm:text-xs">
            {t('visual.pointerCaption')}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

interface MacScreenProps {
  menu: string[];
  menuItems: string[];
  windowTitle: string;
  icons: string[];
  desktopIcons: string[];
}

const WHITE = 'var(--ao-color-surface)';
const BLACK = 'var(--ao-color-border)';

/**
 * The screen contents, reusable: the Convergence draws a miniature of this.
 * `animate` false renders the finished arrangement with no cues, for that use.
 */
export function MacScreen({
  menu,
  menuItems,
  windowTitle,
  icons,
  desktopIcons,
  animate = true,
}: MacScreenProps & { animate?: boolean }) {
  const cue = (on: number, off = 2): CSSProperties =>
    ({ '--on': on, '--off': off }) as CSSProperties;
  const cueClass = animate ? 'ao-cue' : undefined;
  // Pattern ids must be unique per page: the Convergence draws this screen too.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const dither = `${uid}-dither`;
  const stripes = `${uid}-stripes`;

  return (
    // direction ltr: the screen is a physical, left-anchored layout. Inherited
    // rtl on the Persian page would make every label's x its right edge, and
    // the menu and icon labels spilled out of their boxes. Persian glyphs still
    // shape right to left inside each label.
    <g fontFamily="var(--ao-font-pixel)" fontSize="8" direction="ltr">
      <defs>
        {/* 50% dither: the only "grey" 1-bit graphics allow. */}
        <pattern id={dither} width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill={WHITE} />
          <rect width="1" height="1" fill={BLACK} />
          <rect x="1" y="1" width="1" height="1" fill={BLACK} />
        </pattern>
        {/* Title-bar stripes: alternating black and white rows. */}
        <pattern id={stripes} width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="1" fill={BLACK} />
          <rect y="1" width="2" height="1" fill={WHITE} />
        </pattern>
      </defs>

      {/* Desktop */}
      <rect width={W} height={H} fill={`url(#${dither})`} />

      {/* Desktop icons down the right edge, as the Finder placed them. x=268
          keeps the 80px "Papierkorb" label inside the 320px screen. */}
      <DesktopIcon bitmap={ICON_DISK} x={268} y={16} label={desktopIcons[0] ?? ''} />
      <DesktopIcon bitmap={ICON_TRASH} x={268} y={176} label={desktopIcons[1] ?? ''} />

      {/* Menu bar */}
      <rect width={W} height={MENU_H} fill={WHITE} />
      <rect y={MENU_H - 1} width={W} height="1" fill={BLACK} />
      <path d={bitmapPath(MENU_GLYPH, 'X', 8, 2)} fill={BLACK} />
      {menu.map((label, index) => (
        <text key={label} x={MENU_X[index]} y={9} fill={BLACK}>
          {label}
        </text>
      ))}

      {animate && (
        <>
          {/* The first menu title inverts while its menu is down. */}
          <g className={cueClass} style={cue(0.32, 0.52)} aria-hidden="true">
            <rect x={MENU_X[0] - 3} y={0} width={menu[0] ? menu[0].length * 8 + 6 : 0} height={MENU_H - 1} fill={BLACK} />
            <text x={MENU_X[0]} y={9} fill={WHITE}>
              {menu[0]}
            </text>
          </g>

          {/* The pull-down menu, with its drop shadow. */}
          <g className={`${cueClass} ao-rm-show`} style={cue(0.33, 0.52)}>
            <rect
              x={DROPDOWN.x + 1}
              y={DROPDOWN.y + 1}
              width={DROPDOWN.w}
              height={menuItems.length * DROPDOWN.rowH + 4}
              fill={BLACK}
            />
            <rect
              x={DROPDOWN.x}
              y={DROPDOWN.y}
              width={DROPDOWN.w}
              height={menuItems.length * DROPDOWN.rowH + 4}
              fill={WHITE}
              stroke={BLACK}
            />
            {menuItems.map((label, index) => (
              <text key={label} x={DROPDOWN.x + 8} y={DROPDOWN.y + 11 + index * DROPDOWN.rowH} fill={BLACK}>
                {label}
              </text>
            ))}
            {/* Second item highlighted as the pointer lands on it. */}
            <g className={cueClass} style={cue(0.45, 0.52)} aria-hidden="true">
              <rect
                x={DROPDOWN.x + 1}
                y={DROPDOWN.y + 3 + DROPDOWN.rowH}
                width={DROPDOWN.w - 2}
                height={DROPDOWN.rowH}
                fill={BLACK}
              />
              <text x={DROPDOWN.x + 8} y={DROPDOWN.y + 11 + DROPDOWN.rowH} fill={WHITE}>
                {menuItems[1]}
              </text>
            </g>
          </g>

          {/* Zoom rectangles: dotted outlines stepping out toward the window. */}
          {[0.25, 0.5, 0.75].map((size, index) => (
            <rect
              key={size}
              className={cueClass}
              style={cue(0.53 + index * 0.017, 0.58 + index * 0.017)}
              x={WINDOW.x + 4}
              y={WINDOW.y}
              width={WINDOW.w * size}
              height={WINDOW.h * size}
              fill="none"
              stroke={BLACK}
              strokeDasharray="2 2"
            />
          ))}
        </>
      )}

      {/* The window */}
      <g className={animate ? 'ao-mac-window' : undefined}>
        <rect x={WINDOW.x + 2} y={WINDOW.y + 2} width={WINDOW.w} height={WINDOW.h} fill={BLACK} />
        <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} fill={WHITE} stroke={BLACK} />
        <rect x={WINDOW.x + 2} y={WINDOW.y + 3} width={WINDOW.w - 4} height={WINDOW.titleH - 6} fill={`url(#${stripes})`} />
        <rect x={WINDOW.x} y={WINDOW.y + WINDOW.titleH} width={WINDOW.w} height="1" fill={BLACK} />
        {/* Close box, with white clearance around it on the stripes. */}
        <rect x={WINDOW.x + 7} y={WINDOW.y + 2} width="11" height="9" fill={WHITE} />
        <rect x={WINDOW.x + 8} y={WINDOW.y + 2} width="9" height="9" fill={WHITE} stroke={BLACK} />
        {/* Title, on a white plate cut out of the stripes. */}
        <rect
          x={WINDOW.x + WINDOW.w / 2 - windowTitle.length * 4 - 5}
          y={WINDOW.y + 1}
          width={windowTitle.length * 8 + 10}
          height={WINDOW.titleH - 2}
          fill={WHITE}
        />
        <text x={WINDOW.x + WINDOW.w / 2} y={WINDOW.y + 10} fill={BLACK} textAnchor="middle">
          {windowTitle}
        </text>

        {[ICON_DOCUMENT, ICON_FOLDER, ICON_NETWORK].map((bitmap, index) => (
          <WindowIcon
            key={index}
            bitmap={bitmap}
            x={WINDOW.x + ICON_SLOTS[index]}
            y={WINDOW.y + 36}
            label={icons[index] ?? ''}
            selectedCue={animate && index === SELECTED_ICON ? cue(0.8) : undefined}
          />
        ))}

        {/* Scroll-bar edge, dithered. */}
        <rect x={WINDOW.x + WINDOW.w - 12} y={WINDOW.y + WINDOW.titleH + 1} width="11" height={WINDOW.h - WINDOW.titleH - 2} fill={`url(#${dither})`} />
        <rect x={WINDOW.x + WINDOW.w - 13} y={WINDOW.y + WINDOW.titleH} width="1" height={WINDOW.h - WINDOW.titleH} fill={BLACK} />
      </g>

      {/* The pointer, and the ring that announces its arrival. */}
      <g className={animate ? 'ao-path' : undefined} style={animate ? POINTER_PATH : ({ transform: `translate(${WINDOW.x + ICON_SLOTS[SELECTED_ICON] + 8}px, ${WINDOW.y + 44}px)` } as CSSProperties)}>
        {animate && (
          <circle className="ao-mac-spot" cx="4" cy="6" r="14" fill="none" stroke={BLACK} strokeWidth="2" />
        )}
        <path d={bitmapPath(POINTER, 'o')} fill={WHITE} />
        <path d={bitmapPath(POINTER, 'X')} fill={BLACK} />
      </g>
    </g>
  );
}

function DesktopIcon({ bitmap, x, y, label }: { bitmap: Bitmap; x: number; y: number; label: string }) {
  return (
    <g>
      <path d={bitmapPath(bitmap, 'o', x, y)} fill={WHITE} />
      <path d={bitmapPath(bitmap, 'X', x, y)} fill={BLACK} />
      <rect x={x + 8 - label.length * 4 - 1} y={y + 18} width={label.length * 8 + 2} height="10" fill={WHITE} />
      <text x={x + 8} y={y + 26} fill={BLACK} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function WindowIcon({
  bitmap,
  x,
  y,
  label,
  selectedCue,
}: {
  bitmap: Bitmap;
  x: number;
  y: number;
  label: string;
  selectedCue?: CSSProperties;
}) {
  return (
    <g>
      <path d={bitmapPath(bitmap, 'X', x, y)} fill={BLACK} />
      <text x={x + 8} y={y + 28} fill={BLACK} textAnchor="middle">
        {label}
      </text>

      {/* Selection inverts the icon and its label, as the Finder did. */}
      {selectedCue && (
        <g className="ao-cue" style={selectedCue} aria-hidden="true">
          <path d={bitmapPath(bitmap, 'X', x, y)} fill={BLACK} />
          <path d={bitmapPath(bitmap, 'o', x, y)} fill={BLACK} />
          <rect x={x + 8 - label.length * 4 - 2} y={y + 20} width={label.length * 8 + 4} height="10" fill={BLACK} />
          <text x={x + 8} y={y + 28} fill={WHITE} textAnchor="middle">
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
