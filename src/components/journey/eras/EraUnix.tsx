'use client';

import type { CSSProperties } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { CrtMonitor } from '@/components/journey/eras/CrtMonitor';
import { EraTitle } from '@/components/journey/eras/EraTitle';
import { PrintedLine, printUnit } from '@/components/journey/eras/PrintedText';
import { asStringList } from '@/lib/message-shapes';
import { typeset, typesetDuration, typesetLines } from '@/lib/typeset';

/**
 * 1971 - UNIX. The pivot of the whole journey: the first screen and the first
 * blinking cursor.
 *
 * It opens on a beat of darkness, then a horizontal line expands into a full
 * raster and the phosphor warms up - all scrubbed by scroll position through
 * `.ao-crt-*` in globals.css. Once the screen is lit, the resolver marks the
 * section started and the login banner and shell text print out, ending on a
 * blinking block cursor.
 *
 * A CRT prints perfectly - no jitter, no uneven ink - so imperfection is 0 here.
 * The contrast with the 1956 teletype is the point.
 */
export function EraUnix({ headingId }: { headingId: string }) {
  const t = useTranslations('eras.unix');
  const locale = useLocale();
  const lines = asStringList(t.raw('visual.lines'));
  const unit = printUnit(locale);

  // Machine text is Latin in every locale and always prints character by char.
  const banner = typeset(t('visual.banner'), 1971, { step: 0.022, startDelay: 0.2, imperfection: 0 });
  const login = typeset(t('visual.loginLine'), 1972, {
    step: 0.045,
    startDelay: typesetDuration(banner) + 0.35,
    imperfection: 0,
  });
  const body = typesetLines(lines, 1973, {
    step: 0.014,
    lineGap: 0.08,
    startDelay: typesetDuration(login) + 0.3,
    imperfection: 0,
    unit,
  });

  return (
    <div className="ao-era-exit relative flex min-h-dvh w-full flex-col bg-background md:h-full">
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8 px-5 pt-20 pb-14 sm:px-10 md:pe-28 md:flex-row md:items-center md:gap-10 md:py-0">
        <EraTitle
          year="1971"
          title={t('name')}
          headingId={headingId}
          className="md:w-[30%]"
        >
          <p className="mt-2 max-w-sm font-body text-lg leading-snug text-muted">
            {t('description')}
          </p>
        </EraTitle>

        <div className="ao-sr-only">
          <p>{t('visual.banner')}</p>
          <p>{t('visual.loginLine')}</p>
          {lines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        <CrtMonitor label={t('visual.screenLabel')} powerOn className="ao-depth-mid w-full md:w-[70%]">
          <div
            className="min-h-[21rem] px-4 py-5 font-mono text-[17px] leading-[1.3] text-ink sm:min-h-[26rem] sm:px-7 sm:py-7 sm:text-xl"
            aria-hidden="true"
          >
            <div dir="ltr" className="mb-3">
              <PrintedLine glyphs={banner} />
              <PrintedLine glyphs={login} />
            </div>

            {body.lines.map((glyphs, index) => (
              <PrintedLine key={index} glyphs={glyphs} />
            ))}

            <div dir="ltr" className="mt-3 flex items-center gap-2">
              <span
                className="ao-late"
                style={{ '--late-delay': `${body.end.toFixed(2)}s` } as CSSProperties}
              >
                {t('visual.prompt')}
              </span>
              <span
                className="ao-cursor-late inline-block h-[1.05em] w-[0.6em] bg-ink"
                style={{ '--cursor-delay': `${body.end.toFixed(2)}s` } as CSSProperties}
              />
            </div>
          </div>
        </CrtMonitor>
      </div>
    </div>
  );
}
