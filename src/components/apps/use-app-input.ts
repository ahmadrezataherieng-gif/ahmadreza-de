'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * What an app with a text field needs to behave on every device. The Terminal
 * and the Assistant share it; both were written against the same three traps.
 */

/**
 * How far an on-screen keyboard covers the bottom of the layout.
 *
 * Android Chrome shrinks the page itself (the desktop view asks for
 * `interactive-widget=resizes-content`), which leaves nothing covered. Safari
 * on iOS keeps the layout and overlays the keyboard; the visual viewport says
 * by how much, and the app lifts its input by that.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop)));
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    update();
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, []);
  return inset;
}

/**
 * A precise pointer gets the cursor straight away. On a touchscreen that would
 * throw the keyboard over the screen before the visitor asked for it.
 */
export function useFocusOnFinePointer(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) ref.current?.focus({ preventScroll: true });
  }, [ref]);
}

/**
 * Keys a field answers, attached to the field natively, not through React.
 * Next hydrates the whole document, so React's own listener sits on the
 * document - the same node as the desktop's Alt+Shift+Arrow listener - and
 * could not stop it. Stopped at the field, a handled key never gets there.
 * The handler is read through a ref, so it may close over fresh state every
 * render without the listener being re-attached.
 */
export function useNativeKeydown(ref: RefObject<HTMLElement | null>, handler: (event: KeyboardEvent) => void): void {
  const latest = useRef(handler);
  useLayoutEffect(() => {
    latest.current = handler;
  });
  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    const listener = (event: KeyboardEvent) => latest.current(event);
    field.addEventListener('keydown', listener);
    return () => field.removeEventListener('keydown', listener);
  }, [ref]);
}
