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
| Hosting | nginx on a self-administered VPS |

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

## Folder structure — what belongs where

```
src/
  app/
    layout.tsx              pass-through root layout (no <html> here)
    [[...locale]]/          the real root layout + routes; German at /, en at /en, fa at /fa
  components/
    ui/                     generic primitives (Button, Panel, LanguageSwitcher)
    os/                     OS shell: Desktop, Taskbar, WindowManager, BootScreen
    journey/                Act 1 era sections and scroll machinery
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
- `/de` is deliberately **not generated** — it would duplicate `/`. nginx should
  `301 /de/ → /`.
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
```

`npm run build` must finish with zero TypeScript errors, zero build errors, and
all three locales generated. That is the definition of done for every phase.
