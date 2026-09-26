'use client';

import type { AbstractIntlMessages } from 'next-intl';

import { Journey } from '@/components/journey/Journey';
import { IntlProvider } from '@/components/i18n/IntlProvider';

/** The journey with its message provider, in the journey's own lazy chunk. */
export default function JourneyRoot({ locale, messages }: { locale: string; messages: AbstractIntlMessages }) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <Journey />
    </IntlProvider>
  );
}
