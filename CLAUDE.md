# AhmadOS — Portfolio of Ahmadreza Taheri

Everything a future session needs is in this file. Read it before touching code.

## Who this is for

Ahmadreza Taheri, IT professional in Germany, currently in a
*Fachinformatiker für Systemintegration* apprenticeship at Stadtverwaltung
Trier. The site exists to **get him hired** and to **rank first for his name**.
Every technical decision is subordinate to those two goals. When a choice trades
a nice interaction against discoverability or against a recruiter's time, the
recruiter wins.

## The purpose beyond the portfolio

Most people use computers every day without knowing how they work. **This site
teaches that, through history, while introducing Ahmadreza.** It is not a museum
of anecdotes: every era carries **one mechanical truth** about computing that the
visitor can still use today.

| Era | The one truth |
|---|---|
| 1946 | Text is numbers. Every character is a pattern of on and off. |
| 1956 | A computer hates waiting. Scheduling is why operating systems exist. |
| 1971 | A filesystem is a tree, and every file has a path. |
| 1981 | Memory is finite, and that limit shapes what software can do. |
| 1984 | Pointing is easier than remembering. That is the whole idea behind every interface since. |
| 1995 | A network needs addresses. Without them a machine cannot find another machine. |
| Today | Programs run isolated from each other, in many places at once. |

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

## Two viewing modes, one codebase

The visitor chooses how to experience the journey:

- **Guided** — the visitor watches. Every puzzle solves itself on screen: a
  simulated pointer moves, clicks and types at a readable pace, driven by scroll
  progress. The visitor only scrolls. For someone with two minutes.
- **Interactive (Play)** — the visitor plays. Each era's puzzle is a gate: the
  page does not scroll past it until the puzzle is solved or its solution shown.
  Every puzzle offers "Hinweis" and "Lösung zeigen" from the first moment. For
  someone with fifteen minutes.

**The architectural rule, never violate it: ONE set of scenes with a mode flag,
NOT two implementations.** Never duplicate an era or a puzzle per mode. If you
find yourself writing the same scene twice, stop and restructure.

- The mode is a single persisted value in the unlock store. Only the puzzle layer
  reads it; **era visuals never know which mode is active.**
- The choice is made on the landing page, survives a reload, and can be switched
  at any time from a persistent control without losing scroll position.
- Guided mode offers "I'll try this one myself" on each puzzle, which switches
  that puzzle — and from then on the mode — to interactive.
- Watch mode never gates and keeps a Skip per puzzle. Play mode has no Skip:
  "Lösung zeigen" plays the solution and opens the gate (without the artifact).
  Switching to Watch removes every gate at once, without moving the page.
- `prefers-reduced-motion` renders finished frames in both modes.

## The concept: "AhmadOS — 80 Years in 90 Seconds"

Three acts.

### Act 1 — The Journey

A scroll-driven trip through seven eras of computing history. The governing
principle: **the site's own interface evolves era by era**. Each era introduces a
UI element that persists afterwards — first lamps, then printed text, then a
cursor you can type at, then a mouse pointer, then windows, then a taskbar.

Each era contains an **optional** interactive puzzle that teaches a real
computing concept.

### Act 2 — The Convergence

At the end of the timeline all seven eras visually compile together into the
modern desktop, with a boot log listing each era as a loaded component.

### Act 3 — AhmadOS

A fully interactive desktop operating system. Draggable windows on desktop,
fullscreen apps on mobile. Portfolio sections are applications. Puzzles solved
in Act 1 unlock extra apps.

## The seven eras

