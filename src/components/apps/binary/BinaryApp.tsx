'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import type { AppProps } from '@/components/apps/types';
import {
  formatByte,
  formatBytes,
  MAX_INPUT,
  MORSE_UNIT_MS,
  morseTimeline,
  morseToText,
  readSource,
  sourceFormats,
  textToMorse,
  utf8Breakdown,
  type ByteFormat,
  type SourceFormat,
} from '@/components/apps/binary/codec';
import { canPlayAudio, playMorse, type MorsePlayback } from '@/components/apps/binary/morse-player';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/use-reduced-motion';

type Tab = 'bytes' | 'morse';
const TABS: readonly Tab[] = ['bytes', 'morse'];
const BYTE_FORMATS: readonly ByteFormat[] = ['binary', 'hex', 'decimal'];
/** Rows of the UTF-8 table: enough to compare scripts, few enough to read. */
const TABLE_ROWS = 24;
/** What the fields hold on first open: a Latin word, a Persian word, an emoji. */
// CONTENT-TODO CR-965
const SAMPLE_TEXT = 'Hi سلام 👋';
const SAMPLE_MORSE_TEXT = 'SOS';

const field =
  'ao-themed w-full rounded-control border border-edge bg-background px-3 py-2 font-mono text-sm text-ink placeholder:text-muted focus-visible:border-accent focus-visible:outline-none';
const chip =
  'ao-themed min-h-8 cursor-pointer rounded-control border px-2.5 font-mono text-xs focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';

/**
 * Binary & Morse (Phase 9D-1, DECISIONS.md 57), unlocked by the 1946 puzzle:
 * text is numbers. Text becomes UTF-8 bytes - in binary, hex and decimal, and
 * back - with a table that shows why a Latin letter takes one byte, a Persian
 * letter two and an emoji four. The second tab turns text into international
 * Morse and back, played as a tone and a light only when the visitor asks.
 *
 * Everything stays in the browser; nothing typed is sent or stored.
 */
export function BinaryApp(props: AppProps) {
  return (
    <AppMessages copy={['binary']}>
      <Binary {...props} />
    </AppMessages>
  );
}

