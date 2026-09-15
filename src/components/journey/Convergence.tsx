'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { CrtMonitor } from '@/components/journey/eras/CrtMonitor';
import { MacScreen } from '@/components/journey/eras/EraMac';
import { Sparkline } from '@/components/journey/eras/EraCloud';
import { W95Window } from '@/components/journey/eras/EraWin95';
import { eras } from '@/content/eras';
import { themeToCssVars } from '@/lib/apply-theme';
import { getTheme } from '@/lib/themes';
import { asStringList } from '@/lib/message-shapes';

export const CONVERGENCE_ID = 'convergence';

/** Scroll distance of the Convergence, in viewport heights. */
export const CONVERGENCE_LENGTH = 3;

/**
 * Each chip keeps its own era's palette while the page is in the modern theme.
 * This is the theme engine applied to a subtree instead of the document: the
 * same themeToCssVars() output, scoped by attribute. It is generated from
 * themes.ts, so nothing is hardcoded, and it is exactly what the Phase 9 Time
 * Machine will do to a whole window.
 */
const SCOPED_THEMES_CSS = eras
  .map(
    (era) =>
      `[data-theme-scope="${era.themeId}"]{${Object.entries(themeToCssVars(getTheme(era.themeId)))
        .map(([name, value]) => `${name}:${value}`)
        .join(';')}}`,
  )
  .join('');

/** When each chip docks, matching --start + 0.16 in `.ao-conv-chip`. */
const DOCKED_AT = [0.28, 0.33, 0.38, 0.43, 0.48, 0.53, 0.58] as const;
const INTRO_AT = 0.03;
const WELCOME_AT = 0.76;

interface LogComponent {
  label: string;
  status: string;
}

function asComponents(value: unknown): LogComponent[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is LogComponent =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).label === 'string' &&
          typeof (item as Record<string, unknown>).status === 'string',
      )
    : [];
}

/**
 * Act 2 - the Convergence. The hinge between the journey and the desktop.
 *
 * Seven chips - a real piece of each era, reused rather than redrawn - appear
 * in a ring, then one by one fly to the foot of a forming desktop and shrink
 * into it. As each one docks, its line in the boot log types out and reports
 * OK. The chips dissolve into a seam of light, the desktop grows to fill the
 * screen, the log fades, and the story ends on an empty AhmadOS desktop.
 *
 * All of it is one scroll-progress value. No GSAP timeline; each element's
 * position is a calc() over --era-progress in globals.css.
 */
