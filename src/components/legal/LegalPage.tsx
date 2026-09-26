import { getTranslations } from 'next-intl/server';

import { AmonelLogo } from '@/components/ui/Brand';
import { StaticLanguageSwitcher } from '@/components/ui/StaticLanguageSwitcher';
import { SchemeToggle } from '@/components/ui/SchemeToggle';
import { SiteFooter } from '@/components/ui/SiteFooter';
import { UseTheme } from '@/components/theme/UseTheme';
import { LEGAL_CONTACT } from '@/content/legal';
import { bidiParts, linkify, sectionsFor, type LegalBlock, type LegalCopy, type LegalKind } from '@/lib/legal-doc';
import { viewHref } from '@/lib/routing';
import type { Locale } from '@/lib/i18n-config';

/** The legal copy of one locale. Server-only: it never reaches the client bundle. */
export async function loadLegalCopy(locale: Locale): Promise<LegalCopy> {
  return (await import(`@/messages/legal/${locale}.json`)).default as LegalCopy;
}

/** Plain text; in Persian its Latin terms sit in <bdi> (LEG-16). */
function Iso({ text, locale }: { text: string; locale: Locale }) {
  return (
    <>{bidiParts(text, locale).map((part, index) => (part.latin ? <bdi key={index}>{part.text}</bdi> : part.text))}</>
  );
}

function Text({ text, locale }: { text: string; locale: Locale }) {
  return (
    <>
      {linkify(text).map((part, index) =>
        part.href ? (
          <a
            key={index}
            href={part.href}
            rel="noopener noreferrer"
            dir="ltr"
            className="break-all text-accent underline underline-offset-2"
          >
            {part.text}
          </a>
        ) : (
          <span key={index}>
            <Iso text={part.text} locale={locale} />
          </span>
        ),
      )}
    </>
  );
}

function Block({ block, copy, locale }: { block: LegalBlock; copy: LegalCopy; locale: Locale }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          <Text text={block.text} locale={locale} />
        </p>
      );
    case 'list':
      return (
        <ul className="flex list-disc flex-col gap-2 ps-5">
          {block.items.map((item) => (
            <li key={item}>
              <Iso text={item} locale={locale} />
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        // Focusable, so a keyboard can scroll a table wider than a phone (WCAG 2.1.1).
        <div
          tabIndex={0}
          className="overflow-x-auto rounded-control border border-edge focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <table className="w-full border-collapse text-start text-sm">
            <thead className="bg-surface">
              <tr>
                {block.head.map((cell) => (
                  <th
                    key={cell}
                    scope="col"
                    className="border-b border-edge px-3 py-2 text-start font-mono text-xs text-muted"
                  >
                    <Iso text={cell} locale={locale} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="align-top">
                  {row.map((cell, index) => (
                    <td key={index} className="border-b border-edge px-3 py-2">
                      {index < 2 ? (
                        <code dir="ltr" className="ao-tech font-mono text-xs whitespace-nowrap">
                          {cell}
                        </code>
                      ) : (
                        <Iso text={cell} locale={locale} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'contact':
      // The postal address and e-mail appear on these two pages only.
      return (
        <address className="not-italic">
          <span dir="ltr" className="block w-fit">
            {LEGAL_CONTACT.name}
          </span>
          <span dir="ltr" className="block w-fit">
            {LEGAL_CONTACT.street}
          </span>
          <span dir="ltr" className="block w-fit">
            {LEGAL_CONTACT.postcodeCity}
          </span>
          <span className="block">{copy.country}</span>
          <span className="mt-3 block">
            {copy.emailLabel}:{' '}
            <a href={`mailto:${LEGAL_CONTACT.email}`} dir="ltr" className="text-accent underline underline-offset-2">
              {LEGAL_CONTACT.email}
            </a>
          </span>
        </address>
      );
  }
}

/**
 * The Impressum or the Datenschutzerklärung. Not a placeholder: the text is
 * legal copy the owner verifies (CONTENT_REVIEW.md, "LEGAL – owner must
 * verify"). German is binding; the English and Persian pages say so and link
 * to it. A plain, server-rendered document in the `modern` theme - no journey
 * or desktop code loads here.
 */
export async function LegalPage({ locale, kind }: { locale: Locale; kind: LegalKind }) {
  const copy = await loadLegalCopy(locale);
  const document = copy[kind];
  const tSite = await getTranslations('site');
  const tNav = await getTranslations('nav');

  return (
    <div className="ao-site-page min-h-dvh bg-background text-ink">
      <UseTheme id="modern" />
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 pt-5 sm:px-8">
        <a href={viewHref(locale, 'landing')} aria-label={copy.backHome} className="rounded-control">
          <AmonelLogo uid={`ao-legal-logo-${kind}`} label={tSite('brand')} className="h-7 w-auto" />
        </a>
        <div className="flex items-center gap-1">
          <StaticLanguageSwitcher locale={locale} view={kind} />
          <SchemeToggle
            labels={{
              toLight: tNav('schemeToLight'),
              toDark: tNav('schemeToDark'),
            }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 pt-10 pb-12 font-body text-[0.95rem] leading-relaxed sm:px-8">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-4xl">
            <Iso text={document.title} locale={locale} />
          </h1>
          <p className="font-mono text-xs text-muted">{copy.updated}</p>
          {copy.bindingNote ? (
            <p className="rounded-control border border-edge bg-surface px-4 py-3 text-sm">
              <Iso text={copy.bindingNote} locale={locale} />{' '}
              <a
                href={viewHref('de', kind)}
                hrefLang="de"
                lang="de"
                className="text-accent underline underline-offset-2"
              >
                {copy.bindingLink}
              </a>
            </p>
          ) : null}
        </div>

        {sectionsFor(document, 'site').map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-bold">
              <Iso text={section.heading} locale={locale} />
            </h2>
            {section.blocks.map((block, index) => (
              <Block key={index} block={block} copy={copy} locale={locale} />
            ))}
          </section>
        ))}

        <p>
          <a href={viewHref(locale, 'landing')} className="font-mono text-sm text-accent underline underline-offset-4">
            {copy.backHome}
          </a>
        </p>
      </main>

      <SiteFooter locale={locale} t={tNav} className="mx-auto w-full max-w-3xl border-t border-edge px-5 py-5 sm:px-8" />
    </div>
  );
}
