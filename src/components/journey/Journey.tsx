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

import { EraSection } from '@/components/journey/EraSection';
import { JourneyProgress } from '@/components/journey/JourneyProgress';
import { SkipToDesktop } from '@/components/journey/SkipToDesktop';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

gsap.registerPlugin(ScrollTrigger);

const sectionId = (eraIndex: number) => `era-${eraIndex}`;

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

    const activate = (eraId: EraId) => {
      const era = eras.find((candidate) => candidate.id === eraId);
      if (!era) return;
      setActiveEra(era.id);
      setTheme(era.themeId);
      markEraVisited(era.id);
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
    let bounds: Array<{ eraId: EraId; top: number; bottom: number }> = [];

    const measure = () => {
      bounds = eras.flatMap((era) => {
        const element = document.getElementById(sectionId(era.index));
        if (!element) return [];
        return [
          {
            eraId: era.id,
            top: element.offsetTop,
            bottom: element.offsetTop + element.offsetHeight,
          },
        ];
      });
    };

    const resolve = () => {
      if (bounds.length === 0) return;
      const centre = window.scrollY + window.innerHeight / 2;
      const hit =
        bounds.find((entry) => centre >= entry.top && centre < entry.bottom) ??
        (centre < bounds[0].top ? bounds[0] : bounds[bounds.length - 1]);
      activate(hit.eraId);
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

    return () => {
      cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [markEraVisited, setActiveEra, setProgress, setTheme]);

  return (
    <div ref={containerRef} className="ao-themed relative w-full">
      <header className="ao-themed fixed top-4 start-4 z-[var(--ao-z-modal)]">
        <LanguageSwitcher />
      </header>

      <SkipToDesktop />
      <JourneyProgress sectionId={sectionId} />

      {eras.map((era) => (
        <EraSection key={era.id} era={era} sectionId={sectionId(era.index)} />
      ))}

      <p className="ao-sr-only">{t('scrollHint')}</p>
    </div>
  );
}