| # | Year | Subject | UI introduced | Puzzle | Teaches |
|---|------|---------|---------------|--------|---------|
| 1 | 1946 | ENIAC and punch cards | Blinking lamps only, no screen | A moth on a misencoded card: punch the fault out and the name is built from the bits | Binary and character encoding |
| 2 | 1956 | Mainframes, the first OS, batch processing | A teletype printing text line by line onto paper | Reorder batch jobs to minimise total waiting time | Scheduling, and why operating systems exist |
| 3 | 1971 | UNIX | Green phosphor CRT, scanlines, blinking cursor. **First era where the user can type.** | Navigate a simulated filesystem with `cd`/`ls`/`cat` to find a hidden file | The filesystem tree and paths |
| 4 | 1981 | IBM PC and MS-DOS | `C:\>` prompt, amber on black | Fit a set of programs into 640 KB of memory | Memory constraints |
| 5 | 1984 | Macintosh | **The mouse cursor appears for the first time**, plus the first window and 1-bit pixel art | A drag-and-drop task | The WIMP paradigm and the origin of keyboard shortcuts |
| 6 | 1995 | Windows 95 and dial-up internet | Taskbar and start menu | Configure IP address, subnet mask and gateway to get connected | Subnetting fundamentals |
| 7 | Today | Cloud, containers, AI | Dark mode and dashboards | Find the broken firewall rule and open the correct port | Ports and firewall basics |

The canonical machine-readable version of this table is `src/content/eras.ts`.
Keep the two in sync.

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
exactly one **bonus app** on the AhmadOS desktop. Base apps (About, Terminal,
Tickets, Traceroute, Assistant, Contact, Timeline, CV) are always available to
everyone. The mapping lives in `src/content/eras.ts`; the state lives in
`src/store/unlock-store.ts` and is persisted to `localStorage`.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15, App Router, `output: 'export'` |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) |
| i18n | next-intl v4, no middleware (static export) |
| Animation | GSAP + ScrollTrigger (scroll); framer-motion installed for Phase 6, unused so far |
| Smooth scroll | Lenis |
| State | zustand (+ `persist` for unlocks) |
| Fonts | `@fontsource*` packages, **self-hosted** |
| Hosting | **Cloudflare Workers with static assets**, GitHub-connected |
| AI (Phase 8) | **Google Gemini**, behind a server-side Cloudflare proxy |

### Deployment — Cloudflare, not a VPS

The site deploys to **Cloudflare Workers with static assets**, connected to the
public GitHub repo through Workers Builds. It is **not** a Cloudflare Pages
project: Cloudflare folded Pages into Workers during 2026, and while Pages is
still supported, all new investment goes to Workers and a new account may not
show a Pages tab at all.

Earlier drafts of this project specified nginx on a self-managed VPS. That is
reversed. **Do not reintroduce nginx, systemd or server backups** anywhere.

- `wrangler.jsonc` — `assets.directory: "./out"`, no Worker script, so this
  stays a pure static deploy. `html_handling: "auto-trailing-slash"` matches
  `trailingSlash: true`; `not_found_handling: "404-page"` serves Next's
  `404.html` with a real 404 status.
- `public/_headers` — security headers. Next copies `public/` verbatim into the
  export, so these land at `out/_headers`, where Cloudflare reads them. No
  Content-Security-Policy yet; that arrives in Phase 11 once every external
  origin is known.
- `public/_redirects` — `301 /de/ → /`. This is what used to be an nginx rule.
- Custom domain is **ahmadreza.de**. Workers custom domains require the zone's
  nameservers to be managed by Cloudflare — a CNAME from an external DNS
  provider is not enough, unlike Pages.
- `npm run build` must keep producing nothing but a static `out/` directory.
  Nothing in the application code may know it is running on Cloudflare.

### The Gemini API key — absolute rule

Phase 8's assistant uses the Google Gemini API through a server-side Cloudflare
function. **The API key lives only in a Cloudflare environment variable.** It
must never appear in client-side code, in a `NEXT_PUBLIC_*` variable, in a
committed `.env`, or in any other committed file. **The GitHub repository is
public**, so a key that is pushed once is compromised immediately, is billable,
and survives in the git history after deletion. If it ever lands in a commit,
rotate it rather than trying to rewrite history.

