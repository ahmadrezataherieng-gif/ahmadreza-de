'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { eras, type EraId } from '@/content/eras';
import { useJourneyStore } from '@/store/journey-store';
import { useThemeStore } from '@/store/theme-store';
import { useUnlockStore } from '@/store/unlock-store';
import { usePuzzleProgressStore } from '@/store/puzzle-progress-store';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { scrollToEra, setActiveLenis, setLayoutChangeHandler } from '@/lib/lenis-controller';
import { themeToCssVars } from '@/lib/apply-theme';
import { getTheme, type ThemeId } from '@/lib/themes';

import { EraSection } from '@/components/journey/EraSection';
import { CONVERGENCE_ID, Convergence } from '@/components/journey/Convergence';
import { LegalLinks } from '@/components/ui/SiteFooter';
import { JourneyProgress } from '@/components/journey/JourneyProgress';
import { SkipToDesktop } from '@/components/journey/SkipToDesktop';
import { ModeSwitch } from '@/components/journey/ModeSwitch';
import { leaveForDesktop } from '@/components/journey/hand-over';
import { JOURNEY_SCENES_ID } from '@/components/puzzles/hold';
import { gateBottom, isGateActive, measureGates, tickGate } from '@/components/puzzles/gate';
// Renders nothing on the server (its copy loads lazily), so no hydration risk.
import { PuzzleGate } from '@/components/puzzles/PuzzleGate';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';
import { count } from '@/lib/count';
import { JOURNEY_COMPLETED } from '@/lib/counters';

gsap.registerPlugin(ScrollTrigger);

const sectionId = (eraIndex: number) => `era-${eraIndex}`;

/** How long the chrome takes to fade before the journey hands over to the desktop. */
const HAND_OVER_MS = 420;

/**
 * Greater than zero while the GSAP ticker (a rAF, after Lenis has read the
 * scroll position) is updating ScrollTrigger: the resolver may write at once.
 * Anywhere else - a native scroll event - it waits for the frame (PERF-02).
 */
let tickerDepth = 0;

/**
 * The first era's tokens as a stylesheet, rendered into the static HTML.
 *
 * The global bootstrap values are the `modern` desktop palette. Without this,
 * Act 1's very first paint would be the cyan desktop, cross-fading to 1946 only
 * after hydration. Values come from themes.ts, so nothing is hardcoded here;
 * once the theme store writes inline properties on <html>, those win.
 */
const FIRST_ERA_CSS = `:root{${Object.entries(themeToCssVars(getTheme(eras[0].themeId)))
  .map(([name, value]) => `${name}:${value}`)
  .join(';')}}`;

/**
 * Every era's palette, and the modern one, as scoped blocks.
 *
 * During a crossing two eras share the screen, so neither can rely on the
 * document theme: each section, and each half of a bridge, carries its own
 * tokens through `data-theme-scope`. The Convergence chips use the same blocks.
 * Generated from themes.ts - nothing is hardcoded.
 */
const SCOPED_THEMES_CSS = [...eras.map((era) => era.themeId), 'modern' as const]
  .map(
    (themeId) =>
      `[data-theme-scope="${themeId}"]{${Object.entries(themeToCssVars(getTheme(themeId)))
        .map(([name, value]) => `${name}:${value}`)
        .join(';')}}`,
  )
  .join('');

/**
 * Act 1 — the scroll-driven trip through seven eras of computing.
 *
 * Lenis supplies the smooth scroll, GSAP ScrollTrigger reports which era owns
 * the viewport, and the theme store does the rest: crossing into a section
 * switches the active theme, which restyles the entire document.
 *
 * Under `prefers-reduced-motion` Lenis is never started and no animation is
 * built. ScrollTrigger still runs, because there it only observes scroll
 * position - it produces no motion of its own - so the era indicator and the
 * theme switch keep working on what is otherwise a plain vertical document.
 */
