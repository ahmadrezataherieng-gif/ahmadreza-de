'use client';

import { useLocale, useTranslations } from 'next-intl';

import { EraTitle } from '@/components/journey/eras/EraTitle';
import { PrintedLine, printUnit } from '@/components/journey/eras/PrintedText';
import { asStringList } from '@/lib/message-shapes';
import { typesetLines } from '@/lib/typeset';

/**
 * 1956 - GM-NAA I/O, the first operating system.
 *
 * Still no screen: the visitor is reading printed output. Continuous-feed paper
 * with tractor sprocket holes and faint green bars, all CSS. The text strikes
 * character by character with carriage jitter, uneven ink and the occasional
 * over-struck letter, and the whole sheet feeds upward as the visitor scrolls,
 * then runs off the top to reveal the screen that replaces it.
 *
 * The German printout deliberately spells umlauts as ue/oe/ae: a 1956 line
 * printer had no umlauts, and the transliteration is period-correct.
 */
export function EraBatch({ headingId }: { headingId: string }) {
  const t = useTranslations('eras.batch');
  const locale = useLocale();
  const printed = asStringList(t.raw('visual.printed'));

  const block = typesetLines(printed, 1956, {
    step: 0.016,
    lineGap: 0.18,
    startDelay: 0.25,
    unit: printUnit(locale),
  });

  return (
    <div className="ao-era-exit relative flex min-h-dvh w-full flex-col bg-background md:h-full md:overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 pt-20 pb-14 sm:px-10 md:pe-28 md:flex-row md:items-center md:gap-12 md:py-0">
        <EraTitle
          year="1956"
          title={t('name')}
          headingId={headingId}
          className="md:w-[34%]"
        >
          <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-muted sm:text-base">
            {t('description')}
          </p>
        </EraTitle>

        {/* The full text for assistive tech and crawlers; the printout below is
            the same words split into strike units, which reads badly aloud. */}
        <div className="ao-sr-only">
          {printed.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        <div className="relative w-full md:flex md:h-full md:w-[66%] md:items-start md:justify-center">
          <div
            className="ao-paper-feed ao-paper ao-themed relative mx-auto flex w-full max-w-xl shadow-window md:min-h-[125dvh]"
            role="img"
            aria-label={t('visual.paperLabel')}
          >
            <div className="ao-sprockets w-5 shrink-0 border-e border-dashed border-edge sm:w-7" />

            <div
              className="ao-greenbar flex-1 px-3 py-6 font-mono text-[12px] leading-[1.5em] text-ink sm:px-6 sm:py-10 sm:text-sm"
              aria-hidden="true"
            >
              {block.lines.map((glyphs, index) => (
                <PrintedLine key={index} glyphs={glyphs} />
              ))}
            </div>

            <div className="ao-sprockets w-5 shrink-0 border-s border-dashed border-edge sm:w-7" />
          </div>
        </div>
      </div>
    </div>
  );
}