function Binary({ appId }: AppProps) {
  const t = useTranslations('binary');
  const [tab, setTab] = useState<Tab>('bytes');
  const baseId = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ bytes: null, morse: null });

  // The tab pattern: arrows move between tabs, Home and End jump.
  const onTabKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.indexOf(tab);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let next: Tab | undefined;
    if (event.key === forward) next = TABS[(index + 1) % TABS.length];
    else if (event.key === back) next = TABS[(index - 1 + TABS.length) % TABS.length];
    else if (event.key === 'Home') next = TABS[0];
    else if (event.key === 'End') next = TABS[TABS.length - 1];
    if (!next) return;
    event.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div data-app-content={appId} className="@container min-h-full">
      <div className="flex flex-col gap-4 p-4 @min-[520px]:p-5">
        <p className="font-body text-sm leading-relaxed text-ink">{t('intro')}</p>

        <div role="tablist" aria-label={t('tabsLabel')} className="flex gap-1 border-b border-edge">
          {TABS.map((id) => (
            <button
              key={id}
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${id}`}
              aria-controls={`${baseId}-panel-${id}`}
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              data-binary-tab={id}
              onClick={() => setTab(id)}
              onKeyDown={onTabKey}
              className={cn(
                'ao-themed -mb-px cursor-pointer border-b-2 px-3 py-2 font-mono text-xs tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                tab === id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t(`tabs.${id}`)}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`${baseId}-panel-${tab}`} aria-labelledby={`${baseId}-tab-${tab}`} data-binary-panel={tab}>
          {tab === 'bytes' ? <BytesPanel /> : <MorsePanel />}
        </div>
      </div>
    </div>
  );
}

/* --- text and bytes ----------------------------------------------------------- */

function BytesPanel() {
  const t = useTranslations('binary.bytes');
  const id = useId();
  const [source, setSource] = useState<SourceFormat>('text');
  const [input, setInput] = useState(SAMPLE_TEXT);

  const result = useMemo(() => readSource(input, source), [input, source]);

  // Switching the input format carries the current value over, so the
  // visitor sees the same text written the other way and can edit it there.
  const switchSource = (next: SourceFormat) => {
    if (next === source) return;
    if (result.ok) setInput(next === 'text' ? result.text : formatBytes(result.bytes, next));
    else setInput('');
    setSource(next);
  };

  const rows = result.ok ? utf8Breakdown(result.text) : [];
  const chars = rows.length;
  const byteCount = result.ok ? result.bytes.length : 0;

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-mono text-xs tracking-wide text-muted uppercase">{t('sourceLabel')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {sourceFormats.map((format) => (
            <button
              key={format}
              type="button"
              aria-pressed={source === format}
              data-binary-source={format}
              onClick={() => switchSource(format)}
              className={cn(chip, source === format ? 'border-accent bg-accent text-background' : 'border-edge text-ink hover:border-accent')}
            >
              {t(`formats.${format}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-input`} className="font-mono text-xs tracking-wide text-muted uppercase">
          {t('inputLabel', { format: t(`formats.${source}`) })}
        </label>
        <textarea
          id={`${id}-input`}
          data-binary-input=""
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          maxLength={source === 'text' ? MAX_INPUT : MAX_INPUT * 9}
          dir={source === 'text' ? 'auto' : 'ltr'}
          spellCheck={false}
          autoComplete="off"
          placeholder={t(`placeholders.${source}`)}
          aria-describedby={`${id}-status`}
          className={cn(field, 'resize-y leading-relaxed', source === 'text' ? 'font-body' : '')}
        />
        <p id={`${id}-status`} aria-live="polite" data-binary-status={result.ok ? 'ok' : result.error} className="font-body text-xs text-muted">
          {result.ok ? (
            t('summary', { chars, bytes: byteCount })
          ) : result.error === 'empty' ? (
            t('errors.empty')
          ) : (
            <span className="text-error">{t(`errors.${result.error}`)}</span>
          )}
        </p>
      </div>

      {result.ok && result.text !== '' ? (
        <dl className="flex flex-col gap-2" data-binary-outputs="">
          {source !== 'text' ? (
            <div className="flex flex-col gap-0.5">
              <dt className="font-mono text-[11px] tracking-wide text-muted uppercase">{t('formats.text')}</dt>
              <dd dir="auto" className="font-body text-sm break-words text-ink" data-binary-output="text">
                {result.text}
              </dd>
            </div>
          ) : null}
          {BYTE_FORMATS.filter((format) => format !== source).map((format) => (
            <div key={format} className="flex flex-col gap-0.5">
              <dt className="font-mono text-[11px] tracking-wide text-muted uppercase">{t(`formats.${format}`)}</dt>
              <dd dir="ltr" className="font-mono text-xs leading-relaxed break-words text-ink rtl:text-right" data-binary-output={format}>
                {formatBytes(result.bytes, format)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <section aria-labelledby={`${id}-utf8`} className="flex flex-col gap-2">
        <h3 id={`${id}-utf8`} className="font-display text-sm font-bold text-ink">
          {t('utf8Title')}
        </h3>
        <p className="font-body text-xs leading-relaxed text-muted">{t('utf8Explain')}</p>
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start" data-binary-table="">
              <caption className="ao-sr-only">{t('tableCaption')}</caption>
              <thead>
                <tr className="border-b border-edge font-mono text-[11px] tracking-wide text-muted uppercase">
                  <th scope="col" className="py-1.5 pe-3 text-start font-normal">{t('table.char')}</th>
                  <th scope="col" className="py-1.5 pe-3 text-start font-normal">{t('table.codePoint')}</th>
                  <th scope="col" className="py-1.5 pe-3 text-start font-normal">{t('table.bytes')}</th>
                  <th scope="col" className="py-1.5 text-start font-normal">{t('table.bits')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, TABLE_ROWS).map((row, index) => (
                  <tr key={index} className="border-b border-edge/60 align-top" data-utf8-bytes={row.bytes.length}>
                    <td className="py-1.5 pe-3 font-body text-base text-ink">
                      <bdi>{row.char === ' ' ? '␠' : row.char}</bdi>
                    </td>
                    <td dir="ltr" className="py-1.5 pe-3 font-mono text-xs whitespace-nowrap text-muted rtl:text-right">
                      {row.codePoint}
                    </td>
                    <td className="py-1.5 pe-3 font-body text-xs whitespace-nowrap text-ink">{t('byteCount', { count: row.bytes.length })}</td>
                    <td className="py-1.5">
                      <ByteBits bytes={row.bytes} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > TABLE_ROWS ? <p className="mt-1 font-body text-xs text-muted">{t('truncated', { count: TABLE_ROWS })}</p> : null}
          </div>
        ) : null}
        <p className="font-body text-xs text-muted">{t('bitsLegend')}</p>
      </section>
    </div>
  );
}

/** Each byte as eight cells, filled for 1: the bits a screen reader reads as digits. */
function ByteBits({ bytes }: { bytes: readonly number[] }) {
  return (
    <span dir="ltr" className="flex flex-wrap gap-x-2 gap-y-1">
      {bytes.map((byte, index) => {
        const bits = formatByte(byte, 'binary');
        return (
          <span key={index} className="flex flex-col gap-0.5">
            <span aria-hidden="true" className="flex gap-px">
              {[...bits].map((bit, position) => (
                <span
                  key={position}
                  className={cn('h-2.5 w-2 rounded-[1px] border', bit === '1' ? 'border-accent bg-accent' : 'border-edge bg-transparent')}
                />
              ))}
            </span>
            <span className="font-mono text-[10.5px] tracking-tight text-muted">{bits}</span>
          </span>
        );
      })}
    </span>
  );
}

/* --- Morse -------------------------------------------------------------------- */

type Direction = 'toMorse' | 'toText';

function MorsePanel() {
  const t = useTranslations('binary.morse');
  const id = useId();
  const reduced = useReducedMotion();
  const [direction, setDirection] = useState<Direction>('toMorse');
  const [input, setInput] = useState(SAMPLE_MORSE_TEXT);
  const [volume, setVolume] = useState(0.5);
  const [playing, setPlaying] = useState(false);
  const [signal, setSignal] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const playback = useRef<MorsePlayback | null>(null);

  const encoded = useMemo(() => (direction === 'toMorse' ? textToMorse(input.slice(0, MAX_INPUT)) : null), [direction, input]);
  const decoded = useMemo(() => (direction === 'toText' ? morseToText(input.slice(0, MAX_INPUT * 8)) : null), [direction, input]);
  const code = encoded ? encoded.code : input.trim();
  const steps = useMemo(() => morseTimeline(decoded ? textToMorse(decoded.text).code : code), [code, decoded]);

  const stop = () => {
    playback.current?.stop();
    playback.current = null;
    setPlaying(false);
    setSignal(false);
  };

  // Leaving the tab, closing the window or changing the text ends the sound.
  useEffect(() => () => playback.current?.stop(), []);
  useEffect(() => {
    playback.current?.stop();
    playback.current = null;
    setPlaying(false);
    setSignal(false);
  }, [input, direction]);

  const play = () => {
    if (steps.length === 0) return;
    playback.current?.stop();
    setPlaying(true);
    setAnnouncement(t('playing'));
    playback.current = playMorse(steps, {
      unitMs: MORSE_UNIT_MS,
      volume,
      onSignal: setSignal,
      onEnd: () => {
        playback.current = null;
        setPlaying(false);
        setSignal(false);
        setAnnouncement(t('finished'));
      },
    });
  };

  const switchDirection = (next: Direction) => {
    if (next === direction) return;
    if (next === 'toText') setInput(encoded?.code ?? '');
    else setInput(decoded?.text ?? '');
    setDirection(next);
  };

  const onVolume = (value: number) => {
    setVolume(value);
    playback.current?.setVolume(value);
  };

  const totalUnits = steps.reduce((sum, step) => sum + step.units, 0);
  const seconds = Math.round((totalUnits * MORSE_UNIT_MS) / 100) / 10;

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-mono text-xs tracking-wide text-muted uppercase">{t('directionLabel')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {(['toMorse', 'toText'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={direction === option}
              data-morse-direction={option}
              onClick={() => switchDirection(option)}
              className={cn(chip, direction === option ? 'border-accent bg-accent text-background' : 'border-edge text-ink hover:border-accent')}
            >
              {t(`directions.${option}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-input`} className="font-mono text-xs tracking-wide text-muted uppercase">
          {t(`inputLabel.${direction}`)}
        </label>
        <textarea
          id={`${id}-input`}
          data-morse-input=""
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={2}
          maxLength={direction === 'toMorse' ? MAX_INPUT : MAX_INPUT * 8}
          dir={direction === 'toMorse' ? 'auto' : 'ltr'}
          spellCheck={false}
          autoComplete="off"
          placeholder={t(`placeholders.${direction}`)}
          className={cn(field, 'resize-y leading-relaxed', direction === 'toMorse' ? 'font-body' : '')}
        />
      </div>

      <div className="flex flex-col gap-1" aria-live="polite">
        <p className="font-mono text-[11px] tracking-wide text-muted uppercase">{t(`output.${direction}`)}</p>
        {direction === 'toMorse' ? (
          <p dir="ltr" data-morse-output="" className="min-h-6 font-mono text-base leading-relaxed tracking-wider break-words text-ink rtl:text-right">
            {code || '—'}
          </p>
        ) : (
          <p dir="ltr" data-morse-output="" className="min-h-6 font-mono text-base break-words text-ink rtl:text-right">
            {decoded?.text || '—'}
          </p>
        )}
        {encoded && encoded.unsupported.length > 0 ? (
          <div data-morse-unsupported="" className="ao-themed flex flex-col gap-1 rounded-control border border-warning/60 px-3 py-2">
            <p className="font-body text-xs text-ink">
              {t('unsupported')}{' '}
              <bdi className="font-body text-sm">{encoded.unsupported.join(' ')}</bdi>
            </p>
            <p className="font-body text-xs text-muted">{t('unsupportedNote')}</p>
          </div>
        ) : null}
        {decoded && decoded.unknown.length > 0 ? (
          <p data-morse-unknown="" className="font-body text-xs text-error">
            {t('unknown')}{' '}
            <bdi dir="ltr" className="font-mono">
              {decoded.unknown.join('  ')}
            </bdi>
          </p>
        ) : null}
      </div>

      <section aria-labelledby={`${id}-signal`} className="ao-themed flex flex-col gap-3 rounded-control border border-edge bg-surface p-3">
        <h3 id={`${id}-signal`} className="font-display text-sm font-bold text-ink">
          {t('signalTitle')}
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {reduced ? null : (
            // The light: slow enough never to reach 3 flashes a second (codec.ts).
            <span
              aria-hidden="true"
              data-morse-lamp={signal ? 'on' : 'off'}
              className={cn('h-8 w-8 shrink-0 rounded-full border-2', signal ? 'border-warning bg-warning' : 'border-edge bg-background')}
            />
          )}
          {playing ? (
            <button
              type="button"
              data-action="morse-stop"
              onClick={() => {
                stop();
                setAnnouncement(t('stopped'));
              }}
              className="ao-themed min-h-10 cursor-pointer rounded-control border border-accent px-4 font-mono text-xs tracking-wide text-accent uppercase hover:bg-elevated focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              {t('stop')}
            </button>
          ) : (
            <button
              type="button"
              data-action="morse-play"
              onClick={play}
              disabled={steps.length === 0}
              className="ao-themed min-h-10 cursor-pointer rounded-control border border-accent bg-accent px-4 font-mono text-xs tracking-wide text-background uppercase hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t(reduced ? 'playSound' : 'play')}
            </button>
          )}
          <label className="flex items-center gap-2 font-body text-xs text-muted">
            {t('volume')}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => onVolume(Number(event.target.value))}
              aria-valuetext={t('volumeValue', { percent: Math.round(volume * 100) })}
              data-morse-volume=""
              className="w-28 accent-accent"
            />
          </label>
        </div>
        <p className="font-body text-xs text-muted">
          {t('speed', { seconds })} {canPlayAudio() ? null : t('noAudio')}
        </p>

        {/* The same signal drawn once, still: how long each tone and gap lasts.
            Under reduced motion it replaces the flashing light entirely. */}
        {steps.length > 0 ? (
          <figure className="flex flex-col gap-1">
            <div
              dir="ltr"
              role="img"
              aria-label={t('timelineLabel', { code: code.replace(/ \/ /g, ' | ') })}
              data-morse-timeline=""
              className="flex h-4 w-full overflow-hidden rounded-[2px] bg-background"
            >
              {steps.slice(0, 400).map((step, index) => (
                <span key={index} style={{ flexGrow: step.units }} className={cn('h-full basis-0', step.on ? 'bg-accent' : 'bg-transparent')} />
              ))}
            </div>
            <figcaption className="font-body text-xs text-muted">{t('timelineNote')}</figcaption>
          </figure>
        ) : null}
        <p className="ao-sr-only" aria-live="polite">
          {announcement}
        </p>
      </section>

      <p className="font-body text-xs leading-relaxed text-muted">{t('truth')}</p>
    </div>
  );
}
