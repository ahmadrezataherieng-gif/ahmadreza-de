'use client';

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { holdScroll, releaseScroll } from '@/lib/lenis-controller';
import { JOURNEY_SCENES_ID, registerPuzzleRelease } from '@/components/puzzles/hold';

interface HeldDialogProps {
  label: string;
  /** Asked to close: Escape, the browser's back button, or Skip to Desktop. */
  onRequestClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const HISTORY_KEY = 'aoPuzzle';

/** Whether a held dialog is mounted right now; at most one ever is. */
let dialogMounted = false;

/** The scroll restoration mode of the entry a held dialog was opened from. */
let baseRestoration: ScrollRestoration = 'auto';

/**
 * A puzzle being played: the page held still behind a modal dialog.
 *
 * Mounting holds; unmounting releases, whatever caused it. The dialog
 * - stops Lenis and native scrolling, keeping the scroll position,
 * - makes the scenes inert, but not the journey chrome, so Skip to Desktop
 *   stays one click away (the dialog sits below the chrome's z-index),
 * - traps Tab focus and returns focus to where it came from,
 * - closes on Escape,
 * - pushes a history entry, so the browser's back button closes the puzzle
 *   instead of leaving the journey.
 *
 * See DECISIONS.md 36.
 */
export function HeldDialog({ label, onRequestClose, children }: HeldDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestClose = useRef(onRequestClose);
  useEffect(() => {
    requestClose.current = onRequestClose;
  }, [onRequestClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scenes = document.getElementById(JOURNEY_SCENES_ID);

    holdScroll();
    scenes?.setAttribute('inert', '');

    // The puzzle arrives in its own chunk, possibly after the dialog opens: if
    // it asks for focus (a prompt, a first field), hand it over when it lands -
    // unless the visitor has already moved focus themselves.
    const autofocus = () => dialog?.querySelector<HTMLElement>('[data-autofocus]') ?? null;
    (autofocus() ?? dialog)?.focus({ preventScroll: true });
    const arrival = new MutationObserver(() => {
      const element = autofocus();
      if (!element) return;
      arrival.disconnect();
      if (document.activeElement === dialog) element.focus({ preventScroll: true });
    });
    if (dialog && !autofocus()) arrival.observe(dialog, { childList: true, subtree: true });

    // Back closes the puzzle. The entry keeps the URL and whatever state the
    // router stored, so returning to the previous entry is a no-op for Next.
    // A remount (React's development double-invoke) finds its entry still on
    // top and reuses it instead of stacking another.
    const current = window.history.state as Record<string, unknown> | null;
    const reused = current?.[HISTORY_KEY];
    const token = typeof reused === 'string' ? reused : `${Date.now()}`;
    if (typeof reused !== 'string') {
      // Scroll restoration is stored per history entry. The entry we return to
      // must not restore: the visitor may be on the way to the next era by
      // then, or content above may have changed height since.
      baseRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      window.history.pushState({ ...current, [HISTORY_KEY]: token }, '', window.location.href);
    }
    const restoreRestoration = () => {
      window.history.scrollRestoration = baseRestoration;
    };
    dialogMounted = true;

    let poppedByBrowser = false;
    const onPopState = () => {
      const state = window.history.state as Record<string, unknown> | null;
      if (state?.[HISTORY_KEY] === token) return;
      poppedByBrowser = true;
      restoreRestoration();
      requestClose.current();
    };
    window.addEventListener('popstate', onPopState);

    const unregister = registerPuzzleRelease(() => requestClose.current());

    return () => {
      dialogMounted = false;
      arrival.disconnect();
      unregister();
      window.removeEventListener('popstate', onPopState);
      // Closed from inside the page: drop the entry again, so Back is not a
      // dud. Deferred, so an immediate remount can claim the entry instead.
      window.setTimeout(() => {
        const state = window.history.state as Record<string, unknown> | null;
        if (dialogMounted || poppedByBrowser || state?.[HISTORY_KEY] !== token) return;
        window.addEventListener('popstate', restoreRestoration, { once: true });
        window.history.back();
      }, 0);

      scenes?.removeAttribute('inert');
      releaseScroll();
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestClose.current();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => element.getClientRects().length > 0,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      return;
    }
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--ao-z-taskbar)] overflow-y-auto overscroll-contain"
      data-lenis-prevent=""
    >
      <div className="ao-puzzle-dialog-scrim fixed inset-0" aria-hidden="true" />
      {/* Room at the top for the fixed mode switch and Skip to Desktop, and at
          the bottom on phones for the language switcher. */}
      <div className="relative flex min-h-full items-start justify-center px-3 pt-16 pb-20 sm:px-6 md:items-center md:pb-8">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="ao-themed relative flex w-full min-w-0 max-w-3xl flex-col gap-4 rounded-window border border-edge bg-surface p-4 text-ink shadow-window outline-none sm:p-6"
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
