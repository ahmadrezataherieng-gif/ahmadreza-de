'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import { eras } from '@/content/eras';
import { Button } from '@/components/ui/Button';
import { DEFAULT_MODE, useUnlockStore } from '@/store/unlock-store';
import { configureGates, gateCueHeight, useGateStore } from '@/components/puzzles/gate';
import { JOURNEY_SCENES_ID } from '@/components/puzzles/hold';
import { PuzzleMessages } from '@/components/puzzles/PuzzleMessages';

/**
 * Turns the mode and the passed eras into gates, and draws the lock at the end
 * of a gated page. Client-only: the static HTML never contains a gate.
 */
export function PuzzleGate() {
  const mode = useUnlockStore((state) => state.mode) ?? DEFAULT_MODE;
  const passedEras = useUnlockStore((state) => state.passedEras);

  useEffect(() => {
    configureGates({ enabled: mode === 'interactive', passed: passedEras });
  }, [mode, passedEras]);

  useEffect(() => () => configureGates({ enabled: false, passed: [] }), []);

  return (
    <PuzzleMessages fallback={null}>
      <GateCue />
    </PuzzleMessages>
  );
}

function GateCue() {
  const t = useTranslations('puzzles.gate');
  const tEras = useTranslations('puzzles');
  const gatedEraId = useGateStore((state) => state.gatedEraId);
  const limit = useGateStore((state) => state.limit);
  const requestPuzzle = useGateStore((state) => state.requestPuzzle);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => setContainer(document.getElementById(JOURNEY_SCENES_ID)), []);

  if (!container || gatedEraId === null || limit === null) return null;

  const scenesTop = container.getBoundingClientRect().top + window.scrollY;
  const cueHeight = gateCueHeight(container);
  const era = eras.find((candidate) => candidate.id === gatedEraId);
  const title = tEras(`${gatedEraId}.title`);

  return createPortal(
    <div
      data-scroll-limit-ignore=""
      data-theme-scope={era?.themeId}
      role="region"
      aria-label={t('label')}
      className="ao-gate-cue absolute inset-x-0 z-[var(--ao-z-windows)] flex items-end justify-center px-4 pb-[4.5rem] md:pb-4"
      style={{ top: limit - scenesTop - cueHeight, height: cueHeight }}
    >
      <div className="ao-themed ao-chrome-backdrop flex w-full max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 rounded-control border border-accent px-4 py-2.5">
        <svg viewBox="0 0 16 16" className="h-5 w-5 shrink-0 text-accent" aria-hidden="true">
          <path d="M4 7V5a4 4 0 1 1 8 0v2h1v8H3V7zm2 0h4V5a2 2 0 1 0-4 0z" fill="currentColor" />
        </svg>
        {/* Wide enough to keep its lines, so the buttons wrap below on phones. */}
        <p className="min-w-0 flex-[1_1_16rem] font-body text-sm leading-snug text-ink">
          <span className="font-bold">{t('locked', { title, index: era?.index ?? 0 })}</span> {t('explain')}
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => requestPuzzle(gatedEraId, false)} data-action="gate-open">
            {t('open')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => requestPuzzle(gatedEraId, true)} data-action="gate-reveal">
            {t('reveal')}
          </Button>
        </div>
      </div>
    </div>,
    container,
  );
}
