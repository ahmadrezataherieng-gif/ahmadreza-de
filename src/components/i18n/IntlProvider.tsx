import type { ReactNode } from 'react';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';

/**
 * The client message provider, in a module of its own, imported only by the
 * journey's and the desktop shell's own chunks (`JourneyRoot`, `ShellRoot`), the
 * two views with client components that read messages. The static pages never
 * load it, and with it
 * the message formatter (15 kB gzip) stays out of their scripts (queue 3c).
 * The time zone is named because the server-side provider used to pass one in
 * (the build machine's); nothing here formats a date through next-intl.
 */
export function IntlProvider({ locale, messages, children }: { locale: string; messages: AbstractIntlMessages; children: ReactNode }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Berlin">
      {children}
    </NextIntlClientProvider>
  );
}