export function Convergence() {
  const t = useTranslations('convergence');
  const tMac = useTranslations('eras.macintosh.visual');
  const tBatch = useTranslations('eras.batch.visual');
  const tWin = useTranslations('eras.win95.visual');
  const tUnix = useTranslations('eras.unix.visual');
  const tDos = useTranslations('eras.dos.visual');
  const components = asComponents(t.raw('components'));
  const printed = asStringList(tBatch.raw('printed'));

  return (
    <section
      id={CONVERGENCE_ID}
      aria-labelledby={`${CONVERGENCE_ID}-heading`}
      className="ao-conv-section ao-themed w-full"
      style={{ '--era-length': CONVERGENCE_LENGTH } as CSSProperties}
    >
      <style>{SCOPED_THEMES_CSS}</style>
      <h2 id={`${CONVERGENCE_ID}-heading`} className="ao-sr-only">
        {t('title')}
      </h2>

      <div className="ao-conv-stage ao-final-frame w-full bg-background" data-era-stage="">
        {/* --- the desktop that forms --- */}
        <div className="ao-conv-frame">
          <div
            className="ao-conv-wallpaper absolute inset-0 overflow-hidden rounded-window border border-edge shadow-window"
            role="img"
            aria-label={t('desktopLabel')}
          >
            <div className="absolute inset-x-0 top-0 h-[3.5cqh] border-b border-edge bg-surface/60" />
            <div className="ao-conv-seam absolute inset-x-[18%] bottom-[9cqh] h-px bg-accent shadow-[0_0_24px_var(--ao-color-glow)]" />

            {/*
              PHASE 6 MOUNT POINT - the AhmadOS desktop shell.

              The Convergence ends here, on an empty desktop. Phase 6 attaches
              the window manager, taskbar and mobile home screen to this element
              and takes over from the journey. Do not build shell UI inside the
              Convergence; replace this element's children instead.
            */}
            <div data-shell-mount="ahmados" className="absolute inset-0" />
          </div>
        </div>

        {/* --- seven eras, compiling --- */}
        <div className="absolute inset-0" aria-hidden="true">
          <Chip scope="era1946">
            <div className="ao-metal-grain flex h-full items-center justify-center bg-background p-[8%]">
              <div className="grid w-full grid-cols-6 gap-[10%]">
                {Array.from({ length: 12 }, (_, index) => (
                  <span
                    key={index}
                    className="ao-lamp aspect-square w-full"
                    style={{ '--lamp-duration': `${1.3 + (index % 5) * 0.3}s`, '--lamp-delay': `${(index * 0.37) % 2}s` } as CSSProperties}
                  />
                ))}
              </div>
            </div>
          </Chip>

          <Chip scope="era1956">
            <div className="ao-paper flex h-full">
              <div className="ao-sprockets w-[10%] shrink-0" />
              <div className="ao-greenbar flex-1 truncate px-[6%] pt-[10%] font-mono text-[1.6cqmin] leading-[3cqmin] text-ink" dir="ltr">
                {printed.slice(0, 3).map((line, index) => (
                  <p key={index} className="truncate">
                    {line || '\u00a0'}
                  </p>
                ))}
              </div>
              <div className="ao-sprockets w-[10%] shrink-0" />
            </div>
          </Chip>

          <Chip scope="era1971" bare>
            <CrtMonitor label="" className="h-full rounded-[1cqmin] p-[5%] sm:p-[5%]">
              <p className="h-[11cqmin] px-[6%] pt-[6%] font-mono text-[2.6cqmin] text-ink" dir="ltr">
                {tUnix('prompt')} <span className="ao-cursor inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-ink" />
              </p>
            </CrtMonitor>
          </Chip>

          <Chip scope="era1981" bare>
            <CrtMonitor label="" className="h-full rounded-[1cqmin] p-[5%] sm:p-[5%]">
              <p className="h-[11cqmin] px-[6%] pt-[6%] font-[family-name:var(--ao-font-vt323)] text-[3cqmin] text-ink" dir="ltr">
                {tDos('prompt')}<span className="ao-cursor inline-block h-[0.15em] w-[0.55em] bg-ink" />
              </p>
            </CrtMonitor>
          </Chip>

          <Chip scope="era1984">
            <svg viewBox="0 0 320 214" className="ao-pixelated block h-full w-full" preserveAspectRatio="xMidYMid slice">
              <MacScreen
                menu={asStringList(tMac.raw('menu'))}
                menuItems={[]}
                windowTitle={tMac('windowTitle')}
                icons={asStringList(tMac.raw('icons'))}
                desktopIcons={asStringList(tMac.raw('desktopIcons'))}
                animate={false}
              />
            </svg>
          </Chip>

          <Chip scope="era1995">
            {/* The window's wide-screen sizes read --w95-* variables that only
                exist inside the 1995 scene; here they fall back to this size. */}
            <div className="flex h-full items-center justify-center bg-background p-[8%] text-[1.5cqmin]">
              <W95Window title={tWin('dialTitle')} className="w-full">
                <div className="flex h-[2cqmin] gap-[1px] bg-elevated p-[1px] shadow-bevel">
                  {Array.from({ length: 10 }, (_, index) => (
                    <span key={index} className="ao-w95-block h-full flex-1" />
                  ))}
                </div>
              </W95Window>
            </div>
          </Chip>

          <Chip scope="era2024">
            {/* Just the sparkline: at chip size a panel heading would overflow. */}
            <div className="flex h-full items-center bg-background p-[8%]">
              <div className="w-full rounded-[0.8cqmin] border border-edge bg-surface p-[6%]">
                <Sparkline className="block h-[6cqmin] w-full" />
              </div>
            </div>
          </Chip>
        </div>

        {/* --- the boot log ---
            Machine output, so the block is LTR in every locale; each label is a
            <bdi> so a Persian run keeps its own trailing punctuation instead of
            the "..." jumping to the wrong end of the line. */}
        <div className="ao-conv-log ao-rm-show font-mono" dir="ltr">
          <LogLine on={INTRO_AT} className="mb-[1.2cqh] text-muted">
            <bdi>{t('intro')}</bdi>
          </LogLine>
          {components.map((component, index) => (
            <LogLine key={component.label} on={DOCKED_AT[index] ?? 0.6} className="flex items-baseline gap-[0.8cqh] text-ink">
              <bdi className="shrink-0">{component.label}</bdi>
              <span className="min-w-[2cqh] flex-1 translate-y-[-0.25em] border-b border-dotted border-edge" />
              <span className="shrink-0 font-bold text-success">{component.status}</span>
            </LogLine>
          ))}
          <LogLine on={WELCOME_AT} className="mt-[1.6cqh] text-[length:var(--conv-welcome)] font-bold text-accent">
            <bdi>{t('welcome')}</bdi>
          </LogLine>
        </div>
      </div>
    </section>
  );
}

function Chip({ scope, bare = false, children }: { scope: string; bare?: boolean; children: ReactNode }) {
  return (
    <div
      data-theme-scope={scope}
      className={
        bare
          ? 'ao-conv-chip'
          : 'ao-conv-chip overflow-hidden rounded-[1cqmin] border border-edge shadow-window'
      }
    >
      {children}
    </div>
  );
}

/**
 * One log line: a single text node (or three spans for label, leader and
 * status), uncovered by a stage-coloured cover sliding off it. No per-letter
 * elements - the page's HTML weight is a tracked budget.
 */
function LogLine({ on, className, children }: { on: number; className?: string; children: ReactNode }) {
  return (
    <p className={`ao-conv-line relative overflow-hidden ${className ?? ''}`} style={{ '--on': on } as CSSProperties}>
      {children}
      <span className="ao-conv-line-cover absolute inset-0 bg-background" aria-hidden="true" />
    </p>
  );
}
