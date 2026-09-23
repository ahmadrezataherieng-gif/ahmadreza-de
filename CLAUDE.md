# Amonel — Portfolio of Ahmadreza Taheri

The core rules are in this file; the specialised ones are in the project skills listed below. Read this file before touching code, and the matching skill before touching its area.

The rules in this file and in the project skills (`.claude/skills/`) override any installed plugin, skill or output style. If a plugin's advice conflicts with a project rule, the project rule wins.

## Core rules

- **Legal first:** check every addition against German law (DSGVO, TDDDG, DDG, copyright, image rights) before building it. The site must never need a consent banner; if something would create legal risk, stop and say so instead of building it.
- **SEO first:** every page, every piece of copy and every piece of markup serves search visibility for Ahmadreza's name, job, field and skills. When a choice trades a nice effect against discoverability, discoverability wins.
- **Shell rule:** single-line commands only on this machine - no `python3`, no heredocs.
- ROADMAP.md is the master plan. Every new idea, missing piece or postponed task must be added there so nothing is forgotten before the final phase.

## Content placeholder rule

All user-facing content is placeholder until the final content review with the owner. Any new or changed text, label, puzzle, game, section or metadata MUST get a CONTENT-TODO marker (where comments are possible) AND a new entry in CONTENT_REVIEW.md in the same task. Never mark content as final without the owner's explicit approval. After the whole site is finished, go through CONTENT_REVIEW.md with the owner one entry at a time, from the first to the last.

## Project skills - read the one that matches your task

- `journey-visuals` - Act 1 and 2: era visuals, scroll machinery, crossings and CSS 3D depth, motion tiers, printed text, the Convergence, era visual characters.
- `puzzles` - the puzzle rule (never block without a one-click way through), gates, engine, the modes in practice, unlocks and badges, era copy and insider details.
- `desktop-apps` - Act 3: window manager, taskbar, launcher, mobile home screen, the app registry and every app, per-app copy.
- `theme-engine` - themes as CSS custom properties, tokens, `apply-theme`, `setTheme`, the Time Machine.
- `landing-page` - the landing page and the assets still owed (portrait, resume, email flags).
- `deployment-legal` - Cloudflare Workers deploy, `_headers`, `_redirects`, the Assistant's local search, self-hosted fonts and the pixel-font check, GDPR.
- `seo` - names, canonical host, robots.txt bot policy, page fundamentals, structured data, images, the pending brand rename.
- `verification` - running `scripts/verify`, the setups, `--quiet`, `matrix.mjs`.

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

The canonical machine-readable version of this table is `src/content/eras.ts`; keep the two in sync.

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
| Assistant | local search over `src/content/`, runs in the browser, no external AI service |

## Folder structure — what belongs where

```
worker/                     the Cloudflare Worker for /api/* only: the anonymous counters (Phase 9C); never imported by src/
migrations/                 the D1 schema for those counters
scripts/                    project checks (check-pixel-font.mjs)
  test/                     plain-node tests of the pure modules and app data (`npm test`)
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
  messages/                 de.json, en.json, fa.json; apps/<app>/<locale>.json (each app's own copy)
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
  **journey** at `/amonel/` (`/en/amonel/`, `/fa/amonel/`; the old `/journey/` URLs 301 there) and the
  **desktop** at `/desktop/` (`/en/desktop/`, `/fa/desktop/`).
- All of it is one **optional catch-all segment** `app/[[...locale]]`, not
  middleware: `output: 'export'` never runs middleware, and the catch-all is the
  only segment that knows the locale early enough for a static `lang` and `dir`.
  `matchSegments()` in `src/lib/routing.ts` turns segments into `{ locale, view }`
  or null; `viewHref(locale, view)` builds links.
- `dynamicParams = false`: only generated routes exist, so stray URLs are a clean
  404. The icons are plain files in `public/` (`favicon.svg`, `favicon.ico`,
  `apple-touch-icon.png`, `brand/`, `manifest.webmanifest`); the rasters come from
  `node scripts/brand-icons.mjs`.
- `/de` is deliberately **not generated** — it would duplicate `/`. The
  `301 /de/ → /` lives in `public/_redirects`.
- `canonical` and `hreflang` (including `x-default`) are emitted per view.
- **Tone:** German addresses the visitor as **"Sie"** - natural, not stiff - in every string, including puzzles and chrome; Persian uses the polite **"شما"** throughout; English stays neutral. Never write "du" or "تو".
- **Each view gets only its message namespaces** (`VIEW_NAMESPACES` in the layout); everything handed to the client provider is serialised into the HTML, so add a namespace there when a view starts using it — and never add `puzzles`, which loads with the puzzle chunk.

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
npm test        # plain-node tests: shell, traceroute, app data and copy, the Assistant, the Worker
```

`npm run build` must finish with zero TypeScript errors, zero build errors, and
all three locales generated. That is the definition of done for every phase.

# Compact instructions

When this conversation is compacted, keep:

- the current phase and what is left in it (PROJECT_STATE.md, TODO.md);
- every decision made in this session, with its reason;
- any failing check or test, with its command and output.
