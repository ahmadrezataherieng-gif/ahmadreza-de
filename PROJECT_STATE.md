# Project state

Last updated: 2026-09-19

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
- [ ] **Phase 8B** — connect the real Gemini key (TODO.md, Phase 8B)
- [ ] **Phase 9** — Unlockable apps, easter eggs, Time Machine theme switcher
- [ ] **Phase 10** — SEO layer: text fallback, JSON-LD, sitemap, hreflang, llms.txt
- [ ] **Phase 11** — Legal pages: Impressum and Datenschutzerklärung
- [ ] **Phase 12** — Performance, accessibility, mobile pass
- [ ] **Phase 13** — Cloudflare deployment: GitHub integration, custom domain, DNS, TLS

## What exists

- **Build:** Next.js 15 static export, Tailwind v4, TypeScript strict. `npm run
  build` emits nine pages - the landing page, the journey and the desktop in de
  (`/`, `/journey/`, `/desktop/`), en (`/en/…`) and fa (`/fa/…`) - into a
  static `out/`, plus the
  SVG favicon. Deployment config for Cloudflare Workers with static assets is in
  place (`wrangler.jsonc`, `public/_headers`, `public/_redirects`); not deployed.
- **Landing page** (`/`): name, role, bold key facts, two mode cards, the résumé
  control in the header and under the role, an email link that appears once the
  address is confirmed. Portrait and résumé are owed (TODO.md); the email,
  kontakt@ahmadreza.de, is confirmed and linked. No journey
  code is loaded there. A returning visitor gets "Zum Desktop" as the primary
  action in the same slot, without a layout shift; the mode cards step back.
- **Theme engine:** eight themes applied as CSS custom properties, also to
  subtrees (`[data-theme-scope]`).
- **Act 1, the journey** (`/journey/`): seven era visuals, pinned and scrubbed on
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
- **Act 2, the Convergence:** the seven eras compile into an empty AhmadOS
  desktop; reaching it hands over to `/desktop/`, whose first frame is the same
  picture (pixel-identical). Zum Desktop goes there from any point, gated or not.
  A returning visitor's direct visit to `/journey/` lands on the desktop.
- **Act 3, the desktop** (`/desktop/`, DECISIONS.md 49): no GSAP, Lenis or era
  code. Wide screens with a fine pointer get a window manager - drag, resize,
  minimise, maximise, cascade, z-order, keyboard control, Alt+Shift+Arrow
  cycling, RTL mirroring - with a taskbar (launcher, window buttons, clock,
  language switcher, résumé control). Phones and touch tablets get a home screen
  with a dock; apps open fullscreen and the browser's Back closes them. Eight
  base apps and seven bonus apps are registered. Locked bonus apps name the era
  whose puzzle unlocks them.
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
  - **Assistant** (Phase 8A, DECISIONS.md 52): live when the proxy has a key, otherwise a demo that says so on a badge, a banner and every message - five prepared answers, no guessing. Seven visible states, reduced motion shows the finished answer, and a line about Gemini in the app itself. On open it sends one bare GET to learn whether the Worker has a key.
  - Contact, Timeline and CV are still placeholders.
- **The proxy** (`worker/`, Phase 8A): a Cloudflare Worker answering only `/api/*` (`assets.run_worker_first`), the rest of the site served from `out/` as before. Own-origin only, 5 requests a minute and 30 an hour per IP (in memory), question 400 characters, answer 900, 8 s timeout, nothing logged, the model's material built from `src/content/` at build time. No key is set: it answers "not configured". Run under `wrangler dev`, it served the assets, the 404, the redirects and the headers unchanged and answered the API paths; the real Gemini API has never been called.
- **Checks:** `npm run check:pixel-font`; `scripts/verify/journey.mjs` drives a
  real Chrome through both modes, all puzzles, the gates and the landing page;
  `boundaries.mjs` screenshots every crossing and checks that no frame is blank
  and the theme hands over at each midpoint; `perf.mjs` measures a full scroll;
  `desktop.mjs` drives the window manager (mouse, touch, keyboard) and the home
  screen; `apps.mjs` uses each core app, from 300 x 200 to maximised and
  fullscreen on a phone; `npm test` runs the pure modules and checks the app
  data and copy in plain node; `navigation.mjs` the hand-over, Zum Desktop from every era and the
  returning visitor; `sizes.mjs` what each view loads; `serve.mjs` serves `out/`
  so all of them can run against the real export. Every script takes `--quiet`, and `matrix.mjs` runs the whole matrix with one line per configuration (DECISIONS.md 51). CLAUDE.md is 195 lines; its specialised rules live in `.claude/skills/`.

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

- Contact, Timeline and CV, and the seven bonus apps
  (Phase 9), are placeholders.
- The phone keyboard handling (Terminal, Assistant) was checked in emulation only.
- The Gemini key, and everything that needs it: TODO.md, Phase 8B.
- Badges are recorded, readable through `selectLegendEras`, but not displayed.
- The motion tiers have only been measured in headless Chrome; no real phone or
  Safari/Firefox run yet (Phase 12).
- Audio. Every theme's `sound` profile is still unused.
- Legal pages, sitemap, JSON-LD, `llms.txt`.
- Deployment.
