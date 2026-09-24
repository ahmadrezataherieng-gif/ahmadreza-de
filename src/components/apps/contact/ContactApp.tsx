'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AppMessages } from '@/components/apps/AppMessages';
import { AppGlyph } from '@/components/apps/icons';
import type { AppProps } from '@/components/apps/types';
import { EMAIL, RESUME } from '@/content/profile';
import { PROFILES } from '@/content/profiles';
import { cn } from '@/lib/cn';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/**
 * How to reach Ahmadreza: the e-mail (a `mailto:` link and a copy button -
 * never a form, nothing is sent to this site), the résumé, where he is, his
 * profiles once he has named them, and the legal pages. Every link is behind
 * its `available` flag or a real URL, so nothing here leads into a 404.
 */
export function ContactApp(props: AppProps) {
  return (
    <AppMessages copy={['contact']}>
      <Contact {...props} />
    </AppMessages>
  );
}

const BUTTON =
  'ao-themed inline-flex min-h-10 items-center gap-2 rounded-control border px-3 py-2 font-mono text-xs tracking-wide focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none';

function Contact({ appId }: AppProps) {
  const t = useTranslations('contact');
  const tNav = useTranslations('nav');
  const locale = useLocale() as Locale;
  const headingId = useId();
  const profiles = PROFILES.filter((profile) => profile.url !== null);

  return (
    <article aria-labelledby={headingId} data-app-content={appId} className="@container min-h-full">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 @min-[480px]:p-6">
        <header className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-edge bg-elevated text-accent">
            <AppGlyph appId={appId} className="h-7 w-7" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id={headingId} className="font-display text-xl font-bold text-ink">
              {t('title')}
            </h2>
            <p className="font-body text-sm text-muted">{t('intro')}</p>
          </div>
        </header>

        <dl className="flex flex-col gap-4">
          <Row label={t('email.label')}>
            {EMAIL.available ? (
              <div className="flex flex-wrap items-center gap-2">
                <a href={`mailto:${EMAIL.address}`} data-action="email" className={cn(BUTTON, 'border-accent text-accent hover:bg-elevated')}>
                  {t('email.write')}
                  <span dir="ltr" className="text-ink">
                    {EMAIL.address}
                  </span>
                </a>
                <CopyButton text={EMAIL.address} />
              </div>
            ) : (
              <p className="font-body text-sm text-muted">{t('email.pending')}</p>
            )}
          </Row>

          <Row label={t('resume.label')}>
            {RESUME.available ? (
              <a href={RESUME.href} download data-action="resume-download" className={cn(BUTTON, 'border-accent bg-accent text-background hover:bg-accent-muted')}>
                {t('resume.download')}
              </a>
            ) : (
              <span data-action="resume-pending" className={cn(BUTTON, 'cursor-not-allowed border-edge text-muted')}>
                {t('resume.pending')}
              </span>
            )}
          </Row>

          <Row label={t('location.label')}>
            <p className="font-body text-ink">{t('location.value')}</p>
          </Row>

          <Row label={t('profiles.label')}>
            {profiles.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <li key={profile.id}>
                    <a href={profile.url ?? undefined} rel="me noopener noreferrer" target="_blank" data-profile={profile.id} className={cn(BUTTON, 'border-edge text-ink hover:border-accent')}>
                      {profile.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                data-placeholder=""
                className="w-fit rounded-control border border-dashed border-warning/70 px-2 py-1 font-mono text-[11px] text-warning"
              >
                {t('profiles.pending')}
              </p>
            )}
          </Row>
        </dl>

        <nav aria-label={t('legal.label')} className="flex flex-wrap gap-4 border-t border-edge pt-4 font-mono text-xs">
          <a href={viewHref(locale, 'imprint')} className="text-muted hover:text-ink hover:underline">
            {tNav('imprint')}
          </a>
          <a href={viewHref(locale, 'privacy')} className="text-muted hover:text-ink hover:underline">
            {tNav('privacy')}
          </a>
        </nav>
      </div>
    </article>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 @min-[480px]:flex-row @min-[480px]:items-baseline @min-[480px]:gap-4">
      <dt className="w-28 shrink-0 font-mono text-[11px] tracking-wide text-muted uppercase">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/** Copies the address into the clipboard, locally; the result is announced. */
function CopyButton({ text }: { text: string }) {
  const t = useTranslations('contact.email');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // No clipboard (an insecure context, a denied permission): the address
      // stays visible and selectable beside the button.
    }
  };

  return (
    <button type="button" onClick={copy} data-action="email-copy" className={cn(BUTTON, 'cursor-pointer border-edge text-ink hover:border-accent')}>
      <span aria-live="polite">{copied ? t('copied') : t('copy')}</span>
    </button>
  );
}
