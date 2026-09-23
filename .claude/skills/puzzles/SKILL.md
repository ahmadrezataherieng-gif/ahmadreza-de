---
name: puzzles
description: "Read before touching any puzzle, the puzzle engine or shell, a gate, Zum Desktop, the Guided/Play mode switch, unlocks, artifacts or Legende badges, or era copy (the one truth and the insider detail of each era). Holds the puzzle rule: a puzzle never blocks without a one-click way through."
---

## The purpose: rules that follow from it

Rules that follow from it:

- **The era copy, the puzzle and the success message all serve that era's one
  truth.** If copy wanders into trivia that does not serve it, cut it.
- The truth lives in `eras.<id>.description` in `messages/`. It is shown in the
  era's puzzle segment and in the static SEO list, so it is always in the HTML.
- **Every era has one insider detail** (`eras.<id>.insider`): something only a
  real user of that system would know — a shortcut, a quirk, a trick of the
  period. It rewards the knowledgeable without confusing anyone else. **It must
  be factually true and sourced.** Never invent period detail. The sources for
  the current seven are recorded in DECISIONS.md entry 32.
- **Where it can be done honestly, the insider detail is a working trick in the
  puzzle** (DECISIONS.md 40): 1946 the deck's diagonal line, 1956 sense switch 3,
  1971 `chdir`, 1981 F3, 1995 `winipcfg`. 1984 and today stay text. A trick is
  never required, gets a subtle cue rather than an explanation, and earns a
  hidden "Legende" badge (`legendEras`). The insider note appears once the trick
  was used or the puzzle ended.

## Two viewing modes: what the rule means in practice

- The choice is made on the landing page, survives a reload, and can be switched
  at any time from a persistent control without losing scroll position.
- Guided mode offers "I'll try this one myself" on each puzzle, which switches
  that puzzle — and from then on the mode — to interactive.
- Watch mode never gates and keeps a Skip per puzzle. Play mode has no Skip:
  "Lösung zeigen" plays the solution and opens the gate (without the artifact).
  Switching to Watch removes every gate at once, without moving the page.
- `prefers-reduced-motion` renders finished frames in both modes.

## The puzzle rule — never violate it

**A puzzle never blocks without a one-click way through. Zum Desktop is always
available.**

- Watch mode never gates. Play mode gates each era, and "Lösung zeigen" is always
  one click away - in the puzzle and on the lock cue at the gate.
- **Zum Desktop** and the mode switch work at every point in Act 1 and are never
  blocked. Zum Desktop goes to `/desktop/` through `leaveForDesktop()`, which
  lets a held puzzle drop its history entry first; the mode switch calls
  `requestPuzzleRelease()`.
- A gate is always visible (the lock cue), never a silent scroll stop, and never
  traps keyboard or screen-reader users.
- Returning visitors go **straight to the desktop**: a direct visit to the
  journey redirects there, and the landing page leads with "Zum Desktop"
  (DECISIONS.md 49).
- Solving a puzzle unlocks a bonus app. A shown solution opens the gate only.
- **Recruiters must never be stuck behind a game.**

## The unlock mechanic

Solving era *N*'s puzzle awards an **artifact**, and each artifact unlocks
exactly one **bonus app** on the Amonel OS desktop. Base apps (About, Terminal,
Tickets, Traceroute, Assistant, Contact, Timeline, CV) are always available to
everyone. The mapping lives in `src/content/eras.ts`; the state lives in
`src/store/unlock-store.ts` and is persisted to `localStorage`.

### Puzzles (Phase 5)

`src/components/puzzles/`. Read DECISIONS.md 36–40 before changing anything here.

- **One engine, one shell.** A puzzle is a `PuzzleDefinition` (`initial`, pure
  `reduce`, `isSolved`, `script`) plus one component that renders state from
  `usePuzzleEngine`. It receives a *presentation* (`play`, `guided`, `final`),
  never the mode. Only `PuzzleShell` reads the mode. Never write a guided and an
  interactive version of anything.
- Every element a script points at carries `data-target` (use `target(id)`).
  Controls take `tabIndex={-1}` outside `play`; the shell also makes the guided
  demonstration `inert`.
- Guided playback and "Lösung zeigen" never award artifacts or badges. Only an
  interactive solve calls `solvePuzzle`; a shown solution calls `revealPuzzle`,
  which opens the gate only. Tricks are reported through the definition's
  `usedTrick`, in play only.
- **Gates** (`gate.ts`, `PuzzleGate.tsx`): the resolver calls `measureGates` and
  `tickGate`; the page end is set with `setScrollLimit()` in lenis-controller.
  Never clamp the scroll position by hand, never add a per-section trigger for
  a gate, and keep the lock cue outside the inert sections.
- **Scroll hold:** interactive puzzles are played in `HeldDialog`, which holds the
  page through `holdScroll()`/`releaseScroll()` (lenis-controller), makes
  `#journey-scenes` inert, traps focus, closes on Escape and on browser Back.
  Anything outside the scenes that must work while held (Skip to Desktop, the
  mode switch) calls `requestPuzzleRelease()` first. Keep the chrome above the
  dialog's z-index.
- Puzzle UI and the `puzzles` messages are **never** in the static HTML:
  `PuzzleSlot` mounts the shell client-side within one era of the active one,
  and `PuzzleMessages` loads the locale file into a nested provider.
- Puzzle copy per puzzle: `title`, `invitation`, `task`, `hint`, `answer`,
  `success` (which states the era's truth), `skip` (Watch mode). Machine text
  (shell output, IP addresses, DOS replies) is English and LTR in every locale.
- Test hooks: `data-action` on shell, cue and chrome controls, `data-target` on
  everything a script points at. `scripts/verify/journey.mjs` relies on them.
- Wrong answers must fail for the real reason. Put domain logic in pure modules
  (`ipv4.ts`, `shell-filesystem.ts`) and test it with plain node.
- Scroll the puzzle's own containers by hand; never `scrollIntoView` inside the
  journey, it scrolls the document too.
- **Never put `data-lenis-prevent` on anything that covers a stage.** Lenis
  ignores every wheel event inside it, and with `overscroll-behavior: contain`
  the page cannot scroll at all (DECISIONS.md 47). Lenis runs with
  `allowNestedScroll`, so an overflowing card scrolls by itself. Layers that
  cover the stage while invisible take no pointer events (`data-puzzle-live`).
- **A check about input must first prove the input moves the page.** Headless
  Chrome ignores `Input.synthesizeScrollGesture`; `swipe()` in `cdp.mjs` sends
  real wheel notches and touch sequences.
- **Decide a drop where the pointer is released**, from the `pointerup` event's
  own coordinates - never from state set by the last `pointermove`. A quick
  release can arrive before React renders that move, and on a busy frame the
  item silently fails to drop.
- **Do not use `next/dynamic` for anything server-rendered inside the journey
  tree** — its server-only preloader shifts `useId` and breaks hydration. Use
  `React.lazy` (as `JourneyLoader` does); `next/dynamic` with `ssr: false` is fine
  for client-only islands.
