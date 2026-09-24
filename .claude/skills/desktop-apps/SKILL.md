---
name: desktop-apps
description: "Read before touching the Amonel OS desktop (Act 3): src/components/os/, src/components/apps/, the window manager, taskbar, launcher, mobile home screen, the app registry, or any app (About, Terminal, Tickets, Traceroute, Assistant, Computer-Quiz, Contact, Timeline, CV, bonus apps) and its per-app copy."
---

### Act 3 — Amonel OS

A fully interactive desktop operating system. Draggable windows on desktop,
fullscreen apps on mobile. Portfolio sections are applications. Puzzles solved
in Act 1 unlock extra apps.

## The desktop (Act 3, Phase 6)

`src/components/os/` and `src/components/apps/`. Read DECISIONS.md 49 first.

- **Its own route, `/desktop/`,** in the `modern` theme (or the Time Machine's era, APP-05), with only the `site`,
  `nav`, `languages` and `os` messages. It must never import GSAP, Lenis, an era
  or a puzzle - `desktop.mjs` checks every loaded script for them.
- **The hand-over is one picture.** `DesktopFrame` is the Convergence's last frame
  and the desktop's first; both render it, so never draw the empty desktop twice.
  The server paints only the frame; the shell is client-only
  (`DesktopShellLoader`, `next/dynamic` with `ssr: false`) and fades in over it
  (`data-shell-ready`). `navigation.mjs` compares the two frames pixel by pixel.
- **The end of the journey** fades the journey chrome (`data-handover`) and
  replaces the entry with `/desktop/`, so Back never lands on the journey's end
  and bounces forward again. Zum Desktop pushes, so Back returns to the era.
- **Returning visitors** (`hasCompletedJourney`, set on arriving at the desktop):
  an inline `<head>` script on the journey redirects a real navigation (never
  Back, forward or reload) unless the tab asked to replay - `allowJourneyReplay()`
  from "Reise erneut ansehen" and the mode cards (`lib/returning.ts`). The landing
  page's `DesktopCta` keeps one fixed-height slot, so switching to "Zum Desktop"
  shifts nothing; the mode cards step back by colour only.
- **Which shell:** `(min-width: 768px) and (pointer: fine)` gets the window
  manager, everything else the home screen (`use-shell-layout.ts`).
- **Windows** (`store/window-store.ts`, not persisted): one per app, logical
  geometry (`x` is the inline-start offset) so Persian mirrors, clamped to the
  area between the top strip and the taskbar. Pointer events for drag and
  resize, so mouse, touch and pen share one path. Non-modal dialogs; every
  action goes through `window-actions.ts`, which owns focus: into a window when
  it opens, back to its opener when it closes, to its taskbar button when it
  minimises.
- **Keyboard:** the focused title bar moves with the arrows, resizes with
  Shift+arrows and maximises with Enter; Alt+Shift+Right/Left cycles windows
  (not claimed by browsers or the OS, and skipped inside text fields).
- **Z-order** uses the scale: windows in `--ao-z-windows` (+ rank), the focused
  one at `--ao-z-window-active`, taskbar `--ao-z-taskbar`, launcher and notices
  `--ao-z-modal`.
- **Mobile:** apps open fullscreen and push a history entry (`__aoApp`, keeping
  the router's state), so Back closes them. Never touch `scrollRestoration`.
- **Apps** are rows in `apps/registry.ts` (id, kind, title key, default size,
  lazy component; the glyph lives in `icons.tsx`). Phase 7 replaces a base app's
  component in its folder; the window stays. Locked bonus apps stay visible,
  dimmed with a padlock; opening one shows the notice: what the app is
  (`os.apps.<id>.description`), which era unlocks it (`unlock.ts`; the last era
  is "today", never a year), that the journey's end unlocks all, and a button
  to `/amonel/#era-N` (a replay, so no returning-visitor redirect). The
  registry's `unlockedBy` is derived from `eras.ts`; never type the mapping twice.
- **Zustand selectors must return stable values.** A selector that builds a new
  array of new objects never compares equal and re-renders forever (React error
  185) - select the store's own objects, or primitives.
- Legende badges are read through `selectLegendEras` and displayed in Phase 9.
- **Brand (Phase 9A, DECISIONS.md 54):** the OS is "Amonel OS". Its lockup
  (`AmonelOsLockup` from `ui/Brand.tsx`) sits in the desktop and home-screen
  top bars and above the Terminal's greeting; the launcher button shows the
  mark alone; the About tile wears the glass icon (`BRAND_TILE_APP` in
  `AppIcon.tsx`). Taskbar window buttons keep the line glyphs.

## The apps (Act 3, Phase 7)

About, Terminal, Tickets, Traceroute, (Phase 7/8) the Assistant and (Phase 9B)
the Computer-Quiz are real; Contact, Timeline and CV are real (the CV with marked placeholder entries).
Read DECISIONS.md 50 first, 53 for the Assistant and 55 for the quiz.
The bonus apps (Phase 9D-1): Binary & Morse, Snake and Pixel Paint are real;
Network tools and the Time Machine too (9D-2, DECISIONS.md 63 and 64: `network/net.ts`, data in
`content/network.ts`; ping and DNS are labelled simulations over the
Traceroute routes and `.example` names, never a real request; the Time Machine
only calls the theme store, and only the desktop reads `amonel.theme.v1`
through `DesktopTheme`); the scheduler and the
file tree share the stand-in (`bonus/BonusApp.tsx`). Read
DECISIONS.md 57.

- **Bonus apps follow the same rules as base apps** (own chunk, own copy,
  pure tested logic in `binary/codec.ts`, `snake/game.ts`, `paint/paint.ts`),
  plus: nothing plays or flashes unasked (Morse sound and light only on a
  click; the light stays under 3 flashes a second, tested); under reduced
  motion no light, a static timeline; a game pauses when the tab hides, the
  browser window blurs or another window takes focus.
- **A canvas reads its colours from tokens** (`--ao-snake-*` in
  `globals.css`, resolved through a hidden probe element), never from
  literals. Pixel Paint's palettes are the picture's data and are computed
  from the hardware rules, not typed as colour values.
- **Game and drawing gestures:** the surface gets `touch-action: none`
  (`.ao-snake-board`, `.ao-paint-canvas`) so it never scrolls the page; pointer
  events serve mouse, touch and pen; `capture()` from `use-app-input.ts`
  guards `setPointerCapture`, which throws for a pointer the browser no
  longer tracks. Boards and canvases are never mirrored in Persian.
- **Storage:** Snake's best score (`amonel.snake.v1`) and Paint's picture
  (`amonel.paint.v1`, only after a change, at most 16 KB) - fail-safe through
  `lib/safe-storage.ts`. A new key goes into `STORAGE_KEYS`, the
  `deployment-legal` table and TODO.md together.
- **Numbers in copy** use `{n, number}` or plural `#`: a bare `{n}` is
  stringified and shows Latin digits in Persian.
- **The Terminal's `HIDDEN_COMMANDS`** (`terminal/shell.ts`, filled in APP-08, DECISIONS.md 68) holds
  the easter eggs: answered like any command, never in `help` or Tab; own ASCII art only.

- **The Assistant** (`apps/assistant/`) is a local search over `src/content/`,
  built by `src/lib/search/` and run entirely in the visitor's browser. It talks
  to no server and no external AI service - `worker/` holds only the anonymous
  counters (Phase 9C, see the `deployment-legal` skill), which the Assistant
  never calls. It normalises the question, matches it against an
  index built from the About data, career stations, skills, projects, tickets
  and the seven era truths in the visitor's own language, and returns the best
  passages, each labelled with its source ("from About", "from the 1971 era",
  a ticket's number). A question that matches nothing gets an honest "I can't
  answer that" and the example questions again - never a guess. Its logic
  (`assistant.ts`, `src/lib/search/`) is pure and tested; its phases (idle,
  searching, answered, noMatch) each have copy in
  `messages/apps/assistant/<locale>.json`, and the root carries
  `data-assistant-state` for the checks. Under reduced motion an answer is
  simply there. The app presents itself honestly as a search, never as an AI,
  and the privacy line says nothing a visitor types ever leaves the device -
  keep that true of both the app and the Datenschutzerklärung.
- **The Computer-Quiz** (`apps/quiz/`, Phase 9B, DECISIONS.md 55) is a base
  app, on the desktop, home screen and launcher but not in the dock (the dock
  is for recruiters). Ten questions a round from the bank in
  `src/content/quiz.ts` (structure) and `messages/apps/quiz/` (every word);
  `quiz.ts` picks the round (every era once before any twice), shuffles the
  options and scores it, pure and tested in `scripts/test/quiz.test.mjs`.
  Rules: **never an IQ, intelligence or aptitude test**, in name or copy - it
  measures knowledge of computer history and basics, and the result lines talk
  about the round, never the visitor (the test rejects such words). Every
  question goes back to one era's one truth and every explanation names its
  era. Right and wrong are words plus a tick or cross, never colour alone; one
  live region announces verdicts and the score; option labels are `<bdi>`, and
  any option whose meaning depends on order uses Persian digits and "،" in fa.
  The best score is one number in `amonel.quiz.v1` (`store/quiz-store.ts`);
  add any new key to the storage list in the `deployment-legal` skill. The
  Assistant's search must never import the quiz or its copy - the test checks.
- **`apps/use-app-input.ts`** holds what any app with a text field needs:
  `useKeyboardInset`, `useNativeKeydown` (the input handles its keys itself so
  the desktop's Alt+Shift+Arrow listener never sees them) and
  `useFocusOnFinePointer`. Use them; do not copy them.
- **The journey's mount point** (`data-assistant-mount`, in EraCloud) shows a
  picture of a prompt plus `AssistantTeaser`, a client-only line to the desktop.
  Nothing about the assistant may be in the journey's or the landing page's
  static HTML: the teaser renders an empty box and loads its line when near.

- **An app is its own lazy chunk, with its own copy.** Its words live in
  `messages/apps/<app>/<locale>.json`, never in the `os` namespace (which the
  desktop serialises into its HTML). `AppMessages` loads the file with the app
  and exposes it under the app's id: `useTranslations('tickets')`. The page
  message imports exclude `messages/apps/` (`webpackExclude`). Add a new id to
  `AppCopyId`.
- **Content is typed data** in `src/content/` (`about.ts`, `projects.ts`,
  `tickets.ts`, `routes.ts`): ids, structure and machine text. Every word a
  visitor reads is in the app's messages under the same ids.
- **Logic lives in pure modules** (`terminal/shell.ts`, `traceroute/trace.ts`)
  with only `import type`, so `npm test` runs them in plain node, which strips
  the types. `scripts/test/` also checks the copy has the same keys in all three
  languages, "Sie" not "du", and the data's honesty (below).
- **Never invent a fact about Ahmadreza.** What he has not supplied is `null` in
  content and renders as a visibly marked placeholder ("Angabe folgt"); TODO.md
  lists each. No skill levels, no percentages. The employer is never named
  (LEG-08); the place of the apprenticeship is just "Trier".
- **Tickets are fiction and say so:** Talweber Logistik, `.example` names,
  10.20.0.0/16. The test rejects Trier, the employer's name and IT-HAUS in them.
  Commands and their output are real and exact.
- **Traceroute is a labelled simulation** over prepared routes from an assumed
  home line in Frankfurt, with documentation addresses (RFC 5737, `.example`,
  `home.arpa`). Times are honest: never faster than light in fibre (1 ms round
  trip per 100 km), never falling by more than probe jitter - tested.
- **Machine text is English and LTR** (shell output, commands, consoles, hop
  lines, host inputs pin `dir="ltr"`); prose inside it gets its own
  `dir="auto"` paragraph or a `<bdi>`.
- **An input that answers keys handles them natively on the field.** Next
  hydrates the whole document, so React's `onKeyDown` runs on the document -
  the node the desktop's Alt+Shift+Arrow listener is on - and its
  `stopPropagation()` cannot stop that listener. The Terminal attaches its
  keydown to the input and stops what it handles there. Tab completes only on a
  non-empty line, so Tab still leaves the field.
- **Phone keyboards:** the desktop view sets `interactive-widget=resizes-content`
  (Android shrinks the page), and the Terminal lifts its input by the visual
  viewport's covered height (Safari). Focus an input on mount only with a fine
  pointer, or the keyboard jumps up unasked.
- **An app lays itself out against its window,** not the viewport: container
  queries (`@container`, `@min-[480px]:`) or a ResizeObserver on the
  `[data-window-body]`. One scrolling column when small, own scroll areas only
  when there is room (Tickets: two panes from 640 x 320).
- **Scroll the window body by hand** (`scrollTop`), never `scrollIntoView`: it
  would scroll the desktop behind the window too.
- **Motion in apps follows the tiers:** the desktop view now runs the tier
  script too. Full tier adds glow and pulse, light keeps the step-by-step
  reveal, reduced motion shows the finished frame.