### Fonts — legal requirement, not a preference

Fonts must **never** be loaded from the Google Fonts CDN at runtime. German case
law treats that as a GDPR violation. All faces come from `@fontsource` packages
and are served from our own domain. Never add a `fonts.googleapis.com` link, a
`next/font/google` import, or any other runtime font fetch.

Installed families:

- `@fontsource/jetbrains-mono` — OS chrome, terminal, UI labels
- `@fontsource/inter` — prose in German and English
- `@fontsource-variable/vazirmatn` — all Persian text
- `@fontsource/vt323` — retro terminal eras
- `@fontsource/press-start-2p` — 8-bit and pixel-art eras

**Press Start 2P has only ~220 glyphs.** Before any string is set in it, it must
pass `npm run check:pixel-font`, which reads the font's real glyph table (a CSS
`unicode-range` is not proof of a glyph). Add every new pixel-font message key
to `PIXEL_KEYS` in `scripts/check-pixel-font.mjs`. If a character is missing,
change the copy — never accept a fallback glyph. Persian is never set in the
pixel face; for `fa`, the pixel stack resolves to Vazirmatn.

## Folder structure — what belongs where

```
scripts/                    project checks (check-pixel-font.mjs)
  verify/                   end-to-end browser checks over CDP (no dependencies)
src/
  app/
    layout.tsx              pass-through root layout (no <html> here)
    [[...locale]]/          the real root layout + routes; German at /, en at /en, fa at /fa
  components/
    ui/                     generic primitives (Button, Panel, LanguageSwitcher)
    os/                     Act 3 shell: Desktop, DesktopFrame, Shell, windows, taskbar, launcher, home screen
    landing/                the landing page (server-rendered; client islands only)
    journey/                Act 1 era sections and scroll machinery; Convergence.tsx (Act 2)
      eras/                 one component per era visual, plus registry.ts
    puzzles/                the puzzle engine, shell, gates and the seven puzzles
    apps/                   registry.ts, icons, one folder per application
    theme/                  theme application and era rendering effects
  lib/                      helpers: cn(), themes, routing, constants, hooks
  store/                    zustand stores
  content/                  portfolio content as typed data, separate from components
  messages/                 de.json, en.json, fa.json
  styles/                   globals.css — the ONLY file with raw colour values
```

Rules of thumb:

- A component that renders an era's visual goes in `components/journey/`.
- A component that is part of the desktop shell goes in `components/os/`.
- Anything reusable and era-agnostic goes in `components/ui/`.
- **Content is data.** Text, project lists, CV entries live in `content/` and
  `messages/`, never inline in a component.

## Routing and i18n

- `de` is the default locale and is served **without a prefix**; `en` at `/en`,
  `fa` at `/fa` with `dir="rtl"`.
- Three views per locale: the **landing page** at `/` (`/en/`, `/fa/`), the
  **journey** at `/journey/` (`/en/journey/`, `/fa/journey/`) and the
  **desktop** at `/desktop/` (`/en/desktop/`, `/fa/desktop/`).
- All of it is one **optional catch-all segment** `app/[[...locale]]`, not
  middleware: `output: 'export'` never runs middleware, and the catch-all is the
  only segment that knows the locale early enough for a static `lang` and `dir`.
  `matchSegments()` in `src/lib/routing.ts` turns segments into `{ locale, view }`
  or null; `viewHref(locale, view)` builds links.
- `dynamicParams = false`: only generated routes exist, so stray URLs are a clean
  404. `/favicon.ico` is a static route handler (`app/favicon.ico/route.ts`) that
  serves `public/favicon.svg`, and `_redirects` 301s it to the SVG in production.
- `/de` is deliberately **not generated** — it would duplicate `/`. The
  `301 /de/ → /` lives in `public/_redirects`.
