/**
 * Loads one locale's passages for the local search (Phase 8B, DECISIONS.md
 * 53). The four JSON files it imports are the same per-app copy files About,
 * Terminal and Tickets already load with `AppMessages` - a dynamic `import()`
 * per locale, so webpack code-splits by locale and the Assistant's chunk
 * never carries the other two languages. Cached per locale: opening the
 * Assistant twice, or after About/Terminal/Tickets already pulled their own
 * copy, costs nothing more.
 */

import type { AssistantLocale } from '@/lib/assistant-limits';
import { buildPassages, type PassageSources } from './passages.ts';
import type { Passage } from './types.ts';

const cache = new Map<AssistantLocale, Promise<Passage[]>>();

interface AssistantCopy {
  eras: PassageSources['eras'];
  keywords: PassageSources['keywords'];
  contactSentence?: string;
}

export function loadPassages(locale: AssistantLocale): Promise<Passage[]> {
  let pending = cache.get(locale);
  if (!pending) {
    pending = Promise.all([
      import(`@/messages/apps/about/${locale}.json`) as Promise<{ default: PassageSources['about'] }>,
      import(`@/messages/apps/terminal/${locale}.json`) as Promise<{ default: PassageSources['terminal'] }>,
      import(`@/messages/apps/tickets/${locale}.json`) as Promise<{ default: PassageSources['tickets'] }>,
      import(`@/messages/apps/assistant/${locale}.json`) as Promise<{ default: AssistantCopy }>,
    ]).then(([about, terminal, tickets, assistant]) =>
      buildPassages({
        about: about.default,
        terminal: terminal.default,
        tickets: tickets.default,
        eras: assistant.default.eras,
        keywords: assistant.default.keywords,
        contactSentence: assistant.default.contactSentence ?? null,
      }),
    );
    cache.set(locale, pending);
  }
  return pending;
}
