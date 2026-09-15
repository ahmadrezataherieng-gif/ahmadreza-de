# AhmadOS — Portfolio of Ahmadreza Taheri

Everything a future session needs is in this file. Read it before touching code.

## Who this is for

Ahmadreza Taheri, IT professional in Germany, currently in a
*Fachinformatiker für Systemintegration* apprenticeship at Stadtverwaltung
Trier. The site exists to **get him hired** and to **rank first for his name**.
Every technical decision is subordinate to those two goals. When a choice trades
a nice interaction against discoverability or against a recruiter's time, the
recruiter wins.

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
| 1 | 1946 | ENIAC and punch cards | Blinking lamps only, no screen | Punch holes to encode a letter in binary | Binary and character encoding |
| 2 | 1956 | Mainframes, the first OS, batch processing | A teletype printing text line by line onto paper | Reorder batch jobs to minimise total waiting time | Scheduling, and why operating systems exist |
| 3 | 1971 | UNIX | Green phosphor CRT, scanlines, blinking cursor. **First era where the user can type.** | Navigate a simulated filesystem with `cd`/`ls`/`cat` to find a hidden file | The filesystem tree and paths |
| 4 | 1981 | IBM PC and MS-DOS | `C:\>` prompt, amber on black | Fit a set of programs into 640 KB of memory | Memory constraints |
| 5 | 1984 | Macintosh | **The mouse cursor appears for the first time**, plus the first window and 1-bit pixel art | A drag-and-drop task | The WIMP paradigm and the origin of keyboard shortcuts |
| 6 | 1995 | Windows 95 and dial-up internet | Taskbar and start menu | Configure IP address, subnet mask and gateway to get connected | Subnetting fundamentals |
| 7 | Today | Cloud, containers, AI | Dark mode and dashboards | Find the broken firewall rule and open the correct port | Ports and firewall basics |

The canonical machine-readable version of this table is `src/content/eras.ts`.
Keep the two in sync.

## The optional-puzzle rule — never violate it

- Puzzles are **optional** and **never block progress**.
- A **Skip** control is always visible.
- A **Skip to Desktop** control is available at every point in Act 1.
- Returning visitors go **straight to the desktop**.
- Solving a puzzle unlocks a bonus app. Skipping costs nothing else.
- **Recruiters must never be gated behind a game.**

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
| Animation | framer-motion (component-level), GSAP + ScrollTrigger (scroll) |
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
src/
  app/
    layout.tsx              pass-through root layout (no <html> here)
    [[...locale]]/          the real root layout + routes; German at /, en at /en, fa at /fa
  components/
    ui/                     generic primitives (Button, Panel, LanguageSwitcher)
    os/                     OS shell: Desktop, Taskbar, WindowManager, BootScreen
    journey/                Act 1 era sections and scroll machinery; Convergence.tsx (Act 2)
      eras/                 one component per era visual, plus registry.ts
    apps/                   one folder per application
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

- `de` is the default locale and is served at the **root path** `/`.
- `en` at `/en`, `fa` at `/fa` with `dir="rtl"`.
- Implemented with an **optional catch-all segment** `app/[[...locale]]`, not
  middleware: `output: 'export'` produces plain files and never runs middleware.
- `/de` is deliberately **not generated** — it would duplicate `/`. The
  `301 /de/ → /` lives in `public/_redirects`.
- `generateStaticParams` in `app/[[...locale]]/layout.tsx` produces `/`, `/en`,
  `/fa`. Correct `lang`, `dir`, `canonical` and `hreflang` (including
  `x-default`) are emitted statically for SEO.
- Helpers for building locale-aware hrefs live in `src/lib/routing.ts`.

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
  `data-puzzle-mount="unix-filesystem"` (Phase 5, 1971 screen),
  `data-shell-mount="ahmados"` (Phase 6, end of the Convergence),
  `data-assistant-mount="journey-prompt"` (Phase 8, today's prompt).
- **The Convergence** is not an era: the resolver gives it the `modern` theme,
  keeps the rail on era 7, and calls `completeJourney()` when it reaches the
  empty desktop or the page end.

## Coding conventions — enforce these

- **TypeScript strict. No `any`.** Prefer discriminated unions and `as const`
  over loose types. No non-null assertions without a comment saying why.
- **Functional components with named exports.** No default exports outside
  `app/` route files, where Next.js requires them.
- **Tailwind only**, apart from `src/styles/globals.css`. No CSS modules, no
  styled-components, no inline `style` objects for anything themeable.
- **All user-facing text comes from `messages/`.** Never hardcode a string a
  visitor can read. Years are the one exception — a year is a year in every
  language.
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
```

`npm run build` must finish with zero TypeScript errors, zero build errors, and
all three locales generated. That is the definition of done for every phase.