- `canonical` and `hreflang` (including `x-default`) are emitted per view.
- **Tone:** German addresses the visitor as **"Sie"** - natural, not stiff -
  in every string, including puzzles and chrome. Persian uses the polite
  **"شما"** throughout. English stays neutral. Never write "du" or "تو".
- **Each view gets only its message namespaces** (`VIEW_NAMESPACES` in the
  layout). Everything handed to the client provider is serialised into the HTML,
  so add a namespace there when a view starts using it — and never add `puzzles`,
  which loads with the puzzle chunk.

## The desktop (Act 3, Phase 6)

`src/components/os/` and `src/components/apps/`. Read DECISIONS.md 49 first.

- **Its own route, `/desktop/`,** in the `modern` theme, with only the `site`,
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
  component in its folder; the window stays. Locked bonus apps say which era's
  puzzle unlocks them (`unlock.ts`; the last era is "today", never a year).
- **Zustand selectors must return stable values.** A selector that builds a new
  array of new objects never compares equal and re-renders forever (React error
  185) - select the store's own objects, or primitives.
- Legende badges are read through `selectLegendEras` and displayed in Phase 9.

## The landing page

`src/components/landing/`. Present-day Ahmadreza, in the `modern` theme; the page
a recruiter judges in three seconds and Google reads first.

- A **server component with real HTML text**. Client islands only: the language
  switcher and the two mode buttons (which are real links, so they work without
  JavaScript). **Never import journey code here** — the journey is behind
  `JourneyLoader`'s dynamic import precisely so the landing page ships no GSAP,
  Lenis or era.
- Contents: name (the strongest element), role line, bold key facts, the two
  mode cards as the primary call to action (the Play card must describe the
  gates), the résumé control twice (header corner and under the role), an email
  link, the language switcher, and a restrained timeline hint that does not
  reveal any era.
- **Assets still owed** are declared in `src/content/profile.ts` with an
  `available` flag: the portrait (4:5, 1200 × 1500 px, `public/images/portrait.jpg`
  — the one allowed raster asset) and the résumé PDF
  (`public/files/ahmadreza-taheri-lebenslauf.pdf`). While `available` is false
  the page renders a same-size placeholder and a disabled résumé control, never
  a broken link. Flip the flag when the file lands. `EMAIL` works the same way:
  no mailto link at all until its address is confirmed.

## The theme engine

This is the most important piece of infrastructure in the project. Phase 9's
**Time Machine** app re-skins the entire desktop into any historical era on
demand using this same engine, unchanged.

How it works:

1. `src/lib/themes.ts` defines a `Theme` interface — colour tokens, font
   families, border radii, shadow styles, rendering effects (scanlines, phosphor
   glow, pixelation, dithering, noise, curvature), cursor style, sound profile —
   and eight concrete themes: one per era plus `modern` for AhmadOS.
2. `src/lib/apply-theme.ts` flattens a theme into `--ao-*` CSS custom properties
   and writes them onto `<html>`, plus `data-theme`, `data-cursor`, `data-sound`.
3. `src/store/theme-store.ts` holds the active theme id. `setTheme(id)` is the
   only entry point. `lockTheme(true)` pins a theme so Act 1's scrolling cannot
   override the Time Machine.
4. `src/styles/globals.css` declares bootstrap values on `:root` and re-exports
   every token to Tailwind through `@theme inline`, so `bg-surface`, `text-ink`,
   `border-edge`, `rounded-window`, `shadow-window` all follow the active theme.

**Themes are applied by setting CSS custom properties, never by swapping Tailwind
classes.** One state change restyles the whole document, and it costs no React
re-render — components read tokens from CSS, not from context.

Switching a theme manually:

```ts
import { useThemeStore } from '@/store/theme-store';
useThemeStore.getState().setTheme('era1984');
```

### Era visual characters

