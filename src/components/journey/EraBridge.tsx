import type { ReactNode } from 'react';

import type { EraId } from '@/content/eras';
import type { ThemeId } from '@/lib/themes';
import { bitmapPath, bitmapWidth, POINTER } from '@/lib/pixel-art';
import { CrossingTechLayer, TechList, techStyle } from '@/components/journey/tech/CrossingTech';
import { crossingTech } from '@/content/crossings';

/** The seven crossings, each named by the era it leaves. */
export type BridgeKind = EraId;

interface EraBridgeProps {
  kind: BridgeKind;
  /** The theme of the era being left, for the parts that still belong to it. */
  fromTheme: ThemeId;
  /** The theme of the era being entered. */
  toTheme: ThemeId;
}

/** Machine text on the 1981 screen. Identical in every language. */
// CONTENT-TODO CR-212
const DOS_PROMPT = 'C:\\>';

/**
 * The crossing between two eras (DECISIONS.md 45).
 *
 * One continuous morph per boundary, in which the last object of the era being
 * left becomes the first object of the era being entered: a card feeds into a
 * reader and paper prints out; paper curls into CRT glass; green phosphor cools
 * to amber and the camera pulls back to an IBM PC; a prompt shrinks into a
 * window as the lights come up; a 1-bit desktop gains colour depth and bevels;
 * a dial-up progress bar streams out as light over fibre.
 *
 * Every part is a function of `--boundary-in` (0..1), written by the journey's
 * resolver on the entering section. Parts carry their own era's palette through
 * `data-theme-scope`, because both eras are on screen at once.
 *
 * Wide screens: an overlay inside the pinned stage, over both eras. Phones: a
 * sticky band with its own scroll distance before the era. Reduced motion: not
 * rendered at all. Decorative throughout, so hidden from assistive tech.
 */
export function EraBridge({ kind, fromTheme, toTheme }: EraBridgeProps) {
  const from = (node: ReactNode) => <div data-theme-scope={fromTheme} className="contents">{node}</div>;
  const to = (node: ReactNode) => <div data-theme-scope={toTheme} className="contents">{node}</div>;

  const shots = crossingTech[kind]?.length;

  return (
    <>
    <div
      className="ao-bridge"
      data-bridge-band=""
      data-bridge={kind}
      data-shots={shots}
      style={techStyle(kind)}
      aria-hidden="true"
    >
      <div className="ao-bridge-panel">
        <div data-theme-scope={fromTheme} className="ao-bridge-veil ao-bridge-veil--from" />
        <div data-theme-scope={toTheme} className="ao-bridge-veil ao-bridge-veil--to" />
        {/* Anything that is a whole screen in its era - a desktop, light over
            fibre - spans the panel; objects live in the square stage, where one
            set of per-cent coordinates holds at any aspect ratio. */}
        <div className="ao-bridge-wide">{WIDE[kind]?.(from, to)}</div>
        <div className="ao-bridge-art">{ART[kind](from, to)}</div>
        <CrossingTechLayer kind={kind} fromTheme={fromTheme} toTheme={toTheme} />
      </div>
    </div>
    <TechList kind={kind} />
    </>
  );
}

type Scope = (node: ReactNode) => ReactNode;

/** Parts that fill the screen rather than sit in the square stage. */
const WIDE: Partial<Record<BridgeKind, (from: Scope, to: Scope) => ReactNode>> = {
  macintosh: (_from, to) => (
    <div className="ao-part b5-desk">
      <div className="ao-part b5-mono" />
      <div className="ao-part b5-sixteen" />
      {to(<div className="ao-part b5-teal" />)}
    </div>
  ),
  win95: (_from, to) =>
    to(
      <>
        <svg className="ao-part b6-fibre" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M-5 42C25 30 45 58 105 40" />
          <path d="M-5 50C30 46 60 62 105 52" />
          <path d="M-5 58C20 70 55 44 105 62" />
        </svg>
        <div className="ao-part b6-streams">
          <span className="ao-part b6-stream" />
          <span className="ao-part b6-stream b6-stream--2" />
          <span className="ao-part b6-stream b6-stream--3" />
          <span className="ao-part b6-stream b6-stream--4" />
        </div>
      </>,
    ),
};

