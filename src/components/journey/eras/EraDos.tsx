'use client';

import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';

import { CrtMonitor } from '@/components/journey/eras/CrtMonitor';
import { EraTitle } from '@/components/journey/eras/EraTitle';
import { PrintedLine } from '@/components/journey/eras/PrintedText';
import { asDirRows, type DirRow } from '@/lib/message-shapes';
import { typeset, typesetDuration, typesetLines } from '@/lib/typeset';

/** POST memory test: 0K to 640K in 64K steps. Numerals, not language. */
const MEMORY_STEPS = Array.from({ length: 11 }, (_, index) => index * 64);

/** The visual beep, matching `.ao-beep`. */
const BEEP_END = 2.3;

/**
 * The era year as 1981 would have drawn it: ASCII block digits. Decorative, and
 * a year - which the conventions exempt from localization - so it lives here
 * rather than in messages/.
 */
const ASCII_YEAR = [
  ' █   ███  ███   █ ',
  '██   █ █  █ █  ██ ',
  ' █   ███  ███   █ ',
  ' █     █  █ █   █ ',
  '███  ███  ███  ███',
] as const;

/**
 * 1981 - the IBM PC and MS-DOS.
 *
 * The same CRT as 1971, re-tinted amber by the theme: the handoff is one monitor
 * whose phosphor changes colour as a new machine boots. A POST memory count
 * ticks up to 640K OK, a visual beep marks the end of the self-test (no audio
 * this phase), and a DIR listing prints in the fixed columns DOS used.
 *
 * Machine output is left-to-right in every locale. In Persian the page is RTL,
 * so every screen block pins `dir="ltr"` or the columns would scramble.
 */
export function EraDos({ headingId }: { headingId: string }) {
  const t = useTranslations('eras.dos');
  const rows = asDirRows(t.raw('visual.dirRows'));

  const command = typeset(t('visual.dirCommand'), 1981, {
    step: 0.09,
    startDelay: BEEP_END + 0.5,
    imperfection: 0,
  });
  const listingStart = typesetDuration(command) + 0.25;
  const listing = typesetLines(
    [t('visual.dirVolume'), '', ...rows.map(formatDirRow), '', `        ${t('visual.dirFooter')}`],
    1982,
    // DOS scrolled the listing out near-instantly; only the rhythm of lines shows.
    { step: 0.0035, lineGap: 0.05, startDelay: listingStart, imperfection: 0 },
  );

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-background md:h-full">
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8 px-5 pt-20 pb-14 sm:px-10 md:pe-28 md:flex-row md:items-center md:gap-10 md:py-0">
        <EraTitle
          year="1981"
          title={t('name')}
          headingId={headingId}
          className="md:w-[34%]"
          // Press Start 2P is a full em per character; at the shared size the
          // title breaks mid-word.
          titleClassName="text-lg leading-snug sm:text-xl lg:text-2xl"
        >
          <pre
            dir="ltr"
            className="ao-glow ao-pixelated my-3 w-fit self-start font-mono text-[10px] leading-none text-accent sm:text-xs"
            aria-hidden="true"
          >
            {ASCII_YEAR.join('\n')}
          </pre>
          <p className="max-w-sm font-body text-sm leading-relaxed text-muted sm:text-base">
            {t('visual.body')}
          </p>
        </EraTitle>

        <div className="ao-sr-only">
          <p>{t('visual.biosLine')}</p>
          <p>{t('visual.memoryOk')}</p>
          <p>
            {t('visual.prompt')}
            {t('visual.dirCommand')}
          </p>
          <p>{t('visual.dirVolume')}</p>
          <ul>
            {rows.map((row) => (
              <li key={`${row.name}.${row.ext}`}>
                {row.name}.{row.ext} {row.size} {row.date} {row.time}
              </li>
            ))}
          </ul>
          <p>{t('visual.dirFooter')}</p>
        </div>

        <CrtMonitor label={t('visual.screenLabel')} className="ao-depth-mid w-full md:w-[66%]">
          <div
            dir="ltr"
            className="min-h-[22rem] px-3 py-4 font-[family-name:var(--ao-font-vt323)] text-[15px] leading-[1.25] whitespace-pre text-ink sm:min-h-[25rem] sm:px-6 sm:py-6 sm:text-lg lg:text-xl"
            aria-hidden="true"
          >
            <p>{t('visual.biosLine')}</p>

            <p className="flex">
              {/* One-line window over a column of counts, stepped upward. */}
              <span className="inline-block h-[1lh] overflow-hidden">
                <span
                  className="ao-post-counter flex flex-col items-end tabular-nums"
                  style={
                    {
                      '--post-steps': MEMORY_STEPS.length - 1,
                      '--post-frames': MEMORY_STEPS.length,
                    } as CSSProperties
                  }
                >
                  {MEMORY_STEPS.map((value) => (
                    <span key={value} className="block h-[1lh]">
                      {value === 640 ? t('visual.memoryOk') : `${String(value).padStart(3, ' ')}K`}
                    </span>
                  ))}
                </span>
              </span>
            </p>

            <p className="mt-1 flex items-center gap-2">
              <span className="ao-beep inline-block bg-accent px-1 text-background">
                {t('visual.beepLabel')}
              </span>
            </p>

            <p className="mt-3">
              <span
                className="ao-late"
                style={{ '--late-delay': `${(BEEP_END + 0.3).toFixed(2)}s` } as CSSProperties}
              >
                {t('visual.prompt')}
              </span>
              <span className="inline-block">
                <PrintedLine glyphs={command} className="inline-block" />
              </span>
            </p>

            <div className="mt-1">
              {listing.lines.map((glyphs, index) => (
                <PrintedLine key={index} glyphs={glyphs} />
              ))}
            </div>

            <p className="mt-2 flex items-center">
              <span
                className="ao-late"
                style={{ '--late-delay': `${listing.end.toFixed(2)}s` } as CSSProperties}
              >
                {t('visual.prompt')}
              </span>
              <span
                className="ao-cursor-late ms-0.5 inline-block h-[0.2em] w-[0.62em] translate-y-[0.35em] bg-ink"
                style={{ '--cursor-delay': `${listing.end.toFixed(2)}s` } as CSSProperties}
              />
            </p>
          </div>
        </CrtMonitor>
      </div>
    </div>
  );
}

/**
 * Format one row exactly as MS-DOS did: an eight-character name padded to
 * column 9, a three-character extension, the size right-aligned, then date and
 * time. Monospace alignment is the whole look, so padding happens here rather
 * than in CSS.
 */
function formatDirRow(row: DirRow): string {
  return `${row.name.padEnd(8, ' ')} ${row.ext.padEnd(3, ' ')} ${row.size.padStart(9, ' ')}  ${row.date}  ${row.time}`;
}

