'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { asStringList } from '@/lib/message-shapes';
import { POINTER, bitmapPath, bitmapWidth } from '@/lib/pixel-art';
import { cn } from '@/lib/cn';

/** Position of "Dial-Up Networking" in the start menu. Structure, not copy. */
const DIALUP_INDEX = 3;

/** Era-progress moments of the dial-up sequence. */
const DIAL_STEPS_AT = [0.38, 0.44, 0.5, 0.56] as const;
const HOPS_AT = [0.38, 0.44, 0.47, 0.52, 0.56] as const;
const BLOCKS = 12;
const CONNECTED_AT = 0.56;
const PAGE_AT = [0.7, 0.74, 0.78, 0.82] as const;

const cue = (on: number, off = 2): CSSProperties => ({ '--on': on, '--off': off }) as CSSProperties;

/**
 * 1995 - Windows 95 and the modem. Where the computer stops being alone.
 *
 * The persistent pointer from 1984 clicks Start, opens the menu and chooses
 * Dial-Up Networking. A modem dialog then walks the connection hop by hop -
 * this PC, modem, phone network, provider, internet - with a chunky progress
 * bar and a jittering handshake strip that suggests the sound without playing
 * it. Once connected, the tray lights and an early web page loads line by line.
 *
 * The network is the idea here, not the chrome: the hop chain is the centre of
 * the dialog, and the caption spells out the shift from machine to node.
 *
 * Bevels are static box-shadows from the theme. Nothing animates a shadow; a
 * pressed button is a second, sunken layer cross-faded by opacity.
 *
 * Layout: on wide screens the scene is a container-query stage and windows sit
 * on it in container units (`.ao-w95-*` in globals.css), so text, windows and
 * the pointer path scale together. On phones the same windows simply stack.
 */