| Theme id | Character |
|---|---|
| `era1946` | dark metal, warm amber lamp glow |
| `era1956` | paper white, typewriter ink black |
| `era1971` | pure black, green phosphor, scanlines |
| `era1981` | black with amber text, chunky 8-bit |
| `era1984` | light grey, black 1-bit pixel art |
| `era1995` | teal desktop, grey 3D bevelled chrome |
| `era2024` | the modern dark palette |
| `modern` | AhmadOS — same palette as `era2024` |

## Act 1 scroll machinery

`components/journey/Journey.tsx` owns it.

- **Lenis** supplies smooth scrolling. It takes over the scroll position and
  **does not emit native `scroll` events**, so `ScrollTrigger.update()` is
  ticked from the same rAF that drives Lenis. Do not remove that.
- Anything that scrolls programmatically must go through
  `src/lib/lenis-controller.ts`, not `window.scrollTo`, or ScrollTrigger will
  never learn the page moved.
- The active era is resolved from the **scroll position** by a single
  ScrollTrigger, not by seven per-section `onEnter` callbacks. Per-section
  triggers are order-dependent during first layout and produced a wrong initial
  theme. Keep the resolver model.
- `prefers-reduced-motion` disables Lenis entirely and renders the eras as a
  plain vertical document. ScrollTrigger still runs there, because it only
  observes scroll position and creates no motion of its own.
- The resolver calls the stores **only when the era changes**, never per frame —
  per-frame calls made the persisted unlock store write `localStorage` 60 times
  a second.
- The theme reference line is 80% down the viewport when stages are pinned (the
  outgoing era has already faded) and the centre in document flow.

### Era visuals (Phase 3 onwards)

Each era is `src/components/journey/eras/Era*.tsx`, wired up in
`eras/registry.ts` with its pinned scroll length and `startAt` threshold.

- **Pinning is CSS `position: sticky`**, never ScrollTrigger `pin` — pin-spacers
  break the resolver's `offsetTop` measurements. Pinning only applies at
  `min-width: 768px` and `min-height: 600px` with motion allowed; below that, eras
  flow as ordinary blocks so nothing is clipped on phones.
- **Scrubbed motion** reads `--era-progress` (0..1, registered with `@property`),
  which the resolver writes on each section. Write the effect as `calc()`/`clamp()`
  over that variable in `globals.css`. Animate only `transform`, `opacity` and
  `filter`. No per-frame JS, no React state, no GSAP timelines per era.
- **One-shot motion** (printing, counters) is a CSS animation paused until
  `[data-started='true']`, which the resolver sets once and never clears.
- **Never use `steps(n, end)` with a forwards fill.** Float rounding can finish at
  progress 0.99999…, which freezes on the second-to-last step. Use `jump-none`.
- **Never put a CSS animation on the same property you scrub** on one element:
  the animation overrides the declared value. Nest them.
- **Printed text** goes through `lib/typeset.ts` + `PrintedLine`: deterministic
  imperfection (never `Math.random` — hydration), Persian printed word by word
  (per-letter spans break Arabic-script joining), `dir="auto"` per line, the
  printout `aria-hidden` with the same text once in an `ao-sr-only` block.
- **Machine output is LTR in every locale.** Terminal and DOS blocks pin
  `dir="ltr"`; prose follows the page direction. Directional motion must flip in
  RTL (see `.ao-card-slide`).
- **No raster assets.** SVG, CSS, or — only if genuinely necessary — a small canvas.
- **No audio** until the Phase 9 audio layer; `soundProfile` stays unused.
- Every scrubbed or one-shot effect needs a matching rule in the
  `prefers-reduced-motion: reduce` block that resolves it to its finished state.
- Call `ScrollTrigger.refresh()` after anything that changes layout height. Font
  swap-in is already handled via `document.fonts.ready`.
- Fixed journey controls carry `.ao-chrome-backdrop` (surface token) so they stay
  legible over every era, including paper-white 1956, grey 1984 and teal 1995.
  Anything laid out beside the progress rail ends at 84cqw landscape / 80cqw
  portrait, and moves away from the left edge in RTL, where the rail sits.

