# Project state

Last updated: 2026-09-25

Content review pending: see CONTENT_REVIEW.md (starts after the site is complete).

## K6 revert (2026-09-25; owner chose the old design after comparing both)

One commit per step, lint, tests and build green before each, nothing deployed.

- [x] 1. Main site: old look back on landing, About, Impressum, Datenschutz, 404 and the UI chrome (reference ad0a7cd); `[data-style=k6]`, its light mode, the K6 fonts in `public/fonts/` and `k6-style.test.mjs` removed; dark only. Kept: content, app/SEO/PERF work, 301s, Vazirmatn for Persian (also for the switcher's "فارسی" on de/en pages), no Persian letter-spacing (`.ao-site-page`), the a9bcd3c phone/RTL fixes.
- [x] 2. Coming-soon page: old look of 03300d5 (navy #0b0f15, blue-grey cards, mint mark, system heading face, bold system-mono terminal line), dark only; content, 72 %, SEO tags, JSON-LD, DE/EN/FA pages kept; Vazirmatn the only shipped font (Martian, Geist, Geist Mono, Departure Mono and their licences removed); legal pages share the tokens. `soon.mjs` 208/208 locally. **Not deployed**: the live page still shows K6 until the owner redeploys (BR-08).
- [x] 3. QA pass (screenshots in `Claude outputs/revert-review/`, git-ignored; they show the real Impressum address, do not share them): landing, About, Impressum, Datenschutz, 404, coming-soon in de/en/fa at 390, 768, 1024, 1440, 1920. No horizontal scroll anywhere; the landing name never overruns its column (measured 1024-1920, 0 px) - no clamp needed; axe 32/32 in de and fa, desktop and phone. **Fixed:** About header, text, buttons and footer now share one edge (were 362/376/369/365 px at 1440); the 404 page's Persian part and the switcher's "فارسی" drew in a system mono fallback with unjoined letters - now Vazirmatn; the language chips on About carried `lang` of the language they name, although the text is in the page language (a Persian word tagged German) - attribute removed; typos (CR-1100): de «angehender» → «angehendem» Fachinformatiker in `site.journeyDescription`, and « - » → « – » in the de/en privacy description and counters paragraph and two en About sentences. **Left for the owner:** Persian text set in the mono/heading stack (JetBrains Mono first) uses JetBrains' wide space, so Persian headings, buttons and the eyebrow look loosely spaced - a font choice, see step 5; a thin darker strip down the right edge on wide screens (the scrollbar gutter shows the page colour, not the landing glow); the Datenschutz storage table scrolls sideways inside its own box on phones (by design). Doubtful wording, not changed: de landing «Computergeschichte — und dabei» uses an em dash where German uses «–»; de About «Die Programme auf diesem Desktop» reads oddly on the static About page; en «system integration» vs «systems integration» mixed; en «Earlier stations» (Germanism), «which way a data packet takes» (better «which route»), «date to follow» lower-case next to «To be added»; en «e-mail» (coming-soon) vs «email» (site); fa «میزکار» / «میز کار» / «دسکتاپ» mixed (404 button says «رفتن به دسکتاپ»), «یکپارچه‌سازی سیستم» vs «سامانه‌ها», «این‌جا» vs «اینجا», «زمینه‌های اصلی من … است» (plural subject, singular verb - acceptable, check); the desktop sound tooltip «Ton ist aus - zum …» also uses a hyphen as a dash (desktop, outside this pass).
- [x] 4. Light-mode proposal on the pushed, **unmerged** branch `proposal/light-old-palette` (commit 5cd9768): follows the system setting, dark stays the default; the old cyan (site) and mint (coming-soon) and the amber, deepened just enough for AA on a cool light grey page (`#f3f6f9`); navy wordmark and a deeper mint "A" mark; the page root repainted, so no dark strip at the edge. axe clean in de and fa, both schemes, desktop and phone (site: `a11y.mjs --scheme light`, 32/32; coming-soon: 20 pages x schemes); `soon.mjs` 208/208. Screenshots: `Claude outputs/light-proposal/` (landing, About, coming-soon; de, fa; 390, 1440; light and dark).
- [x] 5. Font candidates, screenshots only (`Claude outputs/font-candidates/`, one file per role, candidate and width plus `overview-<role>-<width>.png`): each candidate loaded into the real built pages at screenshot time from local OFL files (npm `@fontsource` packages in the session's temp folder), so nothing was committed and no branch or worktree was needed. (a) name + headings: JetBrains Mono (current), Space Mono, Space Grotesk; (b) Latin body: Inter (current), IBM Plex Sans, Source Sans 3; (c) terminal/mono (the real Terminal app with `whoami`, `ls`, `cat README.md`): JetBrains Mono (current), IBM Plex Mono, Fira Code. All SIL OFL 1.1, self-hostable through `@fontsource`, with ä ö ü ß and „ “. Persian stays Vazirmatn.

- [x] 6. Owner decisions applied (2026-09-25, DECISIONS 74): fonts per role (Space Grotesk headings/name, Inter body, JetBrains Mono technical only, Vazirmatn Persian; also on the coming-soon page), light mode merged (`proposal/light-old-palette` deleted) with dark as the fixed default and a sun/moon toggle (localStorage `ao-scheme` after a click only), Datenschutz sentence + row (CR-1102), coming-soon light recoloured to cyan/mint/amber, Persian word gaps and the right-edge strip fixed. axe clean on landing and coming-soon (de, fa, both modes) plus About fa light; `soon.mjs` 208/208; screenshots in `Claude outputs/final-review/`. Not deployed; the coming-soon page still needs the BR-08 redeploy.

**What the owner chooses next (BR-08):** (1) light mode yes or no - if yes, merge `proposal/light-old-palette`; (2) one font per role (a, b, c) - the chosen ones get installed, licensed in `public/fonts/` and checked; (3) then rebuild and redeploy the coming-soon page (`npm run build:soon`, `npx wrangler deploy` in `soon/`, then `live-soon.mjs` and `soon.mjs --base https://ahmadreza.de/`) - until then the live page still shows the K6 look.

## Work queue (started 2026-09-24; resume with "continue the work queue")

Rules: strictly in order; after each item run `npm test` and `npm run lint` (plus `npm run build` when `src/` changed), update ROADMAP.md (`node scripts/roadmap.mjs --write`) and this file, commit and push. No questions between items: open decisions go to TODO.md with the safe default. New or changed visible text gets a CONTENT_REVIEW.md entry (PLACEHOLDER). Never deploy the main site, never touch Cloudflare settings.

- [x] 1. Housekeeping: (a) `.gitattributes` + renormalise, (b) commit the entity/SEO work, `legal.local.ts` stays untracked, (c) stale docs, (d) ROADMAP rows (LEG-17, LEG-18, SEO-16, SEO-17, SEO-12 reworded)
- [x] 2. SEO follow-ups: (a) `knowsAbout` the same 7 concepts in de/en/fa, (b) background in meta description and homepage subline, CR-1084 and pinned tests, (c) 301s from the old `/og/og-<locale>.png` on the main site and the coming-soon Worker, (d) `live-soon.mjs` reads the Person from `@graph` (already in the working tree)
- [x] 3. XS/S items, one commit each: SEO-13, APP-14, APP-11, APP-10, PERF-07, PERF-09, APP-13, APP-16, APP-09 (in CSS, DECISIONS 71) all done; PERF-03 measured and skipped (options in TODO.md); SEO-14 landing titles drafted (CR-1095, wording waits for the owner)
- [x] 4. M items, one commit each: APP-03, APP-06, APP-07, APP-12, APP-17 - all done (APP-03 keeps marked placeholders, waits for the owner's facts)
- [x] 5. BR-06 in steps: (1) tokens and fonts [x], (2) UI chrome [x], (3) landing [x], (4) About [x], (5) Impressum and Datenschutz [x], (6) 404 [x] - item done; desktop shell out of scope (open question in TODO.md)
- [x] 6. Preliminary LEG-05 audit written to TODO.md (nothing legal changed)
- [x] 7. Coming-soon page redeployed 2026-09-25 (version bbcc21b1, progress 72 %); live-soon.mjs and soon.mjs --base pass, the old og image URLs answer 301

- **Entity signals (2026-09-24):** (follow-ups the same day: the same seven `knowsAbout` concepts in all languages, the repair background in the descriptions and as a line under the role, 301s from the old `/og/og-<locale>.png`.) JSON-LD is now one graph on the main site and on the coming-soon pages (same builder, `structured-data.ts`): Person with name-variant `alternateName`s and the wider `knowsAbout`, WebSite named after the person, Amonel as a separate CreativeWork (`creator` = the Person), ImageObject as `primaryImageOfPage`. Share images renamed to `public/og/ahmadreza-taheri-<locale>.png`; `anthropic-ai` added to robots.txt. Live on the coming-soon pages since the deploy of version `8eac93e8` (2026-09-24); the main site is not deployed. The former 403 for the ClaudeBot and anthropic-ai user agents is fixed: the owner set Cloudflare's AI bot policies Search, Agent and Training all to Allow (ROADMAP SEO-17).
- **Coming-soon in three languages (2026-09-24, SEO-15):** `/`, `/en/` and `/fa/` are separate pages rendered by `scripts/soon-pages.mjs` from `soon/index.html` and the copy table `soon/copy.mjs`; own lang/dir, title (max 60 characters), description, canonical, hreflang incl. x-default, share tags, JSON-LD; language links are plain URLs, the one `ao-lang` storage entry is kept (privacy policy). Sitemap lists all three. Checked by `soon-pages.test.mjs`.
- **Employer never named (2026-09-24, LEG-08):** removed from the coming-soon
  page, the main site, llms.txt and the docs; the role line is
  "Fachinformatiker für Systemintegration in Ausbildung · Trier" (CR-1079).
  `scripts/test/employer.test.mjs` guards the source and every build output.
  The name is still in the git history.
- **Weighted progress and a new coming-soon page (2026-09-24, DECISIONS.md
  69, BR-02):** every ROADMAP.md row has an effort and one of seven areas;
  the work built before the audit is in as `BASE-*`. The coming-soon page in
  `soon/` was rewritten (who, what, progress per area, what's next, contact),
  design-6 logo in the header and the `~$ amonel os` lockup in its terminal
  panel, dark and light. Style approved by the owner 2026-09-24 (DECISIONS.md
  70, BR-04): Martian Grotesk / Geist / Geist Mono / Vazirmatn, Departure Mono
  for the terminal line, near-black dark mode; tokens in `soon/tokens.css`,
  fonts in `soon/fonts/` with licences in `public/fonts/` (LEG-15). It is the
  design system for the main site's own pages, not the journey eras (BR-05);
  applying it there was BR-06 (DECISIONS.md 72); **both looks were reverted by the owner on 2026-09-25** (BR-07, DECISIONS.md 73). Search layer (Part 4): title and
  description, Open Graph and Twitter tags, Person JSON-LD (`scripts/soon-seo.mjs`),
  `robots.txt`, `sitemap.xml`; checked by `soon-seo.test.mjs`, `soon-style.test.mjs`
  and `scripts/verify/soon.mjs` (196 checks: fonts, bidi, orphans, word spacing,
  no external request, the legal pages).
- **Coming-soon page, last deploy: 2026-09-24** (Worker `silent-lake-8ae2`, version `bbcc21b1`, 2026-09-25, progress 72 %): the K6 style, the search layer, the 55-character title, the separate `/en/` and `/fa/` pages (SEO-15) and the entity work (SEO-16) are live. Verified with `node scripts/verify/live-soon.mjs` (34 checks incl. /en/ and /fa/: page, title, JSON-LD, OG tags, robots.txt, sitemap.xml, the six legal pages, the fonts, 404, www redirect) and `node scripts/verify/soon.mjs --base https://ahmadreza.de/` (196 checks in a real browser, each language loaded as its own URL). Redeploy whenever the progress changes noticeably (BR-03): `npm run build:soon`, `npx wrangler deploy` in `soon/`, then both scripts.
- **PERF-04 contrast changes accepted (owner, 2026-09-24):** the five palette
  values changed for WCAG AA in the 1946, 1984 and 1995 themes stay; no revert.

**Master plan until launch: ROADMAP.md** (full audit of 2026-09-23, 67 items by
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
- [x] **Phase 9D-2** — Network tools and the Time Machine (DECISIONS.md 63, 64; 2026-09-24)
- [ ] **Phase 9D-3** — easter eggs (APP-08, done 2026-09-24); GSAP DrawSVG (APP-09) is still open
- [x] **Phase 10** — SEO layer: robots.txt, sitemap, llms.txt, JSON-LD, descriptions, OG images, 404, static About page, journey text layer (DECISIONS.md 59); JSON-LD image/sameAs wait for the owner
- [~] **Phase 11** — Legal pages: Impressum and Datenschutzerklärung built in de/en/fa, linked one click from every page (DECISIONS.md 58), CSP in place; owner verification and the pre-launch legal check open (ROADMAP.md LEG-*)
- [~] **Phase 12** — Performance, accessibility, mobile pass: automated accessibility pass done (PERF-04, DECISIONS.md 65); vitals, phone scroll and real devices open (ROADMAP PERF-*)
- [ ] **Phase 13** — Cloudflare deployment: GitHub integration, custom domain, DNS, TLS

## What exists

- **Build:** Next.js 15 static export, Tailwind v4, TypeScript strict. `npm run
  build` emits eighteen pages - the landing page, the journey, the desktop, About, the
  Impressum and the Datenschutzerklärung in de
  (`/`, `/amonel/`, `/desktop/`, `/about/`, `/impressum/`, `/datenschutz/`), en (`/en/…`)
  and fa (`/fa/…`) - into a static `out/`, plus the
  Amonel icon set (SVG and ICO favicons, Apple touch icon, web manifest). Deployment config for Cloudflare Workers with static assets is in
  place (`wrangler.jsonc`, `public/_headers`, `public/_redirects`); not deployed.
- **Landing page** (`/`): name, role, bold key facts, two mode cards, the résumé
  control in the header and under the role, an email link that appears once the
  address is confirmed. Portrait and résumé are owed (TODO.md); the email - the
  Gmail address, the site's only contact since 2026-09-24 (`EMAIL`, one
  constant) - is linked. No journey
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
  - **Network tools** (1995, 2026-09-24, DECISIONS.md 63): a real IPv4 subnet
    calculator (bits drawn network/host, address kinds, the gateway check of
    the 1995 puzzle, splitting), ping in Windows 95 style and an iterative DNS
    lookup with a cache - both labelled simulations over the Traceroute routes
    and a `.example` zone - and the well-known ports with their IANA ranges.
    Easter eggs: 127.0.0.1, APIPA, port 31337, a TXT greeting. Stores nothing,
    sends nothing.
  - **Time Machine** (today, 2026-09-24, DECISIONS.md 64): re-skins the whole
    desktop into any of the eight themes through the unchanged theme engine;
    eight capsules drawn in their own era's tokens, a year dial counting to the
    target, "enter any year", back to the present. The era is remembered in
    `amonel.theme.v1` (only after a jump, removed on return) and read only by
    the desktop; every other page keeps its own theme.
  - **Batch planner** (1956, APP-06): edit up to six jobs and watch first come first served, shortest job first and round robin run them - the sequence drawn to scale, waiting and turnaround per job, the three averages compared; stores nothing.
  - **File tree** (1971, APP-07): the Terminal's own tree, clickable; the selected path step by step, its `~` form and the Terminal commands that reach it; dot files behind a switch; stores nothing.
- **The core apps** (Phase 7, DECISIONS.md 50), each its own lazy chunk with its
  own copy file per language:
  - **About:** who Ahmadreza is, his path, what he does now, skills by area,
    languages, résumé and email - from `src/content/about.ts`; owed facts shown
    as marked placeholders.
  - **Terminal:** a small bash-like shell over an in-memory filesystem - `ls`,
    `cd`, `cat`, `pwd`, history, Tab completion, real error messages - plus
    `about`, `skills`, `projects`, `cv`, `contact` - and hidden commands
    (`moth`, `sl`, `coffee`, `fortune`, `uptime` and more, APP-08) that `help` never lists.
  - **Tickets:** nine helpdesk cases at a fictional company, each with symptom,
    diagnosis steps with real command output, solution and lesson; filter by
    status, sort.
  - **Traceroute:** a labelled simulation over four prepared routes, the packet
    travelling hop by hop with its latency, and where the time went.
  - **Assistant** (Phase 8B, DECISIONS.md 53): a local search over `src/content/`, built by `src/lib/search/` and run entirely in the visitor's browser - no Worker call, no key, no external AI service. It normalises a question (case, diacritics, Persian letter and digit variants) and matches it against an index built at build time, returning the best passages labelled with their source, or an honest "nothing found" with the example questions again. Four visible states (idle, searching, answered, noMatch), reduced motion shows the finished answer.
  - **Computer-Quiz** (Phase 9B, DECISIONS.md 55): ten questions a round from a bank of 30, every era asked at least once, each going back to its era's one truth; after each answer right or wrong in words and a mark, the right answer, the era and a short explanation; at the end the score, a friendly line, the eras worth a second look and "Neue Runde". Never presented as a test of the visitor. The best score is one number in this browser (`amonel.quiz.v1`). Keyboard-playable, verdicts and score announced live, right to left in Persian, fullscreen on phones. Not in the dock, and never in the Assistant's index.
  - **Contact** (2026-09-23): e-mail (`mailto:` and a copy button, never a form), résumé, location, profile links once `content/profiles.ts` has URLs, the legal pages. **Timeline** (2026-09-23): the seven eras with their truths and a link into the journey at each, then the current station. CV is still a placeholder (waiting for the owner).
- **The Worker** (`worker/`, Phase 9C, DECISIONS.md 56): answers only `/api/*` (`assets.run_worker_first`); the rest of the site is served from `out/` as before. It holds the **anonymous public counters** - a name and an integer per row in one D1 table (`COUNTERS_DB`, `migrations/0001_counters.sql`), nothing about the visitor. `POST /api/count/<name>` (allowlist from `src/lib/counters.ts`, built from the era and app registries; 404 unknown, 405 not POST, 403 foreign Origin) increments atomically; `GET /api/counts` returns the totals, cached for a minute; everything else is 404. Counted: an era puzzle solved by hand in Play (never a guided auto-solve or a shown solution), a finished quiz round (no score), reaching the Convergence, the mode card on the landing page, every app opened - each name once per page load, in memory, no storage key. Shown, lazily and only from 10 up (Persian digits in fa): under a puzzle's outcome in the Play dialog, under the quiz result, and a small "Diese Website in Zahlen" section at the end of About. Without the Worker (any plain server, `next dev`) nothing is sent after the first failure and no number appears. Worker logs are off (DECISIONS.md 62). **Not deployed:** the D1 database and the rate-limiting rule are created by hand in Phase 13 (TODO.md). The Gemini proxy of Phase 8A is gone (DECISIONS.md 53), still in the git history.
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
  so all of them can run against the real export; `a11y.mjs` (PERF-04) runs axe-core over every view, every app and all eight themes, and `contrast.test.mjs` pins the themes' WCAG contrast; `vitals.mjs` (PERF-05) measures FCP, LCP, CLS and TBT per view. Every script takes `--quiet`, and `matrix.mjs` runs the whole matrix with one line per configuration (DECISIONS.md 51). CLAUDE.md is 197 lines, three core rules plus pointers; its specialised rules live in `.claude/skills/` (`seo` added in Phase 8B).

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

Phase 9D-2 (`scripts/verify/sizes.mjs`, gzip -6): each app is its own lazy chunk;
the views grow only by the registry line.

| | Before 9D-2 | After 9D-2 |
|---|---|---|
| Landing / Journey / Desktop: JS loaded | 136.6 / 226.7 / 147.5 kB | 138.0 / 228.3 / 148.9 kB (incl. the Part A changes of 2026-09-24) |
| Network tools on open (code + copy, de) | - | **13.8 kB** (9.0 + 4.8) |
| Time Machine on open (code + copy, de) | - | **3.9 kB** (2.6 + 1.3); `DesktopTheme` adds 0.6 kB to the one route chunk every view loads (landing / journey / desktop 138.6 / 228.9 / 149.5 kB) |

## Core Web Vitals (PERF-05, DECISIONS.md 66)

`scripts/verify/vitals.mjs`, median of three cold loads (no cache) of the
export served gzipped by `serve.mjs` (Cloudflare sends brotli, a little
smaller). Phone: 380 x 800, touch, 4x CPU slowdown, 1.6 Mbit/s, 150 ms RTT
(Lighthouse's slow-4G shape). Desktop: 1280 x 800, unthrottled. Budgets:
phone LCP 2.5 s, CLS 0.1, TBT 200 ms; desktop LCP 1.5 s, CLS 0.1, TBT 100 ms.

| 2026-09-24 | FCP | LCP | CLS | TBT |
|---|---|---|---|---|
| phone · landing | 1.02 s | 1.02 s | 0.027 | 85 ms |
| phone · journey | 1.64 s | 1.64 s | 0.019 | **503 ms** (over; PERF-02) |
| phone · desktop | 2.58 s | **2.59 s** (over by 0.09 s; PERF-09) | 0 | 0 ms |
| phone · About | 1.03 s | 1.03 s | 0.055 | 95 ms |
| desktop · landing | 84 ms | 84 ms | 0.010 | 0 ms |
| desktop · journey | 264 ms | 264 ms | 0.006 | 0 ms |
| desktop · desktop | 836 ms | 836 ms | 0 | 0 ms |
| desktop · About | 108 ms | 108 ms | 0 | 0 ms |

The desktop view paints nothing contentful until its client-only shell has
loaded (the server paints the text-free frame the Convergence ends on), so its
first paint waits for hydration plus the 11 kB shell chunk; a visitor who
arrives from the landing page or the journey already has every shared chunk
cached. The journey's blocking time on a slowed phone is the era scrubbing
PERF-02 addresses.

## Scroll performance (DECISIONS.md 48)

A full scroll of the journey with real input, on the production export
(`scripts/verify/perf.mjs`, headless Chrome):

| Run | fps | median / p95 frame | frames > 33 ms | long tasks (worst) |
|---|---|---|---|---|
| 1280, full tier, GPU path | 58.4 | 16.7 / 16.8 ms | 41 | 6 (59 ms) |
| 1280, full tier, no GPU | 56.0 | 16.7 / 33.3 ms | 119 | 7 (56 ms) |
| 380, light tier, 4x CPU throttle, GPU path | 42.2 | 16.7 / 50 ms | 532 | 50 (324 ms) |
| 380, light tier, 4x CPU throttle, no GPU | 43.3 | 16.7 / 50 ms | 520 | 49 (321 ms) |

**2026-09-24, before and after PERF-02** (DECISIONS.md 67). The journey had
grown since the table above (the SEO text layer, counters, unlocks), and the
"before" column is today's baseline on this machine:

| Run | before: fps · long tasks (worst) | after: fps · long tasks (worst) |
|---|---|---|
| 1280, full tier, GPU path | - | 57.3 · 6 (60 ms) |
| 1280, full tier, no GPU | 48.2 · 9 (94 ms) | 53.4 · 7 (63 ms) |
| 380, light tier, 4x CPU, GPU path | 35.8 · 114 (428 ms) | 38.3 · 78 (368 ms) |
| 380, light tier, 4x CPU, no GPU | 35.6 · 113 (452 ms) | 38.7 · 75 (519 ms) |

Desktop: the remaining long tasks are the theme switch at each crossing's
midpoint. Throttled phone: above the 30 fps floor, but each era's own scrubbing
still produces long tasks - restructuring the heavy visuals is Phase 12 work.

## Not built yet

- The CV app has its layout but only marked placeholder entries and no PDF (waiting for the owner, APP-03, OWN-02, OWN-05). Contact and Timeline (2026-09-23), Network tools and the Time Machine (2026-09-24) are built.
- The bonus apps' copy (Phase 9D-1) is a draft awaiting native-speaker
  proofreading (TODO.md). The Morse tone has only run in headless Chrome,
  where nothing is heard; touch and pen were emulated.
- The quiz copy is a draft awaiting native-speaker proofreading (TODO.md).
- The counter copy (Phase 9C) is a draft too, and the counters have only run
  under `wrangler dev --local` and against a CDP stub: the real D1, the edge
  cache and the rate-limiting rule exist only after Phase 13 (TODO.md).
- The phone keyboard handling (Terminal, Assistant) was checked in emulation only.
- The hidden Legende badges show in the Timeline app once earned (APP-10); nowhere else.
- The motion tiers have only been measured in headless Chrome; no real phone or
  Safari/Firefox run yet (Phase 12).
- Audio: a switch (off on every load, in memory only) plays generic synthesised sounds on opening and closing an app, per era profile (APP-12).
- (Phase 10 is complete except JSON-LD `image`/`sameAs`, which wait for the
  portrait and the profiles.) OG images: `public/og/`, from `scripts/og-image.mjs`.
- **Static About page** (`/about/`, en, fa; DECISIONS.md 59): the About app's
  component rendered on the server, linked from every page footer, in the
  sitemap. **CSP** in `_headers` (everything `'self'`); `serve.mjs --headers`
  runs the checks under it.
- **SEO layer, built 2026-09-23** (Phase 10, partly): `robots.txt` (every
  crawler, the AI bots named), `sitemap.xml` (nine URLs with hreflang, legal
  pages left out), `llms.txt`, JSON-LD (Person with the Persian name, WebSite,
  ProfilePage on the landing page; no image or `sameAs` yet), a description
  per view, and a trilingual 404 page with a real 404 status. The fonts and
  the stylesheet are imported by the root layout now, so the 404 is styled.
- **Legal pages** (Phase 11, DECISIONS.md 58): built in all three languages
  from `messages/legal/`, `noindex`, the legal name only in `content/legal.ts`,
  the postal address only in the git-ignored `content/legal.local.ts` (the build
  stops without it; git history purged of it on 2026-09-24, DECISIONS.md 60);
  status "LEGAL – owner must verify". The coming-soon page now lives in
  `soon/` with the same legal pages (`npm run build:soon`), live on
  ahmadreza.de since 2026-09-23 (Worker `silent-lake-8ae2`). Rebranded to Amonel
  on 2026-09-24; its progress figure (roadmap items done, the current phase) is
  computed from ROADMAP.md at build time by `scripts/roadmap.mjs`, so it is as
  fresh as the last deploy (ROADMAP BR-03).
- Deployment of the real site (only the coming-soon page is live).
