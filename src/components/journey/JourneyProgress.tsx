'use client';

import { useTranslations } from 'next-intl';
import { eras } from '@/content/eras';
import { useJourneyStore } from '@/store/journey-store';
import { scrollToElementId } from '@/lib/lenis-controller';
import { cn } from '@/lib/cn';

/**
 * Persistent era indicator. Each tick is a real anchor, so the rail doubles as
 * in-page navigation and keeps working without JavaScript.
 */
export function JourneyProgress({ sectionId }: { sectionId: (eraIndex: number) => string }) {
  const t = useTranslations('journey');
  const activeEraId = useJourneyStore((state) => state.activeEraId);
  const activeIndex = eras.find((era) => era.id === activeEraId)?.index ?? 1;

  return (
    <nav
      aria-label={t('progressLabel')}
      className="ao-themed ao-chrome-backdrop fixed top-1/2 end-4 z-[var(--ao-z-taskbar)] hidden -translate-y-1/2 flex-col items-end gap-3 rounded-control border border-edge px-2.5 py-3 md:flex"
    >
      <span className="font-mono text-[10px] tracking-widest text-muted">
        {t('eraOf', { current: activeIndex, total: eras.length })}
      </span>

      <ol className="flex flex-col gap-3">
        {eras.map((era) => {
          const isActive = era.id === activeEraId;
          const target = sectionId(era.index);
          return (
            <li key={era.id}>
              <a
                href={`#${target}`}
                aria-current={isActive ? 'step' : undefined}
                // The href stays real so this works without JavaScript; when
                // Lenis owns the scroll it has to perform the jump itself.
                onClick={(event) => {
                  event.preventDefault();
                  scrollToElementId(target);
                }}
                className="group flex items-center justify-end gap-2"
              >
                <span
                  className={cn(
                    'font-mono text-[10px] tabular-nums transition-opacity duration-200',
                    isActive ? 'text-accent opacity-100' : 'text-muted opacity-0 group-hover:opacity-100',
                  )}
                >
                  {era.year}
                </span>
                <span
                  className={cn(
                    'ao-themed block h-2 w-2 rounded-full border transition-all duration-300',
                    isActive
                      ? 'scale-150 border-accent bg-accent'
                      : 'border-edge bg-transparent group-hover:border-accent',
                  )}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
