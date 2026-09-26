'use client';

import type { AbstractIntlMessages } from 'next-intl';

import { Shell } from '@/components/os/Shell';
import { IntlProvider } from '@/components/i18n/IntlProvider';

/** The desktop shell with its message provider, in the shell's own chunk. */
export default function ShellRoot({ locale, messages }: { locale: string; messages: AbstractIntlMessages }) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <Shell />
    </IntlProvider>
  );
}