### Era-to-era crossings and depth (Phase 5.5B)

Read DECISIONS.md 45 and 46 before touching any of this.

- **No era ever cuts to the next.** Each section owns the crossing *into*
  itself and overlaps the section before it by `1 + BOUNDARY_LENGTH` viewports,
  so both eras share the screen for the whole morph. At no scroll position may
  neither era be visible, and no frame may show an empty background.
- **Measure, never re-derive.** `100dvh` and `window.innerHeight` differ while a
  phone's toolbar is in play. The phases are marked in the document with
  zero-height `.ao-mark` elements and the resolver reads their pixels, dividing
  by the sticky stage's measured height - not by the viewport.
- **One resolver, four properties, written where they are read** (DECISIONS.md
  48): `--era-progress` on the scene, `--boundary-in` on the scene and the
  crossing, `--boundary-out` on the scene and the puzzle layer,
  `--puzzle-progress` on the puzzle layer. They inherit, so a write on the
  section restyled all ~500 of its elements every frame. A new reader outside
  those subtrees gets the value by being written to, not by moving the write
  up. Still no per-section trigger, still no per-frame JS.
- **Read layout before writing it.** The resolver runs every frame and twice
  (scroll event and ticker): it reads `window.scrollY` first, the viewport from
  the last measure, returns early if nothing moved, and never reads layout after
  a write. Do not read Lenis's own scroll number instead - it goes stale on
  native scrolls (keyboard, scrollbar, jumps).
- **The theme hands over at the visual midpoint** of each morph (`switchAt`),
  never at its edges. Both eras keep their exact period palette while they share
  the frame, through per-section `[data-theme-scope]`.
- **Never cross-fade two background fills.** Two half-transparent fills average
  to a grey that belongs to neither era. Hand the background over with a
  travelling masked edge instead, and never show two eras' text at once: the
  crossing runs in sequence (DECISIONS.md 45) and the morphing object carries
  both eras.
- **`--bridge-overlay`** (0 in flow, 1 pinned and always for the Convergence) is
  the only difference between the layouts' crossings. Never write a second rule
  set per layout - that is how the phone Convergence ended up permanently
  covered by its own veil.
- **Depth is CSS 3D only.** The stage owns the `perspective`; `.ao-camera`
  dollies and tilts; backdrops parallax. No WebGL, no three.js, no canvas.
  Animate only `transform`, `opacity` and `filter`.
- **A section's top is where the crossing into it begins**, still showing the
  era before. Anything that takes the visitor to an era (the rail, Continue,
  Skip) uses `scrollToEra()`, which lands on the era's `visual` marker and
  glides through the crossing on the way.
- **Clip horizontal overflow at `#journey-scenes`**, never on the stage - the
  stage's `perspective` would be flattened by an overflow on it. One overflowing
  pixel makes a mobile browser shrink the entire page to fit.
- **Three motion tiers** (`full`, `light`, reduced motion) chosen before first
  paint into `document.documentElement.dataset.tier`; `?tier=` forces one. A
  tier may drop layers and shorten depth moves. It may never drop a step of the
  story.

### Phase 4 patterns — use these, don't reinvent them

- **HTML weight is a tracked budget** (reported every phase). No per-letter
  elements outside the Phase 3 printers: animate a cover over a single text node
  instead (`.ao-wipe`, `.ao-conv-line-cover`). Prefer SVG patterns to repeated
  elements; ASCII bitmaps in `lib/pixel-art.ts` become one path per colour.
- **UI state over scroll** uses `.ao-cue` (`--on`/`--off` in era progress).
  Pointers use `.ao-path` (three segments, `--ux`/`--uy` units).
- **Reduced motion for new stages:** put `.ao-final-frame` on the stage; it pins
  `--era-progress` to 1. Transient elements whose text must still show in the
  static frame add `.ao-rm-show`.