export function EraWin95({ headingId }: { headingId: string }) {
  const t = useTranslations('eras.win95');
  const startItems = asStringList(t.raw('visual.startItems'));
  const dialSteps = asStringList(t.raw('visual.dialSteps'));
  const hops = asStringList(t.raw('visual.hops'));
  const pageLines = asStringList(t.raw('visual.pageLines'));

  return (
    <div className="ao-era-exit ao-final-frame relative min-h-dvh w-full bg-background md:h-full">
      <div
        className="ao-depth-mid ao-w95-scene relative flex w-full flex-col gap-5 px-4 pt-20 pb-6 md:block md:h-dvh md:p-0"
        role="group"
        aria-label={t('visual.screenLabel')}
      >
        {/* --- the era copy, in a Notepad window --- */}
        <W95Window title={t('visual.infoTitle')} className="ao-w95-info">
          <div className="flex flex-col gap-2 p-3 md:p-[1.4cqh]">
            <p className="font-mono text-xs tracking-[0.3em] text-muted md:text-[length:var(--w95-small)]">
              1995
            </p>
            <h2
              id={headingId}
              className="font-display text-xl leading-tight font-bold break-words hyphens-auto text-ink md:text-[length:var(--w95-title)]"
            >
              {t('name')}
            </h2>
            <p className="font-body text-sm leading-relaxed text-ink md:text-[length:var(--w95-font)]">
              {t('visual.body')}
            </p>
          </div>
        </W95Window>

        {/* --- modem dialog: the network, hop by hop --- */}
        <div className="ao-w95-dialog">
          <W95Window title={t('visual.dialTitle')}>
            <div className="flex flex-col gap-3 p-3 md:gap-[1.2cqh] md:p-[1.4cqh]">
              <HopChain hops={hops} />

              <ol className="font-body text-xs text-ink md:text-[length:var(--w95-font)]">
                {dialSteps.map((step, index) => (
                  <li
                    key={step}
                    className={cn('ao-cue', index === dialSteps.length - 1 && 'font-bold')}
                    style={cue(DIAL_STEPS_AT[index] ?? 0)}
                  >
                    {step}
                  </li>
                ))}
              </ol>

              <div className="flex items-end gap-3">
                {/* Chunky progress bar in a sunken well. */}
                <div className="flex h-5 flex-1 gap-[2px] bg-elevated p-[3px] shadow-bevel md:h-[2.6cqh]">
                  {Array.from({ length: BLOCKS }, (_, index) => (
                    <span
                      key={index}
                      className="ao-cue ao-w95-block h-full flex-1"
                      style={cue(DIAL_STEPS_AT[0] + ((CONNECTED_AT - DIAL_STEPS_AT[0]) * (index + 1)) / BLOCKS)}
                    />
                  ))}
                </div>

                {/* Handshake: visible while dialling, jittering like the tone. */}
                <div className="ao-cue flex h-5 w-16 items-end gap-[2px] md:h-[2.6cqh] md:w-[8cqh]" style={cue(0.44, CONNECTED_AT)} aria-hidden="true">
                  {Array.from({ length: 8 }, (_, index) => (
                    <span
                      key={index}
                      className="ao-w95-bar h-full flex-1 bg-chrome"
                      style={{ '--bar-duration': `${0.24 + (index % 3) * 0.09}s`, '--bar-delay': `${index * 0.05}s` } as CSSProperties}
                    />
                  ))}
                </div>
              </div>

              <p
                className="ao-cue font-body text-xs font-bold text-accent md:text-[length:var(--w95-font)]"
                style={cue(CONNECTED_AT + 0.01)}
              >
                {t('visual.nodeCaption')}
              </p>
            </div>
          </W95Window>
        </div>

        {/* --- the early web --- */}
        <div className="ao-w95-browser">
          <W95Window title={t('visual.browserTitle')}>
            <div className="p-2 md:p-[1cqh]">
              <div className="mb-2 truncate bg-elevated px-2 py-1 font-mono text-[11px] text-ink shadow-bevel md:mb-[1cqh] md:text-[length:var(--w95-small)]" dir="ltr">
                {t('visual.address')}
              </div>
              <div className="flex flex-col gap-1 bg-elevated p-3 shadow-bevel md:gap-[0.6cqh] md:p-[1.4cqh]">
                <p className="ao-cue font-display text-base font-bold text-ink md:text-[length:var(--w95-title)]" style={cue(0.66)}>
                  {t('visual.pageHeading')}
                </p>
                <hr className="ao-cue border-edge" style={cue(0.68)} />
                {pageLines.map((line, index) => (
                  <p
                    key={line}
                    className={cn(
                      'ao-cue font-body text-xs text-ink md:text-[length:var(--w95-font)]',
                      index === 1 && 'text-accent underline',
                    )}
                    style={cue(PAGE_AT[index] ?? 0.8)}
                  >
                    {line}
                  </p>
                ))}
                <p
                  className="ao-cue mt-1 w-fit bg-ink px-2 font-mono text-[11px] text-success md:text-[length:var(--w95-small)]"
                  style={cue(PAGE_AT[3])}
                  dir="ltr"
                >
                  {t('visual.counter')}
                </p>
              </div>
              <p className="ao-cue mt-1 font-body text-[11px] text-ink md:text-[length:var(--w95-small)]" style={cue(0.86)}>
                {t('visual.status')}
              </p>
            </div>
          </W95Window>
        </div>

        {/* --- start menu and taskbar --- */}
        <div className="ao-w95-shell relative flex flex-col md:static">
          <div className="ao-w95-startmenu ao-rm-show flex w-64 max-w-full bg-surface shadow-window md:w-auto">
            <div className="flex w-7 shrink-0 items-end justify-center bg-chrome py-2 md:w-[3cqw]">
              <span className="rotate-180 font-display text-base font-bold whitespace-nowrap text-chrome-ink [writing-mode:vertical-rl] md:text-[length:var(--w95-title)]">
                {t('visual.banner')}
              </span>
            </div>
            <ul className="flex flex-1 flex-col py-1 md:py-[1cqh]">
              {startItems.map((item, index) => (
                <li key={item} className="relative px-3 py-1.5 font-body text-sm text-ink md:px-[1.2cqw] md:py-0 md:text-[length:var(--w95-font)] md:leading-[6.4cqh]">
                  <span className="relative">{item}</span>
                  {index === DIALUP_INDEX && (
                    // The highlight carries its own inverted label: navy with the
                    // default black text on top would be unreadable.
                    <span
                      className="ao-cue ao-rm-show absolute inset-0 flex items-center bg-chrome px-3 text-chrome-ink md:px-[1.2cqw]"
                      style={cue(0.29)}
                      aria-hidden="true"
                    >
                      {item}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <Taskbar
            start={t('visual.start')}
            clock={t('visual.clock')}
            trayLabel={t('visual.trayLabel')}
          />
        </div>

        {/* --- the pointer that arrived in 1984, still here --- */}
        <div className="ao-w95-pointer ao-path pointer-events-none absolute top-0 left-0 hidden md:block" aria-hidden="true">
          <svg
            viewBox={`0 0 ${bitmapWidth(POINTER)} ${POINTER.length}`}
            className="ao-pixelated block h-[34px] w-[22px]"
          >
            <path d={bitmapPath(POINTER, 'o')} fill="var(--ao-color-surface-elevated)" />
            <path d={bitmapPath(POINTER, 'X')} fill="var(--ao-color-text)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * A Windows 95 window: raised outer bevel, navy title bar, sunken content.
 * Exported for the Convergence, which assembles a miniature of one.
 */
export function W95Window({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-surface p-[3px] shadow-window', className)}>
      <div className="flex items-center justify-between gap-2 bg-chrome px-1.5 py-0.5 md:py-[0.3cqh]">
        <span className="truncate font-body text-xs font-bold text-chrome-ink md:text-[length:var(--w95-font)]">
          {title}
        </span>
        <span className="flex shrink-0 gap-[2px]" aria-hidden="true">
          {['min', 'max', 'close'].map((kind) => (
            <span key={kind} className="flex h-3.5 w-4 items-center justify-center bg-surface shadow-window md:h-[1.8cqh] md:w-[2cqh]">
              <svg viewBox="0 0 8 7" className="h-2 w-2 md:h-[1cqh] md:w-[1cqh]">
                {kind === 'min' && <rect x="1" y="5" width="5" height="2" fill="var(--ao-color-text)" />}
                {kind === 'max' && <path d="M1 0h6v7H1zM2 2v4h4V2z" fill="var(--ao-color-text)" fillRule="evenodd" />}
                {kind === 'close' && <path d="M1 0l3 3 3-3 1 1-3 2.5 3 2.5-1 1-3-3-3 3-1-1 3-2.5-3-2.5z" fill="var(--ao-color-text)" />}
              </svg>
            </span>
          ))}
        </span>
      </div>
      {children}
    </div>
  );
}

/** This PC -> modem -> phone network -> provider -> internet, lighting in turn. */
function HopChain({ hops }: { hops: string[] }) {
  return (
    <ol className="flex items-start" aria-hidden="true">
      {hops.map((hop, index) => (
        <li key={hop} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex w-full items-center">
            <span className={cn('h-[2px] flex-1', index === 0 ? 'opacity-0' : 'bg-edge')}>
              {index > 0 && (
                <span className="ao-hop-link block h-full bg-chrome" style={cue(HOPS_AT[index] ?? 0)} />
              )}
            </span>
            <span className="relative h-5 w-5 shrink-0 bg-elevated shadow-bevel md:h-[2.8cqh] md:w-[2.8cqh]">
              <span className="ao-cue absolute inset-[3px] bg-success" style={cue(HOPS_AT[index] ?? 0)} />
            </span>
            <span className={cn('h-[2px] flex-1', index === hops.length - 1 ? 'opacity-0' : 'bg-edge')} />
          </div>
          <span className="w-full truncate px-0.5 text-center font-body text-[10px] leading-tight text-ink md:text-[length:var(--w95-small)]">
            {hop}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Taskbar({ start, clock, trayLabel }: { start: string; clock: string; trayLabel: string }) {
  return (
    <div className="ao-w95-taskbar flex h-10 items-center justify-between gap-2 bg-surface px-1 shadow-window md:h-[6cqh] md:px-[0.5cqw]">
      {/* Start button: a raised layer, with a sunken twin cross-faded on top
          while the menu is open. The shadows themselves never animate. */}
      <div className="relative h-[80%]">
        <StartFace label={start} className="shadow-window" />
        <StartFace label={start} className="ao-cue absolute inset-0 shadow-bevel" style={cue(0.14, 0.35)} />
      </div>

      <div className="flex h-[80%] items-center gap-2 bg-surface px-2 shadow-bevel" aria-label={trayLabel} role="img">
        {/* Two linked monitors: lit once the modem connects. */}
        <svg viewBox="0 0 16 12" className="h-3.5 w-4 md:h-[2cqh] md:w-[2.6cqh]" aria-hidden="true">
          <path d="M0 0h7v5H0zM9 6h7v5H9z" fill="var(--ao-color-text-muted)" />
          <path d="M3 5v3h9v-2" fill="none" stroke="var(--ao-color-text-muted)" />
          <g className="ao-cue" style={cue(CONNECTED_AT)}>
            <path d="M1 1h5v3H1zM10 7h5v3h-5z" fill="var(--ao-color-success)" />
          </g>
        </svg>
        <span className="font-body text-xs text-ink tabular-nums md:text-[length:var(--w95-font)]" dir="ltr">
          {clock}
        </span>
      </div>
    </div>
  );
}

function StartFace({ label, className, style }: { label: string; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={cn('flex h-full items-center gap-1.5 bg-surface px-2 font-body text-sm font-bold text-ink md:px-[0.8cqw] md:text-[length:var(--w95-font)]', className)}
      style={style}
    >
      <svg viewBox="0 0 9 9" className="h-3.5 w-3.5 md:h-[2cqh] md:w-[2cqh]" aria-hidden="true">
        <rect width="4" height="4" fill="var(--ao-color-error)" />
        <rect x="5" width="4" height="4" fill="var(--ao-color-success)" />
        <rect y="5" width="4" height="4" fill="var(--ao-color-accent)" />
        <rect x="5" y="5" width="4" height="4" fill="var(--ao-color-warning)" />
      </svg>
      {label}
    </span>
  );
}
