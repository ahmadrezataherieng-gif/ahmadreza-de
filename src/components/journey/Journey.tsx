'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { eras, type EraId } from '@/content/eras';
import { useJourneyStore } from '@/store/journey-store';
import { useThemeStore } from '@/store/theme-store';
import { useUnlockStore } from '@/store/unlock-store';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { setActiveLenis } from '@/lib/lenis-controller';
import { themeToCssVars } from '@/lib/apply-theme';
import { getTheme, type ThemeId } from '@/lib/themes';

import { EraSection } from '@/components/journey/EraSection';
import { CONVERGENCE_ID, Convergence } from '@/components/journey/Convergence';
import { JourneyProgress } from '@/components/journey/JourneyProgress';
import { SkipToDesktop } from '@/components/journey/SkipToDesktop';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

gsap.registerPlugin(ScrollTrigger);

const sectionId = (eraIndex: number) => `era-${eraIndex}`;

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
  const setActiveEra = useJourneyStore((state) => state.setActiveEra);
  const setProgress = useJourneyStore((state) => state.setProgress);
  const setTheme = useThemeStore((state) => state.setTheme);
  const markEraVisited = useUnlockStore((state) => state.markEraVisited);
  const completeJourney = useUnlockStore((state) => state.completeJourney);

  /* --- smooth scrolling ------------------------------------------------- */
  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    setActiveLenis(lenis);

    // Lenis owns the scroll position and does not emit native scroll events, so
    // ScrollTrigger would never learn that the page moved. Ticking it from the
    // same rAF that drives Lenis covers every way the page can move - wheel,
    // touch, in-page anchors, keyboard - with one cheap call per frame.
    const raf = (time: number) => {
      lenis.raf(time * 1000);
      ScrollTrigger.update();
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
      top: number;
      height: number;
      /** Whether the stage is sticky at this viewport size (CSS decides). */
      pinned: boolean;
      startAt: number;
      /** Last progress written, so unchanged frames cost no style write. */
      lastProgress: number;
    }

    let bounds: EraBounds[] = [];
    let activeKey: string | null = null;
    let journeyCompleted = false;

    const boundsFor = (
      section: HTMLElement,
      key: string,
      eraId: EraId | null,
      themeId: ThemeId,
    ): EraBounds => {
      const stage = section.querySelector<HTMLElement>('[data-era-stage]');
      return {
        key,
        eraId,
        themeId,
        section,
        top: section.offsetTop,
        height: section.offsetHeight,
        pinned: stage !== null && getComputedStyle(stage).position === 'sticky',
        startAt: Number(section.dataset.startAt ?? '0'),
        lastProgress: Number.NaN,
      };
    };

    const measure = () => {
      bounds = eras.flatMap((era) => {
        const section = document.getElementById(sectionId(era.index));
        return section ? [boundsFor(section, era.id, era.id, era.themeId)] : [];
      });
      const convergence = document.getElementById(CONVERGENCE_ID);
      if (convergence) {
        bounds.push(boundsFor(convergence, CONVERGENCE_ID, null, 'modern'));
      }
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
    const progressOf = (entry: EraBounds, scrollY: number, viewport: number) => {
      const raw = entry.pinned
        ? (scrollY - entry.top) / Math.max(1, entry.height - viewport)
        : (scrollY + viewport - entry.top) / Math.max(1, viewport * 0.9);
      return Math.min(1, Math.max(0, raw));
    };

    const resolve = () => {
      if (bounds.length === 0) return;
      const scrollY = window.scrollY;
      const viewport = window.innerHeight;

      // The reference line an era must cross to own the theme.
      // Pinned: 80% down the viewport. By the time the next stage slides in, the
      // outgoing era has faded to its bare background (`.ao-era-exit`), so
      // switching early re-tints nothing but that background - and the incoming
      // era arrives already in its own colours. Without this the 1971 monitor
      // slid in wearing the paper-white 1956 theme instead of arriving dark.
      // In document flow nothing fades out, so the fair line is the centre.
      const line = scrollY + viewport * (bounds[0].pinned ? 0.8 : 0.5);

      const hit =
        bounds.find((entry) => line >= entry.top && line < entry.top + entry.height) ??
        (line < bounds[0].top ? bounds[0] : bounds[bounds.length - 1]);

      // Only a change of era touches the stores. Doing it every frame re-set
      // zustand state 60 times a second, and the persisted unlock store wrote
      // localStorage on each of those.
      if (hit.key !== activeKey) {
        activeKey = hit.key;
        activate(hit);
      }

      for (const entry of bounds) {
        const progress = progressOf(entry, scrollY, viewport);
        const rounded = Math.round(progress * 1000) / 1000;
        if (rounded !== entry.lastProgress) {
          entry.lastProgress = rounded;
          entry.section.style.setProperty('--era-progress', String(rounded));
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
        // Skip control is. Once, so the persisted store is not rewritten.
        // In document flow the last section cannot always scroll far enough
        // for its progress to reach 1, so the bottom of the page counts too.
        const atPageEnd =
          scrollY + viewport >= document.documentElement.scrollHeight - 2;
        if (!journeyCompleted && entry.eraId === null && (progress >= 0.98 || atPageEnd)) {
          journeyCompleted = true;
          completeJourney();
        }
      }
    };

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          setProgress(self.progress);
          resolve();
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
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [completeJourney, markEraVisited, setActiveEra, setProgress, setTheme]);

  /* --- reduced motion changes whether stages pin, so heights change ------ */
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="ao-themed relative w-full">
      <style>{FIRST_ERA_CSS}</style>
      {/* Phones: the switcher sits at the bottom so "Skip to Desktop" - the one
          control a recruiter must always find - never shares its row. */}
      <header className="ao-themed ao-chrome-backdrop fixed start-4 bottom-4 z-[var(--ao-z-modal)] rounded-control border border-edge p-1 md:top-4 md:bottom-auto">
        <LanguageSwitcher />
      </header>

      <SkipToDesktop />
      <JourneyProgress sectionId={sectionId} />

      {eras.map((era) => (
        <EraSection key={era.id} era={era} sectionId={sectionId(era.index)} />
      ))}

      <Convergence />

      <p className="ao-sr-only">{t('scrollHint')}</p>
    </div>
  );
}