- **Scaled compositions** (1995 desktop, the Convergence) are size containers laid
  out in `cqw`/`cqh`, with a portrait container query. Container units declared
  on the container itself resolve against its ancestor — declare size variables
  on descendants.
- **Theme a subtree** with `[data-theme-scope="eraNNNN"]` rules generated from
  `themeToCssVars()`, as the Convergence chips do. Never hand-write colours.
- **SVG pattern ids** come from `useId()` — the same component can render twice.
- **Bidi:** use `:dir(rtl)`, not `[dir='rtl'] .x`, inside `dir="ltr"` blocks;
  wrap Persian runs in LTR machine output in `<bdi>`; physical SVG layouts set
  `direction="ltr"`.
- **Never combine an opacity animation with an opacity attribute** on one
  element, and never use `truncate` where spaces must survive.
- **Mount points** — keep them, replace their children:
  `data-assistant-mount="journey-prompt"` (Phase 8, today's prompt). The Phase 6
  shell mount inside the Convergence is gone: the desktop has its own route and
  shares the frame instead (DECISIONS.md 49).
- **The Convergence** is not an era: the resolver gives it the `modern` theme,
  keeps the rail on era 7, and when it reaches the empty desktop or the page end
  calls `completeJourney()` and hands over to `/desktop/` (DECISIONS.md 49).

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

## Coding conventions — enforce these

- **TypeScript strict. No `any`.** Prefer discriminated unions and `as const`
  over loose types. No non-null assertions without a comment saying why.
- **Functional components with named exports.** No default exports outside
  `app/` route files, where Next.js requires them.
- **Tailwind only**, apart from `src/styles/globals.css`. No CSS modules, no
  styled-components, no inline `style` objects for anything themeable.
- **All user-facing text comes from `messages/`.** Never hardcode a string a
  visitor can read. Exceptions: years, and *machine text* that is identical in
  every language (a command such as `WP`, the `C:\>` prompt, key caps, a
  FORTRAN listing) - keep those as named constants with a comment.
- **All colours read from design tokens.** Never write a hex value, an
  `rgb()`, or a Tailwind palette class (`bg-slate-800`) outside `globals.css`.
  Use the semantic classes: `bg-background`, `bg-surface`, `bg-elevated`,
  `border-edge`, `text-ink`, `text-muted`, `text-accent`, `bg-chrome`,
  `text-chrome-ink`.
- Elements that should cross-fade on a theme change carry the `ao-themed` class.
- Stacking uses the z-index scale from `globals.css`, e.g.
  `z-[var(--ao-z-taskbar)]`. Never an ad-hoc `z-50`.
- Logical properties for anything directional (`start-4`, `end-4`, `ms-2`), so
  Persian RTL mirrors correctly for free.
- Comments explain **why**, not what.

## Commands

```bash
npm run dev     # dev server on :3000
npm run build   # type-check + static export to ./out
npm run lint
npm run check:pixel-font   # every Press Start 2P string has real glyphs
node scripts/verify/journey.mjs --mode play|watch [--width 380] [--locale fa] [--reduce] [--touch] [--tier light]
node scripts/verify/boundaries.mjs [--width 380] [--locale fa] [--tier light] [--steps 4]
node scripts/verify/perf.mjs [--width 380] [--tier light] [--cpu 4]
node scripts/verify/desktop.mjs [--width 380] [--locale fa] [--reduce] [--touch]
node scripts/verify/navigation.mjs [--width 380] [--locale fa] [--reduce] [--touch]
node scripts/verify/sizes.mjs
```

The verify script needs a running server (default `http://localhost:3001`,
`--base` to change) and a local Chrome (`CHROME_PATH`).

`npm run build` must finish with zero TypeScript errors, zero build errors, and
all three locales generated. That is the definition of done for every phase.
