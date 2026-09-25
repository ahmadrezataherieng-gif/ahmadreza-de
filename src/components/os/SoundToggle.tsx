'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { useSoundStore } from '@/store/sound-store';

/**
 * The switch for the desktop's sounds (APP-12): a speaker that is struck
 * through while sound is off, which it is on every page load. It is a real
 * toggle button - the label stays "Ton", `aria-pressed` carries the state and
 * the title says what a click does. Turning sound on is the click that lets the
 * browser start audio; nothing ever plays before it.
 */
export function SoundToggle({ className }: { className?: string }) {
  const t = useTranslations('os.sound');
  const enabled = useSoundStore((store) => store.enabled);
  const available = useSoundStore((store) => store.available);
  const toggle = useSoundStore((store) => store.toggle);
  const title = !available ? t('unavailable') : enabled ? t('on') : t('off');

  return (
    <button
      type="button"
      data-action="sound-toggle"
      aria-pressed={enabled}
      aria-label={t('label')}
      title={title}
      disabled={!available}
      onClick={toggle}
      className={cn(
        'ao-themed flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-control border border-transparent text-muted hover:bg-elevated hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40',
        enabled && 'border-accent/60 text-accent',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 6v4h2.6L8.5 12.5v-9L5.1 6z" />
        {enabled ? <path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.3 3.9a5.8 5.8 0 0 1 0 8.2" /> : <path d="M11 6l3 4M14 6l-3 4" />}
      </svg>
    </button>
  );
}
