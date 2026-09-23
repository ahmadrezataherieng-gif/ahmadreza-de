# Project state

Last updated: 2026-09-23

Content review pending: see CONTENT_REVIEW.md (starts after the site is complete).

**Master plan until launch: ROADMAP.md** (full audit of 2026-09-23, 65 items by
phase, status, priority and owner). The phase list below is the history; what
is left lives in ROADMAP.md.

- [x] **Phase 0** — Environment and scaffold
- [x] **Phase 1** — Design system, i18n, theme engine
- [x] **Phase 2** — Journey scaffold and unlock store
- [x] **Phase 3** — Era visuals 1 to 4
- [x] **Phase 4** — Era visuals 5 to 7 and the Convergence sequence
- [x] **Phase 5** — Concept pass, landing page, puzzle engine and the seven puzzles
- [x] **Phase 5.5A** — Concept alignment: Play-mode gates, "Sie", the 1946 scene, working insider tricks, landing polish, full audit
- [x] **Phase 5.5B** — Era-to-era crossings, CSS 3D depth, motion tiers
- [x] **Phase 6** — Desktop shell: window manager, taskbar, mobile home screen
- [x] **Phase 7** — Core apps: About, Terminal, Ticket System, Traceroute
- [x] **Phase 8A** — Assistant app, labelled demo and the proxy Worker, built without a key
- [x] **Phase 8B** — the assistant becomes a local search; no Gemini, no key (DECISIONS.md 53)
- [x] **Phase 9A** — Rebrand to Amonel: names, the `/amonel/` route with 301s, titles, logos and icons (DECISIONS.md 54)
- [x] **Phase 9B** — the Computer-Quiz, a base app (DECISIONS.md 55)
- [x] **Phase 9C** — anonymous public counters on `/api/*`, Worker + D1, not deployed (DECISIONS.md 56)
- [x] **Phase 9D-1** — bonus-app unlocks; Binary & Morse, Snake, Pixel Paint (DECISIONS.md 57)
- [ ] **Phase 9D-2** — network tools and the Time Machine theme switcher (slots registered)
- [ ] **Phase 9D-3** — easter eggs (the Terminal's `HIDDEN_COMMANDS`), GSAP DrawSVG
- [ ] **Phase 10** — SEO layer: text fallback, JSON-LD, sitemap, hreflang, llms.txt
- [ ] **Phase 11** — Legal pages: Impressum and Datenschutzerklärung
- [ ] **Phase 12** — Performance, accessibility, mobile pass
- [ ] **Phase 13** — Cloudflare deployment: GitHub integration, custom domain, DNS, TLS

## What exists

- **Build:** Next.js 15 static export, Tailwind v4, TypeScript strict. `npm run
  build` emits nine pages - the landing page, the journey and the desktop in de
  (`/`, `/amonel/`, `/desktop/`), en (`/en/…`) and fa (`/fa/…`) - into a
  static `out/`, plus the
  Amonel icon set (SVG and ICO favicons, Apple touch icon, web manifest). Deployment config for Cloudflare Workers with static assets is in
  place (`wrangler.jsonc`, `public/_headers`, `public/_redirects`); not deployed.
- **Landing page** (`/`): name, role, bold key facts, two mode cards, the résumé
  control in the header and under the role, an email link that appears once the
  address is confirmed. Portrait and résumé are owed (TODO.md); the email,
  kontakt@ahmadreza.de, is confirmed and linked. No journey
  code is loaded there. A returning visitor gets "Zum Desktop" as the primary
  action in the same slot, without a layout shift; the mode cards step back.
- **Brand** (Phase 9A, DECISIONS.md 54): the site is **Amonel**, the OS is
  **Amonel OS**, the person is always Ahmadreza Taheri. Logos are inline SVG or
  HTML from `components/ui/Brand.tsx` with fixed `--ao-brand-*` colours: the
  main logo in the landing header, the `~$ amonel os` lockup (blinking cursor,
  still under reduced motion) in the desktop and home-screen top bars, the
  Terminal and the boot log, the mark on the launcher button, the glass icon on
  the About tile. Titles are "name – job | Amonel" (landing) and
  "page – name | Amonel". The `modern` theme keeps its cyan accent for now.
- **Theme engine:** eight themes applied as CSS custom properties, also to
  subtrees (`[data-theme-scope]`).
- **Act 1, the journey** (`/amonel/`; the old `/journey/` URLs 301 there): seven era visuals, pinned and scrubbed on
  wide screens, in document flow on phones and under reduced motion. Each era
  ends in a puzzle segment with its one truth.
- **Two modes over one set of scenes.** Watch: puzzles play themselves as the
  page scrolls. Play: each era is gated on its puzzle; "Hinweis" and "Lösung
  zeigen" are always one click away, and a shown solution opens the gate without
  the artifact. Passed eras, artifacts and hidden "Legende" badges persist.
- **Seven puzzles**, five with a working period trick: the 1946 bug on a
  misencoded card (deck line), shortest-job-first (sense switch 3), a shell over
  a file tree (`chdir`), drivers in 640 K at a real DOS prompt (F3), drag and
  drop, IPv4 subnetting (`winipcfg`), and a first-match firewall.
- **Crossings between eras** (DECISIONS.md 45): no era cuts to the next. Each
  section overlaps the one before it and owns a bespoke morph in which the last
  object of one era becomes the first of the next; both eras keep their own
  palette while they share the frame, and the chrome's theme hands over at the
  morph's midpoint. CSS 3D depth: a camera dolly and tilt, parallax backdrops,
  pointer tilt on the full tier. No WebGL, no canvas.
- **Motion tiers** (DECISIONS.md 46): `full`, `light` (phones, coarse pointers,
  weak hardware) and reduced motion, chosen before first paint; `?tier=` forces
  one.
- **Act 2, the Convergence:** the seven eras compile into an empty Amonel OS
  desktop; reaching it hands over to `/desktop/`, whose first frame is the same
  picture (pixel-identical). Zum Desktop goes there from any point, gated or not.
  A returning visitor's direct visit to `/amonel/` lands on the desktop.
- **Act 3, the desktop** (`/desktop/`, DECISIONS.md 49): no GSAP, Lenis or era
  code. Wide screens with a fine pointer get a window manager - drag, resize,
  minimise, maximise, cascade, z-order, keyboard control, Alt+Shift+Arrow
  cycling, RTL mirroring - with a taskbar (launcher, window buttons, clock,
  language switcher, résumé control). Phones and touch tablets get a home screen
  with a dock; apps open fullscreen and the browser's Back closes them. Nine
  base apps and seven bonus apps are registered.
- **Bonus apps and their unlocks** (Phase 9D-1, DECISIONS.md 57): each era's
  puzzle unlocks one bonus app however it was seen solved - by hand, shown, or
  watched in Guided mode - and reaching the Convergence unlocks all seven.
  Locked ones stay visible, dimmed with a padlock; opening one says what it is,
  which era unlocks it, that the journey's end unlocks everything, and links to
  that era (`/amonel/#era-N`, which the journey now honours). Artifacts, badges
  and counters are still a solve by hand's alone. The state is the existing
  `amonel.unlocks.v1` (store v3), sanitised on read: broken storage means
  locked, never a crash.
  - **Binary & Morse** (1946): text to UTF-8 bytes in binary, hex and decimal and
    back, with the reason when bytes are not text; a table of bytes per
    character (Latin 1, Persian 2, emoji 4) with the bits drawn; international
    Morse both ways, unsupported characters named; a tone (Web Audio, on a
    click only, with Stop and volume) and a light kept under 3 flashes a second,
    a static timeline instead under reduced motion. Stores nothing.
  - **Snake** (1981): canvas game coloured by `--ao-snake-*` tokens (a phosphor
    set under the 1971 theme, the 9D-2 hook), arrows/WASD, Space/P, swipe and a
    touch pad, pauses when hidden or unfocused; best score in `amonel.snake.v1`;
    a finished game counts `snake.played`, shown from ten.
  - **Pixel Paint** (1984): 16/32/64 px, pencil, eraser, fill, picker, undo/redo;
    1-bit, 16-colour (CGA/EGA) and 256-colour palettes as colour depths with a
    note each; autosave in `amonel.paint.v1` after the first change; a 512 px
    PNG made in the browser; mouse, touch, pen and keyboard.
  - Network tools (1995) and the Time Machine (today) are 9D-2 slots; the
    scheduler (1956) and file tree (1971) are still the stand-in.
- **The core apps** (Phase 7, DECISIONS.md 50), each its own lazy chunk with its
  own copy file per language:
  - **About:** who Ahmadreza is, his path, what he does now, skills by area,
    languages, résumé and email - from `src/content/about.ts`; owed facts shown
    as marked placeholders.
  - **Terminal:** a small bash-like shell over an in-memory filesystem - `ls`,
    `cd`, `cat`, `pwd`, history, Tab completion, real error messages - plus
    `about`, `skills`, `projects`, `cv`, `contact`.
  - **Tickets:** nine helpdesk cases at a fictional company, each with symptom,
    diagnosis steps with real command output, solution and lesson; filter by
    status, sort.
  - **Traceroute:** a labelled simulation over four prepared routes, the packet
    travelling hop by hop with its latency, and where the time went.
  - **Assistant** (Phase 8B, DECISIONS.md 53): a local search over `src/content/`, built by `src/lib/search/` and run entirely in the visitor's browser - no Worker call, no key, no external AI service. It normalises a question (case, diacritics, Persian letter and digit variants) and matches it against an index built at build time, returning the best passages labelled with their source, or an honest "nothing found" with the example questions again. Four visible states (idle, searching, answered, noMatch), reduced motion shows the finished answer.
  - **Computer-Quiz** (Phase 9B, DECISIONS.md 55): ten questions a round from a bank of 30, every era asked at least once, each going back to its era's one truth; after each answer right or wrong in words and a mark, the right answer, the era and a short explanation; at the end the score, a friendly line, the eras worth a second look and "Neue Runde". Never presented as a test of the visitor. The best score is one number in this browser (`amonel.quiz.v1`). Keyboard-playable, verdicts and score announced live, right to left in Persian, fullscreen on phones. Not in the dock, and never in the Assistant's index.
  - Contact, Timeline and CV are still placeholders.
- **The Worker** (`worker/`, Phase 9C, DECISIONS.md 56): answers only `/api/*` (`assets.run_worker_first`); the rest of the site is served from `out/` as before. It holds the **anonymous public counters** - a name and an integer per row in one D1 table (`COUNTERS_DB`, `migrations/0001_counters.sql`), nothing about the visitor. `POST /api/count/<name>` (allowlist from `src/lib/counters.ts`, built from the era and app registries; 404 unknown, 405 not POST, 403 foreign Origin) increments atomically; `GET /api/counts` returns the totals, cached for a minute; everything else is 404. Counted: an era puzzle solved by hand in Play (never a guided auto-solve or a shown solution), a finished quiz round (no score), reaching the Convergence, the mode card on the landing page, every app opened - each name once per page load, in memory, no storage key. Shown, lazily and only from 10 up (Persian digits in fa): under a puzzle's outcome in the Play dialog, under the quiz result, and a small "Diese Website in Zahlen" section at the end of About. Without the Worker (any plain server, `next dev`) nothing is sent after the first failure and no number appears. **Not deployed:** the D1 database and the rate-limiting rule are created by hand in Phase 13 (TODO.md). The Gemini proxy of Phase 8A is gone (DECISIONS.md 53), still in the git history.
- **Checks:** `npm run check:pixel-font`; `scripts/verify/journey.mjs` drives a
  real Chrome through both modes, all puzzles, the gates and the landing page;
  `boundaries.mjs` screenshots every crossing and checks that no frame is blank
  and the theme hands over at each midpoint; `perf.mjs` measures a full scroll;
  `desktop.mjs` drives the window manager (mouse, touch, keyboard) and the home
  screen; `apps.mjs` uses each core app, from 300 x 200 to maximised and
  fullscreen on a phone; `npm test` runs the pure modules and checks the app
  data and copy in plain node; `bonus.mjs` the unlocks and the three bonus apps
  (Phase 9D-1); `navigation.mjs` the hand-over, Zum Desktop from every era and the
  returning visitor; `sizes.mjs` what each view loads; `serve.mjs` serves `out/`
  so all of them can run against the real export. Every script takes `--quiet`, and `matrix.mjs` runs the whole matrix with one line per configuration (DECISIONS.md 51). CLAUDE.md is 197 lines, three core rules plus pointers; its specialised rules live in `.claude/skills/` (`seo` added in Phase 8B).

## Budgets (measured on the export)

Reported per phase; see the phase reports and DECISIONS.md 34 and 38.

Measured with `gzip -6` on both builds (the 5.5A report used a different
setting, so its numbers are not comparable to these).

| | Before 5.5B | After 5.5B |
|---|---|---|
| Route First Load JS | 133 kB | 133 kB (limit 250) |
| Landing HTML, gzipped | de 6.4 · en 6.3 · fa 6.6 kB | unchanged |
| Journey HTML, gzipped | de 36.9 · en 35.2 · fa 33.2 kB | de 39.4 · en 37.0 · fa 34.9 kB (limit 48) |
| Journey chunk, gzipped | 17.1 kB | 19.5 kB |
| Stylesheet, gzipped | 14.9 kB | 18.3 kB |
| GSAP / ScrollTrigger + Lenis chunks | 19.3 + 30.4 kB | 19.3 + 30.2 kB |
| Per puzzle, gzipped | 2.6-4.0 kB; shell 4.3 kB; puzzle copy 8.5-10.1 kB per locale |

Phase 6, per view as a browser loads it (`scripts/verify/sizes.mjs`, gzip -6;
Next's First Load JS is one number for all views of the route):

| | Before 6 | After 6 |
|---|---|---|
| Route First Load JS (Next) | 133 kB | 135 kB (limit 250) |
| Landing: JS / CSS loaded | 132.7 / 18.4 kB | 134.8 / 19.8 kB |
| Journey: JS / CSS loaded | 221.4 / 18.4 kB | 223.8 / 19.8 kB |
| Desktop: JS / CSS loaded | - | **144.6** / 19.8 kB (shell chunk 9.8 kB; each app +0.5 kB on open) |
| Landing HTML, gzipped | de 6.4 · en 6.3 · fa 6.7 kB | de 6.6 · en 6.5 · fa 6.9 kB |
| Journey HTML, gzipped | de 39.5 · en 37.2 · fa 35.3 kB | de 39.9 · en 37.6 · fa 35.7 kB (limit 48) |
| Desktop HTML, gzipped | - | de 4.6 · en 4.4 · fa 5.0 kB |

Phase 7 (`scripts/verify/sizes.mjs`, gzip -6):

| | Before 7 | After 7 |
|---|---|---|
| Route First Load JS (Next) | 135 kB | 135 kB (limit 250) |
| Landing: JS / CSS loaded | 134.8 / 19.8 kB | 135.1 / 20.4 kB |
| Journey: JS / CSS loaded | 223.8 / 19.8 kB | 223.9 / 20.4 kB |
| Desktop: JS / CSS loaded | 144.6 / 19.8 kB | **145.1** / 20.4 kB (shell chunk 9.8 → 10.0 kB) |
| About on open (code + copy) | 0.5 kB | 3.9 kB (2.4 + 1.5) |
| Terminal on open | 0.5 kB | 8.1 kB (5.7 + its copy 1.0 + About's copy 1.5) |
| Tickets on open | 0.6 kB | 9.5 kB (5.4 + copy 4.1) |
| Traceroute on open | 0.6 kB | 6.3 kB (4.8 + copy 1.5) |
| Landing HTML, gzipped | de 6.6 · en 6.5 · fa 6.9 kB | de 6.8 · en 6.7 · fa 7.1 kB (the email link) |
| Journey HTML, gzipped | de 39.9 · en 37.6 · fa 35.7 kB | de 40.0 · en 37.7 · fa 35.7 kB (limit 48) |
| Desktop HTML, gzipped | de 4.6 · en 4.4 · fa 5.0 kB | de 4.8 · en 4.6 · fa 5.1 kB |

Phase 8A (`scripts/verify/sizes.mjs`, gzip -6):

| | Before 8A | After 8A |
|---|---|---|
| Route First Load JS (Next) | 135 kB | 135 kB (limit 250) |
| Landing: JS / CSS loaded | 135.1 / 20.4 kB | 135.2 / 20.5 kB |
| Journey: JS / CSS loaded | 223.9 / 20.4 kB | 224.1 / 20.5 kB |
| Desktop: JS / CSS loaded | 145.1 / 20.4 kB | **145.2** / 20.5 kB |
| Assistant on open (code + copy) | - | **6.3 kB** (4.5 + copy 1.8 in de) |
| Journey teaser, when near the viewport | - | 1.3 kB (1.05 + copy 0.25) |
| Landing / Journey / Desktop HTML | unchanged | unchanged (journey de 40.0 kB) |
| Worker bundle (wrangler, unminified) | - | 71 kB |

Phase 8B (`scripts/verify/sizes.mjs`, gzip -6): the assistant's brain moved
from the Worker into its own chunk, so opening it now costs more, and the
Worker costs almost nothing.

| | Before 8B | After 8B |
|---|---|---|
| Route First Load JS (Next) | 135 kB | 136 kB (limit 250) |
| Landing / Journey / Desktop: JS loaded | 135.1 / 223.9 / 145.1 kB | 135.2 / 224.1 / 145.2 kB (unchanged - the search ships only in the Assistant's own lazy chunk) |
| Assistant on open, fresh (code + its own copy) | 6.3 kB | **9.1 kB** (7.5 code + 1.6 copy in de) |
| Assistant on open, fresh (+ About/Terminal/Tickets copy the search also needs) | - | **15.7 kB** total (already cached if those apps were opened first) |
| Worker bundle (`wrangler deploy --dry-run`) | 71 kB unminified | **under 1 kB** - the Gemini proxy is gone |
| Landing / Journey / Desktop HTML | unchanged | unchanged |

Phase 9B (`scripts/verify/sizes.mjs`, gzip -6): the quiz is its own lazy
chunk; the other views grow only by the `quiz` id and storage key in the shared
code and a few new utility classes in the one stylesheet.

| | Before 9B | After 9B |
|---|---|---|
| Landing / Journey / Desktop: JS loaded | 135.2 / 224.7 / 145.8 kB | 135.3 / 224.8 / 145.9 kB |
| Stylesheet | 20.9 kB | 21.0 kB |
| Computer-Quiz on open (code + copy, de) | - | **9.5 kB** (4.2 code + 5.3 copy with the question bank) |
| Landing / Journey HTML | de 9.5 / 40.3 kB | unchanged |
| Desktop HTML | de 4.9 · en 4.7 · fa 5.3 kB | de 4.9 · en 4.8 · fa 5.3 kB (the window title) |

Phase 9C (`scripts/verify/sizes.mjs`, gzip -6): the counter code
(`count()`, the allowlist, `loadCounts`) sits in the route chunk every view
loads, because the landing page, the journey and the desktop all count.

| | Before 9C | After 9C |
|---|---|---|
| Landing / Journey / Desktop: JS loaded | 135.3 / 224.8 / 145.9 kB | **135.9 / 225.7 / 146.6 kB** (+0.6 / +0.9 / +0.7) |
| About on open | 4.0 kB | 4.8 kB (the stats view; its copy, ~0.4 kB, loads only when there is something to show) |
| Computer-Quiz on open | 9.5 kB | 9.9 kB |
| Stylesheet | 21.0 kB | 21.0 kB |
| Landing / Journey / Desktop HTML | de 9.4 / 40.3 / 4.9 kB | de 9.5 / 40.3 / 4.9 kB |
| Worker bundle (`wrangler deploy --dry-run`) | under 1 kB | 4.2 kB, **1.8 kB gzip** |

Phase 9D-1 (`scripts/verify/sizes.mjs`, gzip -6): each bonus app is its own
lazy chunk. The landing page and the journey grow only by the unlock logic in
the shared route chunk (sanitised storage, watched eras, the finished journey)
and a few new utility classes in the one stylesheet; no app code reaches them.

| | Before 9D-1 | After 9D-1 |
|---|---|---|
| Route First Load JS (Next) | 136 kB | 137 kB (limit 250) |
| Landing / Journey / Desktop: JS loaded | 135.9 / 225.7 / 146.6 kB | **136.6 / 226.7 / 147.5 kB** (+0.7 / +1.0 / +0.9) |
| Stylesheet | 21.0 kB | 21.7 kB |
| Binary & Morse on open (code + copy, de) | - | **7.7 kB** (6.1 + 1.6) |
| Snake on open | - | **6.0 kB** (5.2 + 0.8) |
| Pixel Paint on open | - | **7.6 kB** (6.4 + 1.2) |
| Landing / Journey HTML | de 9.5 / 40.3 kB | unchanged |
| Desktop HTML | de 4.9 · en 4.7 · fa 5.2 kB | de 5.2 · en 5.0 · fa 5.5 kB (the bonus apps' descriptions in `os`) |

## Scroll performance (DECISIONS.md 48)

A full scroll of the journey with real input, on the production export
(`scripts/verify/perf.mjs`, headless Chrome):

| Run | fps | median / p95 frame | frames > 33 ms | long tasks (worst) |
|---|---|---|---|---|
| 1280, full tier, GPU path | 58.4 | 16.7 / 16.8 ms | 41 | 6 (59 ms) |
| 1280, full tier, no GPU | 56.0 | 16.7 / 33.3 ms | 119 | 7 (56 ms) |
| 380, light tier, 4x CPU throttle, GPU path | 42.2 | 16.7 / 50 ms | 532 | 50 (324 ms) |
| 380, light tier, 4x CPU throttle, no GPU | 43.3 | 16.7 / 50 ms | 520 | 49 (321 ms) |

Desktop: the remaining long tasks are the theme switch at each crossing's
midpoint. Throttled phone: above the 30 fps floor, but each era's own scrubbing
still produces long tasks - restructuring the heavy visuals is Phase 12 work.

## Not built yet

- Contact, Timeline and CV are placeholders, and four bonus apps (scheduler,
  file tree, network tools, Time Machine) share the stand-in.
- The bonus apps' copy (Phase 9D-1) is a draft awaiting native-speaker
  proofreading (TODO.md). The Morse tone has only run in headless Chrome,
  where nothing is heard; touch and pen were emulated.
- The quiz copy is a draft awaiting native-speaker proofreading (TODO.md).
- The counter copy (Phase 9C) is a draft too, and the counters have only run
  under `wrangler dev --local` and against a CDP stub: the real D1, the edge
  cache and the rate-limiting rule exist only after Phase 13 (TODO.md).
- The phone keyboard handling (Terminal, Assistant) was checked in emulation only.
- Badges are recorded, readable through `selectLegendEras`, but not displayed.
- The motion tiers have only been measured in headless Chrome; no real phone or
  Safari/Firefox run yet (Phase 12).
- Audio. Every theme's `sound` profile is still unused.
- Legal pages, sitemap, JSON-LD, `llms.txt`.
- Deployment.