export function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const t = useTranslations('journey');
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;
  const desktopHref = viewHref(locale, 'desktop');
  const setActiveEra = useJourneyStore((state) => state.setActiveEra);
  const setProgress = useJourneyStore((state) => state.setProgress);
  const setTheme = useThemeStore((state) => state.setTheme);
  const markEraVisited = useUnlockStore((state) => state.markEraVisited);
  const finishJourney = useUnlockStore((state) => state.finishJourney);
  const setPuzzleProgress = usePuzzleProgressStore((state) => state.setProgress);

  /* --- smooth scrolling ------------------------------------------------- */
  useEffect(() => {
    if (reducedMotion) return;

    // allowNestedScroll: a puzzle card that overflows scrolls natively while it
    // can, then hands the wheel back to the page. Marking the card's container
    // data-lenis-prevent instead made the wheel dead over every pinned stage,
    // because that container covers the stage even while it is invisible.
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, allowNestedScroll: true });
    setActiveLenis(lenis);

    // Lenis owns the scroll position and does not emit native scroll events, so
    // ScrollTrigger would never learn that the page moved. Ticking it from the
    // same rAF that drives Lenis covers every way the page can move - wheel,
    // touch, in-page anchors, keyboard - with one cheap call per frame.
    const raf = (time: number) => {
      lenis.raf(time * 1000);
      tickerDepth += 1;
      ScrollTrigger.update();
      tickerDepth -= 1;
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setActiveLenis(null);
    };
  }, [reducedMotion]);

  /* --- era detection and theme switching -------------------------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activate = (entry: EraBounds) => {
      setTheme(entry.themeId);
      // The Convergence is not an era: the rail stays on the last one.
      if (entry.eraId === null) return;
      setActiveEra(entry.eraId);
      markEraVisited(entry.eraId);
    };

    /*
     * One trigger, one resolver.
     *
     * Seven per-section triggers with onEnter/onEnterBack look natural but are
     * order-dependent: while the first frame is still laying out, several of
     * them can report "entered" and the last one to fire wins, which left the
     * 1946 section wearing the 1971 theme. Resolving the era from the scroll
     * position instead makes the answer a pure function of where the page is,
     * so it is correct on load, after a resize and after a font swap alike.
     */
    interface EraBounds {
      /** Stable key for change detection: an era id, or the Convergence. */
      key: string;
      /** Null for the Convergence, which owns a theme but is not an era. */
      eraId: EraId | null;
      themeId: ThemeId;
      section: HTMLElement;
      /**
       * Where each progress value is written: only the subtree that reads it.
       * Written on the section, every value restyled the whole section - about
       * 500 elements - on every frame (DECISIONS.md 48).
       */
      targets: {
        scene: HTMLElement | null;
        camera: HTMLElement | null;
        backdrop: HTMLElement | null;
        bridge: HTMLElement | null;
        layer: HTMLElement | null;
      };
      top: number;
      height: number;
      /** Whether the stage is sticky at this viewport size (CSS decides). */
      pinned: boolean;
      startAt: number;
      /** The stage itself: where the era's own frame begins in document flow. */
      stageTop: number;
      /** The pinned stage's own height: one viewport as CSS measures it. */
      stageHeight: number;
      /**
       * Where each phase begins, in pixels from the section's top, read from the
       * zero-height markers: the visual, the puzzle segment, the crossing out.
       */
      marks: { visual: number; puzzle: number; out: number };
      /** The crossing into this era, while it is a band in document flow. */
      band: { top: number; travel: number } | null;
      /** The puzzle segment, when it is in document flow (phones, reduced motion). */
      layer: { top: number; height: number; sticky: boolean; stickyHeight: number } | null;
      /** Scroll position at which this era takes the theme: the crossing's midpoint. */
      switchAt: number;
      /** Last values written, so unchanged frames cost no style write. */
      last: {
        era: number;
        puzzle: number;
        boundaryIn: number;
        boundaryOut: number;
        published: number;
        /** Whether the puzzle layer was last marked as visible (null: never written). */
        live: boolean | null;
        /** Whether the crossing into this section was last marked as under way. */
        crossing: boolean | null;
        /** Whether the section was last marked as off screen. */
        offScreen: boolean | null;
      };
    }

    let bounds: EraBounds[] = [];
    let activeKey: string | null = null;
    let journeyCompleted = false;
    /** The viewport as of the last measure; reading it per frame can force layout. */
    let viewportHeight = window.innerHeight;
    /** Where the last resolve ran, so a second call in the same frame is free. */
    let resolvedAt = { y: Number.NaN, viewport: Number.NaN };

    const boundsFor = (
      section: HTMLElement,
      key: string,
      eraId: EraId | null,
      themeId: ThemeId,
    ): EraBounds => {
      const stage = section.querySelector<HTMLElement>('[data-era-stage]');
      const layerElement = section.querySelector<HTMLElement>('[data-puzzle-layer]');
      const layerSticky = layerElement?.querySelector<HTMLElement>('[data-puzzle-sticky]');
      const layerInFlow =
        layerElement !== null && getComputedStyle(layerElement).position !== 'absolute';
      const bandElement = section.querySelector<HTMLElement>('[data-bridge-band]');
      const scrollY = window.scrollY;
      const viewport = window.innerHeight;
      const top = section.getBoundingClientRect().top + scrollY;
      const height = section.offsetHeight;
      const pinned = stage !== null && getComputedStyle(stage).position === 'sticky';

      // The markers are absolutely positioned at their phase boundary, so this
      // reads the real pixels instead of re-deriving dvh arithmetic - which is
      // not the same number as innerHeight on a phone with a dynamic toolbar.
      const markAt = (name: string, fallback: number) => {
        const mark = section.querySelector<HTMLElement>(`[data-mark="${name}"]`);
        return mark ? mark.getBoundingClientRect().top + scrollY - top : fallback;
      };
      // The stage is one viewport tall in CSS (100dvh). Measuring it, rather
      // than trusting innerHeight, keeps the maths exact where the two differ.
      const stageHeight = pinned && stage ? stage.offsetHeight : viewport;
      const travel = Math.max(1, height - stageHeight);
      const marks = {
        visual: markAt('visual', 0),
        puzzle: markAt('puzzle', travel),
        out: markAt('out', travel),
      };

      // In document flow the crossing is a band with its own scroll distance
      // before the era; pinned, it is an overlay inside the stage.
      // Reduced motion hides the band (`display: none`); a hidden element
      // measures as zero pixels at the current scroll position, which would
      // put every era's switch point at the same place. No box, no band.
      const bandInFlow =
        bandElement !== null &&
        bandElement.getClientRects().length > 0 &&
        getComputedStyle(bandElement).position !== 'absolute';
      const bandPanel = bandElement?.querySelector<HTMLElement>('.ao-bridge-panel');
      const band =
        bandElement && bandInFlow
          ? {
              top: bandElement.getBoundingClientRect().top + scrollY,
              travel: Math.max(1, bandElement.offsetHeight - (bandPanel?.offsetHeight ?? viewport)),
            }
          : null;

      // Where this era takes the theme: the middle of its crossing, so the
      // chrome changes exactly when the morph does.
      const switchAt = band
        ? band.top + band.travel * 0.5
        : pinned
          ? top + (marks.visual > 0 ? marks.visual * 0.5 : 0)
          : top - viewport * 0.5;

      return {
        key,
        eraId,
        themeId,
        section,
        targets: {
          scene: section.querySelector<HTMLElement>('[data-era-scene]'),
          camera: section.querySelector<HTMLElement>('.ao-camera'),
          backdrop: section.querySelector<HTMLElement>('.ao-era-backdrop'),
          bridge: bandElement,
          layer: layerElement,
        },
        top,
        height,
        pinned,
        startAt: Number(section.dataset.startAt ?? '0'),
        stageTop: stage ? stage.getBoundingClientRect().top + scrollY : top,
        stageHeight,
        marks,
        band,
        switchAt,
        layer:
          layerElement && layerInFlow
            ? {
                top: layerElement.getBoundingClientRect().top + scrollY,
                height: layerElement.offsetHeight,
                sticky:
                  layerSticky !== null &&
                  layerSticky !== undefined &&
                  getComputedStyle(layerSticky).position === 'sticky',
                stickyHeight: layerSticky?.offsetHeight ?? viewport,
              }
            : null,
        last: {
          era: Number.NaN,
          puzzle: Number.NaN,
          boundaryIn: Number.NaN,
          boundaryOut: Number.NaN,
          published: Number.NaN,
          live: null,
          crossing: null,
          offScreen: null,
        },
      };
    };

    const measure = () => {
      viewportHeight = window.innerHeight;
      resolvedAt = { y: Number.NaN, viewport: Number.NaN };
      bounds = eras.flatMap((era) => {
        const section = document.getElementById(sectionId(era.index));
        return section ? [boundsFor(section, era.id, era.id, era.themeId)] : [];
      });
      const convergence = document.getElementById(CONVERGENCE_ID);
      if (convergence) {
        bounds.push(boundsFor(convergence, CONVERGENCE_ID, null, 'modern'));
      }
      // Where each era's Play-mode gate would end the page. The gate module
      // decides whether one applies; the resolver only measures.
      measureGates(
        bounds.flatMap((entry) =>
          entry.eraId === null
            ? []
            : [
                {
                  eraId: entry.eraId,
                  section: entry.section,
                  // The gate closes the page where the puzzle segment ends,
                  // before the crossing into the next era begins.
                  bottom: gateBottom({
                    pinned: entry.pinned,
                    puzzleEnd: entry.top + entry.marks.out + entry.stageHeight,
                    layer: entry.layer,
                    bottom: entry.top + entry.height,
                  }),
                },
              ],
        ),
      );
    };

    /**
     * Progress through one era, 0..1.
     *
     * Pinned: how far through the sticky travel the page is, which is exactly
     * the span over which the stage stays on screen.
     * In document flow (phones, short viewports, reduced motion): how far the
     * section has arrived, reaching 1 once its top is near the top of the
     * viewport - so scrubbed reveals complete as the era comes into view
     * rather than after it has already scrolled half away.
     */
    const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
    const progressOf = (entry: EraBounds, scrollY: number, viewport: number) => {
      const pos = scrollY - entry.top;
      const travel = Math.max(1, entry.height - entry.stageHeight);

      // The crossing into this era. A band measures itself; an overlay runs over
      // the first stretch of the pin, up to the visual's marker.
      const boundaryIn = entry.band
        ? clamp01((scrollY - entry.band.top) / entry.band.travel)
        : entry.pinned && entry.marks.visual > 0
          ? clamp01(pos / entry.marks.visual)
          : 1;

      if (entry.pinned) {
        const visual = Math.max(1, entry.marks.puzzle - entry.marks.visual);
        const puzzleLength = Math.max(1, entry.marks.out - entry.marks.puzzle);
        const outLength = Math.max(1, travel - entry.marks.out);
        return {
          boundaryIn,
          era: clamp01((pos - entry.marks.visual) / visual),
          puzzle: entry.marks.out > entry.marks.puzzle ? clamp01((pos - entry.marks.puzzle) / puzzleLength) : 0,
          boundaryOut: clamp01((pos - entry.marks.out) / outLength),
        };
      }

      // Document flow: the era's own frame arrives as its stage comes into
      // view, the puzzle segment measures itself, and there is no dolly out.
      const era = clamp01((scrollY + viewport - entry.stageTop) / Math.max(1, viewport * 0.9));
      const layer = entry.layer;
      let puzzle = 0;
      if (layer) {
        puzzle = layer.sticky
          ? clamp01((scrollY - layer.top) / Math.max(1, layer.height - layer.stickyHeight))
          : clamp01((scrollY + viewport - layer.top) / Math.max(1, viewport * 0.9));
      }
      return { boundaryIn, era, puzzle, boundaryOut: 0 };
    };

    /*
     * Performance (DECISIONS.md 48): this runs every frame, and twice - from the
     * scroll event and from the ticker. Any layout read after a write forces the
     * browser to restyle on the spot. Hence: every layout read happens at the
     * start, before the first write; the viewport comes from the last measure;
     * and a call that finds the page where the last one left it returns before
     * writing anything, so the second call in a frame costs nothing.
     *
     * The position is window.scrollY, not Lenis's own number: Lenis only syncs
     * that with native scrolls (keyboard, scrollbar, a jump) in some of its
     * states, and a stale value left the resolver - and the theme, the puzzle
     * progress and the crossings - behind the page.
     */
    const resolve = () => {
      if (bounds.length === 0) return;
      const scrollY = window.scrollY;
      const viewport = viewportHeight;
      if (scrollY === resolvedAt.y && viewport === resolvedAt.viewport) return;
      resolvedAt = { y: scrollY, viewport };
      tickGate(scrollY, viewport);

      // Reaching the end of the page is finishing the journey (below). Read
      // here, before any write this frame, and only until it has happened.
      const atPageEnd =
        !journeyCompleted &&
        !isGateActive() &&
        scrollY + viewport >= document.documentElement.scrollHeight - 2;

      // An era takes the theme at the midpoint of the crossing into it, where
      // the morph hands over too (DECISIONS.md 45). Sections overlap now, so
      // "which section contains this line" is no longer a question with one
      // answer; the last era whose switch point is behind the visitor is.
      let hit = bounds[0];
      for (const entry of bounds) {
        if (scrollY >= entry.switchAt) hit = entry;
      }

      // Only a change of era touches the stores. Doing it every frame re-set
      // zustand state 60 times a second, and the persisted unlock store wrote
      // localStorage on each of those.
      if (hit.key !== activeKey) {
        activeKey = hit.key;
        activate(hit);
      }

      for (const entry of bounds) {
        const values = progressOf(entry, scrollY, viewport);
        const progress = values.era;
        const { scene, camera, backdrop, bridge, layer } = entry.targets;
        const write = (
          field: 'era' | 'puzzle' | 'boundaryIn' | 'boundaryOut',
          to: readonly (readonly [string, HTMLElement | null])[],
        ) => {
          const rounded = Math.round(values[field] * 1000) / 1000;
          if (rounded === entry.last[field]) return;
          entry.last[field] = rounded;
          for (const [name, element] of to) element?.style.setProperty(name, String(rounded));
        };
        // Inherited: everything in the era's own frames reads it.
        write('era', [['--era-progress', scene]]);
        // The crossing in: inherited through the bridge, whose parts all read
        // it; non-inherited on the three scene elements that read it.
        write('boundaryIn', [
          ['--boundary-in', bridge],
          ['--scene-in', scene],
          ['--scene-in', camera],
          ['--scene-in', backdrop],
        ]);
        // The crossing out: non-inherited, straight onto its three readers.
        write('boundaryOut', [
          ['--boundary-out', camera],
          ['--boundary-out', backdrop],
          ['--boundary-out', layer],
        ]);
        // Inherited through the puzzle layer only.
        write('puzzle', [['--puzzle-progress', layer]]);

        // Pinned, the puzzle layer lies over the whole stage for the entire
        // era, invisible until its segment. While invisible it must not take
        // the pointer: an unseen button mid-screen would catch clicks, and the
        // card's scroll container the wheel. One boolean, written on change.
        const live = values.puzzle > 0 && values.boundaryOut < 0.2;
        if (live !== entry.last.live) {
          entry.last.live = live;
          entry.section.toggleAttribute('data-puzzle-live', live);
        }
        // A crossing under way: its layers get the compositor, and an overlay
        // that is not under way is not painted at all (globals.css).
        const crossing = values.boundaryIn > 0 && values.boundaryIn < 1;
        if (crossing !== entry.last.crossing) {
          entry.last.crossing = crossing;
          entry.section.toggleAttribute('data-crossing', crossing);
        }
        // Off screen, an era's endless CSS animations (lamps, packets, cursors,
        // flicker) are paused (globals.css). Running, they restyled hundreds of
        // elements every frame wherever the visitor was (DECISIONS.md 48). From
        // the measured box, so this reads no layout.
        const offScreen = entry.top >= scrollY + viewport || entry.top + entry.height <= scrollY;
        if (offScreen !== entry.last.offScreen) {
          entry.last.offScreen = offScreen;
          entry.section.toggleAttribute('data-off-screen', offScreen);
        }

        // Guided playback is React state, so the puzzle layer needs the number
        // too - but only when it moves by half a percent, never per frame.
        if (entry.eraId !== null) {
          const published = Math.round(values.puzzle * 200) / 200;
          if (published !== entry.last.published) {
            entry.last.published = published;
            setPuzzleProgress(entry.eraId, published);
          }
        }
        // Set once, never cleared: a printout that has begun always finishes.
        if (
          entry.key === hit.key &&
          progress >= entry.startAt &&
          entry.section.dataset.started !== 'true'
        ) {
          entry.section.dataset.started = 'true';
        }

        // Reaching the empty desktop is finishing the journey, exactly as the
        // Skip control is - and it hands over to /desktop/, which opens on
        // this very frame (DECISIONS.md 49). The chrome fades first, so the
        // last frame is the desktop's first. Once per visit.
        // In document flow the last section cannot always scroll far enough
        // for its progress to reach 1, so the bottom of the page counts too.
        // A closed gate also ends the page; that is not the desktop.
        if (!journeyCompleted && entry.eraId === null && (progress >= 0.98 || atPageEnd)) {
          journeyCompleted = true;
          // Reaching the end also unlocks every bonus app (DECISIONS.md 57).
          finishJourney();
          count(JOURNEY_COMPLETED);
          container.dataset.handover = '';
          window.setTimeout(() => leaveForDesktop(desktopHref, { replace: true }), HAND_OVER_MS);
        }
      }
    };

    // Never write inside a native scroll event (PERF-02, DECISIONS.md 67).
    // ScrollTrigger's listener sits on the document and runs before Lenis's
    // on the window, which then reads scrollY: after our writes, that read
    // forced a full style and layout pass on every scroll event - most of the
    // main thread on a slow phone. Scroll events are dispatched just before
    // the frame's rAF callbacks, so deferring to rAF still lands in the same
    // frame. Inside the GSAP ticker (already a rAF, reads done) it stays
    // synchronous, so wheel scrolling never lags a frame.
    let resolveFrame = 0;
    const scheduleResolve = () => {
      if (tickerDepth > 0) {
        resolve();
        return;
      }
      if (resolveFrame) return;
      resolveFrame = requestAnimationFrame(() => {
        resolveFrame = 0;
        resolve();
      });
    };

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          setProgress(self.progress);
          scheduleResolve();
        },
        onRefresh: () => {
          measure();
          resolve();
        },
      });
    }, container);

    // Measure once the first frame has settled, so era heights are final.
    measure();
    resolve();
    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    // Web fonts swap in after first paint and change line heights - the teletype
    // printout and the DOS listing both grow when their faces arrive. Every era
    // bound is stale after that, so re-measure.
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      ScrollTrigger.refresh();
      // A locked desktop app links to the era that unlocks it (/amonel/#era-4).
      // The browser's own jump happens before any bound is measured, so land
      // there again through Lenis once they are. A closed Play gate before it
      // still ends the page: the visitor meets that gate first, as intended.
      const target = /^#era-[1-9]$/.test(window.location.hash) ? window.location.hash.slice(1) : null;
      if (target) requestAnimationFrame(() => scrollToEra(target, true));
    });

    // Any section that changes height moves every boundary after it: an era's
    // content settling on phones, a puzzle growing in document flow. Re-measure
    // then, debounced, and only for real height changes.
    const heights = new Map<Element, number>();
    let resizeTimer = 0;
    const resizeObserver = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const height = Math.round(entry.contentRect.height);
        if (heights.get(entry.target) !== height) {
          if (heights.has(entry.target)) changed = true;
          heights.set(entry.target, height);
        }
      }
      if (!changed) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    for (const entry of bounds) resizeObserver.observe(entry.section);

    // The scroll limit (Play-mode gates) changes the page height.
    let limitFrame = 0;
    setLayoutChangeHandler(() => {
      cancelAnimationFrame(limitFrame);
      limitFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(refreshFrame);
      cancelAnimationFrame(resolveFrame);
      resizeObserver.disconnect();
      window.clearTimeout(resizeTimer);
      setLayoutChangeHandler(null);
      cancelAnimationFrame(limitFrame);
      context.revert();
    };
  }, [finishJourney, desktopHref, markEraVisited, setActiveEra, setProgress, setPuzzleProgress, setTheme]);

  /* --- the pointer tilts the camera, on the full tier only --------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;
    if (document.documentElement.dataset.tier !== 'full') return;

    // Written on the cameras themselves, as non-inheriting properties
    // (globals.css): on the journey container they restyled all ~3,000
    // elements of the page on every pointer move - 37 ms a frame in the trace.
    const cameras = Array.from(container.querySelectorAll<HTMLElement>('.ao-camera'));
    let frame = 0;
    let pending: { x: number; y: number } | null = null;
    const apply = () => {
      frame = 0;
      if (!pending) return;
      const x = pending.x.toFixed(3);
      const y = pending.y.toFixed(3);
      for (const camera of cameras) {
        camera.style.setProperty('--pointer-x', x);
        camera.style.setProperty('--pointer-y', y);
      }
      pending = null;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pending = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
      frame ||= requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frame);
      for (const camera of cameras) {
        camera.style.removeProperty('--pointer-x');
        camera.style.removeProperty('--pointer-y');
      }
    };
  }, [reducedMotion]);

  /* --- reduced motion changes whether stages pin, so heights change ------ */
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="ao-themed relative w-full">
      <style>{FIRST_ERA_CSS}</style>
      <style>{SCOPED_THEMES_CSS}</style>
      {/* Phones: the switcher sits at the bottom so "Skip to Desktop" - the one
          control a recruiter must always find - never shares its row. */}
      <header className="ao-journey-chrome ao-themed ao-chrome-backdrop fixed start-4 bottom-4 z-[var(--ao-z-modal)] flex items-center gap-1 rounded-control border border-edge p-1 md:top-4 md:bottom-auto">
        <Link
          href={viewHref(locale, 'landing')}
          className="ao-themed rounded-control px-2 py-1 font-mono text-xs text-muted hover:text-ink"
        >
          {tNav('home')}
        </Link>
        <span className="h-4 w-px bg-edge" aria-hidden="true" />
        <LanguageSwitcher />
      </header>

      {/* The legal pages, one click from every era (§ 5 DDG), in the corner
          the other chrome leaves free: top-start on phones, where the header
          sits at the bottom, and bottom-start on wide screens. */}
      <div className="ao-journey-chrome ao-themed ao-chrome-backdrop fixed start-4 top-4 z-[var(--ao-z-modal)] rounded-control border border-edge md:top-auto md:bottom-4">
        <LegalLinks className="gap-x-0 text-[10px] sm:text-xs" linkClassName="px-2 py-1" />
      </div>

      <div className="ao-journey-chrome fixed top-4 end-4 z-[var(--ao-z-modal)] flex items-center gap-2">
        <ModeSwitch />
        <SkipToDesktop />
      </div>
      <div className="ao-journey-chrome">
        <JourneyProgress sectionId={sectionId} />
      </div>
      <PuzzleGate />

      {/* The scenes, separate from the chrome above: while a puzzle holds the
          page, this container is made inert, and the chrome - Skip to Desktop
          included - stays reachable. */}
      <div id={JOURNEY_SCENES_ID} className="relative">
        {eras.map((era, index) => (
          <EraSection
            key={era.id}
            era={era}
            sectionId={sectionId(era.index)}
            nextSectionId={era.index < eras.length ? sectionId(era.index + 1) : CONVERGENCE_ID}
            previous={eras[index - 1] ?? null}
          />
        ))}

        <Convergence />
      </div>

      <p className="ao-sr-only">{t('scrollHint')}</p>
    </div>
  );
}