const ART: Record<BridgeKind, (from: Scope, to: Scope) => ReactNode> = {
  /* 1946 -> 1956: the card feeds into a reader, the camera dives in after it,
     and printed paper rises out of the teletype. */
  eniac: (from, to) => (
    <>
      {from(
        <div className="ao-part b1-zoom">
          <div className="ao-part b1-feed">
            <div className="ao-part b1-card" />
          </div>
          <div className="ao-part b1-reader">
            <span className="ao-part b1-slot" />
            <span className="ao-part b1-lamp" />
            <span className="ao-part b1-lamp b1-lamp--2" />
          </div>
        </div>,
      )}
      {to(
        <div className="ao-part b1-teletype">
          <div className="ao-part b1-exit">
            <div className="ao-part b1-paper" />
          </div>
          <div className="ao-part b1-platen" />
        </div>,
      )}
    </>
  ),

  /* 1956 -> 1971: the paper curls back into the glass of a CRT, its black ink
     giving way to green phosphor. */
  batch: (from, to) => (
    <>
      {to(<div className="ao-part b2-glass" />)}
      {from(
        <div className="ao-part b2-sheet">
          <div className="ao-part b2-paper" />
          <div className="ao-part b2-ink" />
        </div>,
      )}
      {to(
        <>
          <div className="ao-part b2-phosphor" />
          <div className="ao-part b2-bezel" />
        </>,
      )}
    </>
  ),

  /* 1971 -> 1981: the same monitor, its phosphor cooling from green to amber,
     while the camera pulls back to the IBM PC underneath it. */
  unix: (from, to) => (
    <div className="ao-part b3-rig">
      {to(
        <>
          <div className="ao-part b3-unit">
            <span className="ao-part b3-drive" />
            <span className="ao-part b3-drive b3-drive--2" />
          </div>
          <div className="ao-part b3-keyboard" />
        </>,
      )}
      {from(
        <div className="ao-part b3-monitor">
          <div className="ao-part b3-green" />
        </div>,
      )}
      {to(<div className="ao-part b3-amber" />)}
    </div>
  ),

  /* 1981 -> 1984: the prompt shrinks into a window, the lights come up grey,
     and the first pointer arrives. */
  dos: (from, to) => (
    <>
      {from(
        <div className="ao-part b4-screen">
          <span className="ao-part b4-prompt" dir="ltr">
            {DOS_PROMPT}
            <span className="b4-cursor" />
          </span>
        </div>,
      )}
      {to(
        <>
          <div className="ao-part b4-window">
            <div className="ao-part b4-title" />
            <span className="ao-part b4-text" dir="ltr">
              {DOS_PROMPT}
            </span>
          </div>
          <div className="ao-part b4-pointer">
            <svg
              viewBox={`0 0 ${bitmapWidth(POINTER)} ${POINTER.length}`}
              className="block h-full w-full"
              shapeRendering="crispEdges"
            >
              <path d={bitmapPath(POINTER, 'o')} className="fill-surface" />
              <path d={bitmapPath(POINTER, 'X')} className="fill-ink" />
            </svg>
          </div>
        </>,
      )}
    </>
  ),

  /* 1984 -> 1995: the 1-bit desktop gains colour depth - dither, sixteen
     colours, then teal - and the window chrome gains bevels. */
  macintosh: (from, to) => (
    <>
      {from(
        <div className="ao-part b5-flat">
          <div className="ao-part b5-flat-title" />
        </div>,
      )}
      {to(
        <>
          <div className="ao-part b5-bevel">
            <div className="ao-part b5-bevel-title" />
          </div>
          <div className="ao-part b5-taskbar">
            <span className="ao-part b5-start" />
          </div>
        </>,
      )}
    </>
  ),

  /* 1995 -> today: the dial-up progress bar streams out as light over fibre,
     and the dark dashboard emerges. */
  win95: (from, to) => (
    <>
      {from(
        <div className="ao-part b6-dialog">
          <div className="ao-part b6-title" />
          <div className="ao-part b6-track">
            <div className="ao-part b6-blocks" />
          </div>
        </div>,
      )}
      {to(
        <>
          <div className="ao-part b6-dash">
            <span className="b6-card" />
            <span className="b6-card b6-card--2" />
            <span className="b6-card b6-card--3" />
            <span className="b6-card b6-card--4" />
          </div>
        </>,
      )}
    </>
  ),

  /* Today -> the Convergence: the dashboard's panels fold into one core of
     light, where the chips will gather. */
  cloud: (from, to) => (
    <>
      {from(
        <div className="ao-part b7-cards">
          <span className="b6-card b7-card" />
          <span className="b6-card b6-card--2 b7-card b7-card--2" />
          <span className="b6-card b6-card--3 b7-card b7-card--3" />
          <span className="b6-card b6-card--4 b7-card b7-card--4" />
        </div>,
      )}
      {to(<div className="ao-part b7-core" />)}
    </>
  ),
};
