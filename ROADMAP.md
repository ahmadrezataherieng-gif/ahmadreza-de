# Roadmap - the master plan until launch

This is the **single master plan** for ahmadreza.de until launch. Every new
idea, missing piece or postponed task goes in here, so nothing is forgotten
before the final phase. PROJECT_STATE.md says what exists; TODO.md holds the
detailed open questions for the owner; DECISIONS.md explains why things are the
way they are; CONTENT_REVIEW.md lists every placeholder text.

Audited against the concept in CLAUDE.md and the phase plan (0-13) in
PROJECT_STATE.md on 2026-09-23. Baseline at the audit: `npm run build`, `npm run
lint` and `npm test` (142 tests) all green; nine pages generated.

## How to read this file

- **ID** - stable, never reused. New items get the next free number in their group.
- **Status** - `missing` (nothing built), `partial` (started, stubbed or built but
  not live), `done`. An item that cannot move without the owner is also marked
  **waiting for owner** in its description.
- **Priority** - `P0` legal or blocking the launch, `P1` core, `P2` nice-to-have.
- **Owner** - `Claude Code`, `Ahmadreza`, or both (Claude Code builds, Ahmadreza decides or supplies).
- **Depends on** - IDs that must be done first.
- **Effort** - the size of the whole item: `XS` = 1, `S` = 2, `M` = 5, `L` = 8,
  `XL` = 13. A `partial` item adds how much of it is really done, e.g. `M 40%`;
  `done` counts 100 %, `missing` 0 %. Progress = done weight / total weight.
- **Area** - one of seven groups a visitor understands, shown with its own
  progress on the coming-soon page: `journey` (the journey through computer
  history), `desktop` (Amonel OS and its apps), `puzzles` (puzzles and games),
  `about` (about me, CV and contact), `legal` (legal and privacy), `seo` (search
  engines, speed and accessibility), `launch` (final texts, logo and launch).

## Summary

Recount after each change: `node scripts/roadmap.mjs --write` rewrites both
tables (the same parser gives the coming-soon page its progress figures, at
build time).

<!-- progress:start -->
| Area | done | in progress | to do | weight done / total | progress |
|---|---|---|---|---|---|
| `journey` | 6 | 0 | 1 | 49 / 62 | 79 % |
| `desktop` | 13 | 0 | 0 | 66 / 66 | 100 % |
| `puzzles` | 8 | 0 | 0 | 38 / 38 | 100 % |
| `about` | 2 | 2 | 5 | 15.1 / 26 | 58 % |
| `legal` | 12 | 1 | 5 | 31 / 45 | 69 % |
| `seo` | 19 | 3 | 5 | 62.7 / 84 | 75 % |
| `launch` | 12 | 2 | 12 | 44.5 / 97 | 46 % |
| **all** | 72 | 8 | 28 | 306.3 / 418 | **73 %** |
<!-- progress:end -->

| | missing | partial | done | total |
|---|---|---|---|---|
| P0 | 9 | 1 | 12 | 22 |
| P1 | 11 | 6 | 39 | 56 |
| P2 | 8 | 1 | 21 | 30 |
| **total** | **28** | **8** | **72** | **108** |

## Built before the audit (phases 0 to 9D-1)

Added 2026-09-24 so the weighted progress covers the whole site, not only
what was left on 2026-09-23. One row per block of finished work; details in
PROJECT_STATE.md and DECISIONS.md.

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| BASE-01 | **Foundations** (phases 0-1): static export, three languages with right-to-left Persian, design tokens, self-hosted fonts. | done | P1 | Claude Code | - | L | seo |
| BASE-02 | **Theme engine**: eight era themes as CSS custom properties, also per subtree. | done | P1 | Claude Code | - | M | journey |
| BASE-03 | **Journey scaffold** (phase 2): scroll machinery (Lenis, ScrollTrigger resolver), sections, the unlock store. | done | P1 | Claude Code | - | L | journey |
| BASE-04 | **Era visuals 1946, 1956, 1971, 1981** (phase 3). | done | P1 | Claude Code | - | XL | journey |
| BASE-05 | **Era visuals 1984, 1995, today and the Convergence** into the desktop (phase 4). | done | P1 | Claude Code | - | XL | journey |
| BASE-06 | **Crossings between eras, CSS 3D depth, motion tiers** (phase 5.5B). | done | P1 | Claude Code | - | L | journey |
| BASE-07 | **Puzzle engine, Guided and Play modes, the seven era puzzles** with hint and solution from the first moment (phase 5). | done | P1 | Claude Code | - | XL | puzzles |
| BASE-08 | **Concept pass** (phase 5.5A): Play-mode gates, the working insider tricks, "Sie" everywhere. | done | P1 | Claude Code | - | M | puzzles |
| BASE-09 | **Landing page** (phase 5): name, role, facts, the two ways into the journey. | done | P1 | Claude Code | - | M | about |
| BASE-10 | **Desktop shell** (phase 6): window manager, taskbar, launcher, mobile home screen. | done | P1 | Claude Code | - | XL | desktop |
| BASE-11 | **Core apps** (phase 7): About, Terminal, Tickets, Traceroute. | done | P1 | Claude Code | - | L | desktop |
| BASE-12 | **Assistant** (phases 8A-8B): a local search over the site's content, in the browser. | done | P1 | Claude Code | - | M | desktop |
| BASE-13 | **Computer-Quiz** (phase 9B). | done | P1 | Claude Code | - | M | puzzles |
| BASE-14 | **Bonus-app unlocks; Binary & Morse, Snake, Pixel Paint** (phase 9D-1). | done | P1 | Claude Code | - | L | puzzles |
| BASE-15 | **Anonymous counters**, Worker + D1 (phase 9C; going live is DEP-05). | done | P1 | Claude Code | - | M | launch |
| BASE-16 | **Rebrand to Amonel** (phase 9A): names, routes, logos, icons. | done | P1 | Claude Code | - | S | launch |
| BASE-17 | **Check harness**: the browser checks in `scripts/verify/` and `npm test`. | done | P1 | Claude Code | - | M | seo |

## Phase 9D-2 / 9D-3 - the remaining apps (Act 3)

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| APP-01 | **Timeline app** (base app): the seven eras and Ahmadreza's own path as one scrollable timeline, from `content/eras.ts` and `content/about.ts`. Today the placeholder. Built 2026-09-23: the eras from the journey's own copy (the page-messages chunk the puzzles already load) with links to `/amonel/#era-N`, then the current station from About's copy; its start date is owed (OWN-05). | done | P1 | Claude Code | - | M | desktop |
| APP-02 | **Contact app** (base app): today a placeholder with the `mailto:` link. Needs the full app: email, profiles (LinkedIn, GitHub, XING once OWN-03 is done), résumé, the legal links. `mailto:` only, never a form. Built 2026-09-23: its own copy, e-mail with a copy button, résumé, location, legal links; the profile links are **waiting for owner** (OWN-03) - add the URLs in `src/content/profiles.ts`. | partial | P1 | Claude Code | OWN-03 for the profile links | S 80% | about |
| APP-03 | **CV app** (base app): today a placeholder. A readable CV view from `content/` plus the PDF download. The structure can be built now; the entries are **waiting for owner** (OWN-02, OWN-05). Built 2026-09-24: `content/cv.ts` (structure), `apps/cv/CvApp.tsx` (a readable sheet: contact, work and training, school, skills, languages, certificates), copy in `messages/apps/cv/`; the apprenticeship, skills and languages reuse About's; every entry is a marked placeholder and the PDF control still says "folgt in Kürze" (OWN-02, OWN-05 fill it); CR-1096, `apps.mjs` and `apps.test.mjs` check it. | partial | P1 | Claude Code + Ahmadreza | OWN-02, OWN-05 | M 70% | about |
| APP-04 | **Network tools app** (1995 bonus, slot `network-tools`): four tabs. **Subnet** - a real IPv4 calculator (CIDR, dotted or slash mask), the 32 bits coloured network/host, network/broadcast/first/last/usable, the address kind (private, APIPA, CGNAT, documentation, loopback...), a gateway check (the 1995 puzzle's question) and splitting a block into smaller ones. **Ping** - Windows 95 style output over the Traceroute app's prepared routes (same times), loopback, silent documentation addresses. **DNS** - an iterative lookup (resolver, root, TLD, authoritative) over a prepared `.example` zone, A/AAAA/MX/TXT/CNAME, CNAMEs followed, and the cache: a second lookup answers in 0 ms until the TTL. **Ports** - well-known ports by number or name with the three IANA ranges. Ping and DNS are labelled simulations, never real network requests. Built 2026-09-24 (DECISIONS.md 63): `apps/network/`, `content/network.ts`, 13 unit tests, `bonus.mjs` drives all four tabs; copy CR-1067..1073. | done | P1 | Claude Code | - | L | desktop |
| APP-05 | **Time Machine app** (today bonus, slot `time-machine`): theme switcher over the eight themes; writes `amonel.theme.v1` (then LEG-02 must list it as used); restyles Snake via `--ao-snake-*`. Built 2026-09-24 (DECISIONS.md 64): eight capsules drawn in their own era's tokens, a year dial that counts to the target, "enter any year" (1946 to now lands in the era current then), back to the present; only the desktop remembers the era (`DesktopTheme`); LEG-02 storage table updated in de/en/fa; `check:pixel-font` now scans every desktop string. | done | P1 | Claude Code | LEG-02 update in the same change | M | desktop |
| APP-06 | **Scheduler app** (1956 bonus, slot `scheduler`): a batch/CPU scheduling sandbox (FCFS, SJF, round robin) that extends the era's one truth. Built 2026-09-24: `apps/scheduler/sched.ts` (pure, 7 tests: the puzzle's 115 vs 31 minutes, hand-worked round robin, invariants), `SchedulerApp.tsx` (edit up to six jobs, the sequence drawn to scale, waiting and turnaround per job, the three averages side by side, the best marked; nothing stored), copy `messages/apps/scheduler/`; CR-1097; `bonus.mjs` and `a11y.mjs` (eight themes) check it. | done | P2 | Claude Code | - | M | desktop |
| APP-07 | **Filesystem app** (1971 bonus, slot `filesystem`): a file-tree explorer over the Terminal's in-memory tree, paths shown as you click. Built 2026-09-24: `apps/filesystem/paths.ts` (pure, 5 tests, reads the Terminal's own tree through the new `readDir`/`readFile` in `terminal/shell.ts`), `FilesystemApp.tsx` (click through the tree; the selected path from the root step by step, in the short `~` form, and as the Terminal commands that reach it; dot files behind a switch like `ls -a`; file contents); copy `messages/apps/filesystem/`; CR-1098; `bonus.mjs`, `desktop.mjs` and `a11y.mjs` check it. The stand-in `BonusApp` and `AppPlaceholder` are gone. | done | P2 | Claude Code | - | M | desktop |
| APP-08 | **Easter eggs** through `HIDDEN_COMMANDS` in `terminal/shell.ts` (empty today). Done 2026-09-24 (DECISIONS.md 68): moth, sl, coffee (HTTP 418), rm -rf, vim/vi/nano/emacs, hire, fortune (seven sourced facts), uptime, ping - own ASCII drawings, copy under `eggs` (CR-1078), tested in `terminal-shell.test.mjs` and `apps.mjs`. | done | P2 | Claude Code | - | S | puzzles |
| APP-09 | **Line-drawing effects** (was: GSAP DrawSVG, free plugin; never ScrollSmoother). Done 2026-09-24 in CSS instead of the plugin (DECISIONS.md 71): `.ao-draw` scrubs `stroke-dashoffset` over `--era-progress`, no plugin, no per-frame JS; used for the four links of the 2024 region map. | done | P2 | Claude Code | - | S | journey |
| APP-10 | **"Legende" badges** are recorded (`selectLegendEras`) but never displayed. Done 2026-09-24: the Timeline app shows the earned badges (a "Legende" mark on the era, and a count once one exists; nothing before); `apps.mjs` checks both states; CR-1092. | done | P2 | Claude Code | - | S | puzzles |
| APP-11 | **Quiz result links** its missed eras to `/amonel/#era-N` (the journey honours the hash since 9D-1). Done 2026-09-24: each missed era in the result has a button that opens the journey at its section (through `replayJourney`, like the locked-app notice); `apps.mjs` checks the hashes; CR-1091. | done | P2 | Claude Code | - | XS | puzzles |
| APP-12 | **Audio** - every theme's `sound` profile. Done 2026-09-25: `lib/sound.ts` (per profile and event a few synthesised tones, pure, 3 tests: short, soft, in range, every theme covered), `lib/sound-engine.ts` (Web Audio, created only by the click on the new sound switch in the taskbar and the phone home screen; off on every load, not persisted, so **no new storage key** and the Datenschutz table needs no change), plays on opening and closing an app; the profile is read from `<html data-sound>`. `desktop.mjs` proves no AudioContext exists before the click. CR-1099. | done | P2 | Claude Code | - | M | desktop |
| APP-13 | Terminal `ask` command that hands a question to the Assistant. Done 2026-09-24: `ask <question>` opens the Assistant (window or phone app) and it answers at once, through `lib/app-handoff.ts` (two window events, one waiting value, no storage); listed in `help`, completed by Tab; `terminal-shell.test.mjs` and `apps.mjs` cover it; CR-1093. | done | P2 | Claude Code | - | S | desktop |
| APP-14 | Locked-app notice covers the lowest desktop icon on a 768 px tall screen; move it. Done 2026-09-24: on the window manager the notice sits at the inline-end, clear of the icon columns (`.ao-notice-slot`); `bonus.mjs` now checks that no icon lies under it, on every layout. | done | P2 | Claude Code | - | XS | desktop |
| APP-15 | **Network tools easter eggs** (new idea 2026-09-24): `ping 127.0.0.1` answers with "there's no place like 127.0.0.1"; a 169.254.x.x address explains APIPA (the address Windows 98 gave itself when no DHCP server answered); port 31337 tells its hacker-culture story; a hidden TXT record on `amonel.example` greets the curious. Built with APP-04. | done | P2 | Claude Code | APP-04 | S | puzzles |
| APP-16 | **Cross-app links** (new idea 2026-09-24): Ports links to the 'today' era's firewall puzzle (`/amonel/#era-7`) - built. Done 2026-09-24: Ping and DNS offer "trace this host" (once the ping has a target / the lookup found something); the host goes through `lib/app-handoff.ts` (the mechanism of APP-13) to the Traceroute app, in a window or on the phone; `bonus.mjs` checks both; CR-1094. | done | P2 | Claude Code | APP-04 | S | desktop |
| APP-17 | **Time Machine extras** (new idea 2026-09-24): the era's sound profile as a short sample on arrival (with APP-12, only after a click), and each era's cursor style on the desktop (`data-cursor` is already set). Done 2026-09-25: arriving plays the era's `arrive` sound when sound is on (nothing otherwise), and `[data-cursor]` now changes the desktop: a 1-bit arrow for the Macintosh and Windows 95 eras (inline SVG, CSP allows data: images), a block or underscore text caret for the terminal eras; `bonus.mjs` checks the pointer. | done | P2 | Claude Code | APP-12 | S | desktop |

## Phase 10 - SEO layer

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| SEO-01 | **robots.txt** allowing all crawlers, explicitly including the AI bots (OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, Claude-User, ClaudeBot, PerplexityBot, CCBot, Google-Extended, meta-externalagent), plus the sitemap line. Built 2026-09-23: `public/robots.txt`, pinned by `scripts/test/seo.test.mjs`. | done | P1 | Claude Code | - | XS | seo |
| SEO-02 | **sitemap.xml** with every generated URL and its hreflang alternates (`xhtml:link`), generated at build time from `allRouteSegments()`. Built 2026-09-23: `src/app/sitemap.ts` → `out/sitemap.xml`, nine URLs, legal pages left out. | done | P1 | Claude Code | - | S | seo |
| SEO-03 | **JSON-LD**: Person (`name`, `alternateName` = "احمدرضا طاهری" (never the legal name, owner 2026-09-23), `jobTitle`, `address` Trier, `knowsAbout`, `knowsLanguage`, `image` once OWN-01, `sameAs` once OWN-03), WebSite, ProfilePage. Built 2026-09-23 (`src/lib/structured-data.ts`, in every indexed page's head); `image` and `sameAs` **waiting for owner** (OWN-01, OWN-03). `sameAs` now fills itself from `content/profiles.ts` once the URLs are there. | partial | P1 | Claude Code | OWN-01, OWN-03 (can ship without, then extend) | M 80% | seo |
| SEO-04 | **llms.txt**: a plain-text summary of the person and the site for AI crawlers. Built 2026-09-23: `public/llms.txt`, facts the site already states, both spellings of the name. | done | P1 | Claude Code | - | XS | seo |
| SEO-05 | **Open Graph share image**: one 1200 x 630 PNG per language (or one shared), `og:image`, `og:image:alt`, `twitter:card`. Built 2026-09-23: `scripts/og-image.mjs` renders one PNG per language (about 47 kB each) in headless Chrome with the self-hosted fonts; og:image with alt, twitter summary_large_image. Regenerate for the final logo (BR-01). | done | P1 | Claude Code | BR-01 for the final version | S | seo |
| SEO-06 | **Per-page meta descriptions**: the journey and the desktop reuse `site.description`; each view (and each new page) needs its own. Done 2026-09-23: `site.journeyDescription`, `site.desktopDescription`; legal pages have their own; drafts run 140-190 characters (CR-1051). | done | P1 | Claude Code | - | S | seo |
| SEO-07 | **hreflang + canonical** per view incl. `x-default` - done for the nine pages; every new page (legal, About, 404 excluded) must emit them too. | done | P1 | Claude Code | - | S | seo |
| SEO-08 | **Persian name "احمدرضا طاهری" coverage**: in `site.title`/`author` (fa) and About (fa) today; missing in JSON-LD, llms.txt, the static fa About page, the fa OG image alt. Since 2026-09-23 also in JSON-LD (`alternateName`), llms.txt and the fa About page; only the OG image alt is left (SEO-05). Done 2026-09-23 with the fa OG image and its alt text. | done | P1 | Claude Code | SEO-03, SEO-04, SEO-09 | S | seo |
| SEO-09 | **Static, indexable About pages** at `/ueber-mich/`, `/en/about/`, `/fa/about/` (URL to be confirmed): real HTML text from `content/about.ts`, one h1, linked from landing and footer. Built 2026-09-23 at `/about/` in all three locales (one slug, like the legal pages): the About app's own component rendered on the server, name as h1, in the sitemap, linked from every page footer (DECISIONS.md 59). | done | P1 | Claude Code | - | M | about |
| SEO-10 | **Journey text fallback**: today a screen-reader-only list of the eras; expand to the full SEO layer (one truth, insider detail, puzzle summary per era) as real static text. Done 2026-09-23: per era an h2 with year and name, the truth, the era paragraph, the figures and the insider detail, plus links to the desktop and About - the same sentences the scenes show; puzzle copy stays out (budget). Journey HTML de 43.2 kB gz (limit 48). | done | P1 | Claude Code | - | M | seo |
| SEO-11 | **Custom 404 page**: localised, on-brand, `noindex`, links home / desktop / journey; replaces Next's default `404.html` that `not_found_handling: "404-page"` serves. Built 2026-09-23: `src/app/not-found.tsx`, one page in all three languages (a stray URL has no locale), real 404 status, noindex; fonts and CSS moved to the root layout so it is styled. | done | P1 | Claude Code | - | S | seo |
| SEO-12 | **Submit the sitemap and request indexing** (reworded 2026-09-24): Google Search Console already has a verified Domain property, so only submit `sitemap.xml` there and request indexing for `/`, `/en/` and `/fa/`; submit the same sitemap in Bing Webmaster Tools. | missing | P1 | Ahmadreza | SEO-02 | XS | seo |
| SEO-16 | **Entity signals** (2026-09-24, Claude Code): one JSON-LD `@graph` (Person with name variants and `knowsAbout`, WebSite named after the person, Amonel as a separate CreativeWork, ImageObject), on the main site and on the coming-soon pages; share images renamed to `ahmadreza-taheri-<locale>.png`; `anthropic-ai` in robots.txt. The coming-soon pages carry it live (version `8eac93e8`); follow-ups: knowsAbout in seven matching concepts, the repair background in descriptions and the landing subline, 301s from the old share-image URLs (in the repo, deploy pending). | done | P1 | Claude Code | - | S | seo |
| SEO-17 | **Cloudflare AI bot policies** (owner, 2026-09-24): Search, Agent and Training all set to Allow, so ClaudeBot and anthropic-ai no longer get a 403. | done | P1 | Ahmadreza | - | XS | seo |
| SEO-13 | Web manifest per language. Done 2026-09-24: `manifest.webmanifest` (de), `manifest.en.webmanifest`, `manifest.fa.webmanifest` (own `lang`, `dir`, start URL and scope), chosen by the layout; CR-1090. | done | P2 | Claude Code | - | XS | seo |
| SEO-14 | Landing titles ran over 60 characters (de 68, en 66, fa 74). Drafted 2026-09-24 as `site.landingTitle` (de 55, en 58, fa 44, name first and whole, in the style of the coming-soon titles), pinned by `seo.test.mjs`; CR-1095. The wording is **waiting for owner** (FIN-01). | partial | P2 | Claude Code + Ahmadreza | FIN-01 | XS 50% | seo |
| SEO-15 | **Static /en/ and /fa/ versions of the coming-soon page** (built 2026-09-24: separate pages with hreflang, canonical, JSON-LD and a three-URL sitemap; copy in `soon/copy.mjs`, CR-1086) (new 2026-09-24): today it is one German URL that switches language in the browser, so a crawler that does not run scripts sees German plus the English and Persian lines under the role. Separate pages with hreflang would let the English and Persian texts rank on their own. Only until launch; decide with the owner whether it is worth it. | done | P2 | Claude Code | - | S | seo |

## Phase 11 - Legal

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| LEG-01 | **Impressum** at `/impressum/` (+ `/en/`, `/fa/`), § 5 DDG and § 18 Abs. 2 MStV, legal name "Ahmadreza Taheri Momrabadi" (the only place it may appear). Built 2026-09-23 (DECISIONS.md 58), `noindex`. | done | P0 | Claude Code + Ahmadreza | OWN-07 | M | legal |
| LEG-02 | **Datenschutzerklärung** at `/datenschutz/` (+ en, fa), written from an audit of the real data flows: Cloudflare hosting and logs, no external requests, the browser storage table, the anonymous counters, the local assistant, email contact, rights, LfDI RLP. German binding. Built 2026-09-23; the audit found no external request, so nothing had to be self-hosted. | done | P0 | Claude Code + Ahmadreza | OWN-07 | L | legal |
| LEG-03 | **Legal links in the footer of every view** (landing, journey, desktop, About, 404) - one click from every page, labelled exactly "Impressum" / "Datenschutz". Done for every existing view: landing and legal footers, desktop top bar, home screen, journey chrome corner; new pages (About, 404) must add `SiteFooter`. | done | P0 | Claude Code | LEG-01, LEG-02 | S | legal |
| LEG-04 | **Legal pages and links on the live "coming soon" page** (Worker `silent-lake-8ae2`), deployed to production. Built in `soon/` (`npm run build:soon`), deployed 2026-09-23; ahmadreza.de/impressum/ and /datenschutz/ (and en, fa) verified live. | done | P0 | Claude Code | LEG-01, LEG-02 | S | legal |
| LEG-05 | **Legal check of every feature before launch** (DSGVO, TDDDG, DDG, copyright, image rights): no external request, no cookie, no consent banner needed, storage table complete. Preliminary audit written 2026-09-25 (TODO.md, "Preliminary LEG-05 audit"): no external request, no cookie, storage table complete; open points listed there. The final check still waits for all feature work and the owner. | partial | P0 | Claude Code + Ahmadreza | all feature work | M 40% | legal |
| LEG-06 | **Content-Security-Policy** in `public/_headers` (the comment there still mentions the removed Gemini proxy); `connect-src 'self'`, no third-party origins. Done 2026-09-23: every fetch type locked to 'self' (scripts/styles also 'unsafe-inline', no nonces in a static export); pinned by `legal.test.mjs`; `serve.mjs --headers` runs the checks under it (apps, bonus, desktop pass). | done | P1 | Claude Code | - | S | legal |
| LEG-07 | **Owner verifies the legal texts** (CONTENT_REVIEW.md status "LEGAL – owner must verify"); ideally a lawyer or the Verbraucherzentrale reads them once. | missing | P0 | Ahmadreza | LEG-01, LEG-02 | M | legal |
| LEG-08 | **Employer name removed everywhere; may only be added with the employer's written permission.** Done 2026-09-24 (owner): gone from the coming-soon page (text, title, description), the landing role and facts, the meta descriptions, About, llms.txt and the docs; the role line is now "Fachinformatiker für Systemintegration in Ausbildung · Trier" (CR-1079). `scripts/test/employer.test.mjs` fails if the name is in any tracked file or in `out/` / `soon/dist/`. The name remains in the git history. | done | P0 | Ahmadreza | - | XS | legal |
| LEG-09 | **Written usage rights for the portrait** from the photographer before it goes online. | missing | P0 | Ahmadreza | OWN-01 | S | legal |
| LEG-10 | **Check "Amonel"** in the DPMA and EUIPO registers before any commercial use. | missing | P1 | Ahmadreza | - | S | legal |
| LEG-11 | **Cloudflare features that set cookies stay off** (Bot Fight Mode, challenges, Waiting Room, Always Online); rate limit only by IP with Block. Check at deploy. | missing | P0 | Ahmadreza | DEP-06 | XS | legal |
| LEG-12 | **Home address out of GitHub** (owner, 2026-09-24): the address moved to the git-ignored `src/content/legal.local.ts` (template `legal.example.ts`), `scripts/legal-address.mjs` stops every build without it; the whole git history rewritten with `git filter-repo` and force-pushed, backup bundle outside the repo (DECISIONS.md 60). | done | P0 | Claude Code | - | S | legal |
| LEG-13 | **Phone number in the Impressum** (the § 5 DDG grey area: a "second fast way" of contact besides e-mail). **Resolved 2026-09-24 by the owner: no phone number.** The Impressum keeps name, postal address and e-mail; nothing to build. | done | P0 | Ahmadreza | - | XS | legal |
| LEG-14 | **Worker logs off** (owner, 2026-09-24): `observability` (logs and invocation logs) disabled in `wrangler.jsonc` (counter Worker `ahmadreza-de`, never deployed yet - takes effect at DEP-06) and `soon/wrangler.jsonc` (live coming-soon Worker, redeployed); the counter-log sentence removed from the Datenschutzerklärung in de/en/fa; pinned by `worker.test.mjs` (DECISIONS.md 62). | done | P0 | Claude Code | - | XS | legal |
| LEG-15 | **Font licences shipped with the fonts** (owner, 2026-09-24): every self-hosted font's OFL licence file in `public/fonts/licenses/` and a credits list in `public/fonts/LICENSES.md` (the five fonts of the site and the five of the coming-soon page, Martian Grotesk and Departure Mono from their authors' GitHub releases); `scripts/test/fonts.test.mjs` and `soon-style.test.mjs` fail if a font has no licence file or row, is not used, is loaded from a third party, or if a font file is committed outside `soon/fonts/`. | done | P0 | Claude Code | - | S | legal |
| LEG-16 | **Latin terms in the Persian legal pages** (new 2026-09-24): the Impressum and Datenschutzerklärung in Persian (coming-soon copy and the main site) mix Latin terms (Cloudflare, IP, TDDDG...) into Persian sentences without `<bdi>`, so punctuation next to them can land on the wrong side. Done 2026-09-24: `bidiParts()` in `src/lib/legal-doc.ts` feeds both renderers (`LegalPage.tsx`, `build-soon.mjs`), checked by `legal-bidi.test.mjs`; the wording itself is unchanged, only the markup. Wrap them the way the coming-soon page does; legal copy, so with the owner's proofreading (LEG-07). | done | P2 | Claude Code | LEG-07 | S | legal |
| LEG-17 | **GitHub Support purge of the cached commits** (new 2026-09-24): ten cached commits on GitHub still contain the old address after the history rewrite; ticket sent 2026-09-24, waiting for GitHub. | missing | P0 | Ahmadreza | LEG-12 | XS | legal || LEG-18 | **Verify the purge, then delete the backup** (new 2026-09-24): after GitHub confirms, open one old commit SHA URL to check it is gone, then delete the backup bundle outside the repo (LEG-12). | missing | P0 | Ahmadreza | LEG-17 | XS | legal |

## Phase 12 - Performance, accessibility, mobile

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| PERF-01 | **Real devices**: iPhone, Android phone, iPad, a touchscreen laptop; Safari and Firefox. Everything so far ran in headless Chrome. | missing | P1 | Ahmadreza + Claude Code | - | M | seo |
| PERF-02 | **Scene elements move badly during scroll on a real phone** (owner's report) and long tasks on a 4x-throttled phone: lighter era visuals, narrower `--era-progress` readers. Partly done 2026-09-24 (DECISIONS.md 67): a forced layout on every scroll event removed (resolver writes deferred out of native scroll events) - phone profile 35.6 → 38.7 fps, long tasks 113 → 75, script time in slow frames 28 s → 0.8 s; `perf.mjs --profile` added. Left: style/layout and paint in the guided puzzle segments; needs the real-phone re-test (PERF-01) to judge. | partial | P1 | Claude Code | PERF-01 to re-test | L 40% | seo |
| PERF-03 | **Theme switch cost** (~40 ms restyle at each crossing midpoint). Measured 2026-09-24: the restyle itself is under 1 ms in a plain page, so the cost is what follows it; options recorded in TODO.md, nothing changed (one option would change the engine's contract - waiting for the owner's go). | missing | P2 | Claude Code | - | S | seo |
| PERF-04 | **Accessibility pass**: axe/Lighthouse on every view, keyboard-only walk, contrast in all eight themes, focus order, RTL. Done 2026-09-24 (DECISIONS.md 65): `scripts/verify/a11y.mjs` runs axe-core (WCAG 2.2 A/AA) over every view, every app and the desktop in all eight themes, in `matrix.mjs` (de, fa, phone en): 30/30 each; `contrast.test.mjs` pins every theme's token contrast. Fixed: five palette values (1946, 1984, 1995), About's double-faded placeholder, two scroll panes not reachable by keyboard. Keyboard and RTL paths stay covered by `desktop.mjs`, `apps.mjs` and `journey.mjs`. A manual screen-reader walk is PERF-08. | done | P1 | Claude Code | - | L | seo |
| PERF-05 | **Lighthouse / Core Web Vitals** on the export, budgets recorded in PROJECT_STATE.md. Done 2026-09-24 (DECISIONS.md 66): `scripts/verify/vitals.mjs` (FCP, LCP, CLS, TBT in the page, slow-4G phone and desktop profiles); `serve.mjs` now gzips like Cloudflare. Desktop: every view LCP under 0.9 s, TBT 0. Phone: landing and About LCP 1.0 s; two budgets still over and tracked - journey TBT (PERF-02), desktop LCP 2.59 s (PERF-09). | done | P1 | Claude Code | - | M | seo |
| PERF-06 | Phone keyboard handling (Terminal, Assistant) and touch/pen in the bonus apps on real devices; the Morse tone actually audible. | missing | P2 | Ahmadreza | PERF-01 | S | seo |
| PERF-07 | **Flaky check**: `apps.mjs` "quiz 300x200: the question is in view" failed once on 2026-09-23 and passed on the rerun; find the timing it depends on. Done 2026-09-24: the cause is the round's random question - a long one is taller than the 300 x 200 body, so its end is never in view; the check now asks that the question starts in view (`startsInside`). Diagnosed from the code and four clean reruns, not reproduced on demand. | done | P2 | Claude Code | - | S | seo |
| PERF-08 | **Manual screen-reader walk** (new 2026-09-24): NVDA + Firefox on Windows and VoiceOver on an iPhone through landing, journey (both modes), desktop and three apps; automated checks cannot judge whether the announcements make sense. | missing | P1 | Ahmadreza + Claude Code | PERF-01 | M | seo |
| PERF-09 | **Desktop view's first paint on a slow phone** (new 2026-09-24): LCP 2.59 s against 2.5 s, because the client-only shell chunk is requested only after hydration. Options: preload that chunk from the desktop page's head, or give the server frame a contentful element that keeps the Convergence hand-over pixel-identical. Done 2026-09-24: `scripts/preload-shell.mjs`, run by `npm run build`, adds a `<link rel="preload">` for the shell chunk to the three desktop pages (found by a string only the Shell renders; a test pins it). Measured on the slow-phone profile, 7 cold runs each: LCP 2600 ms without, 2464 ms with (budget 2500) - about one round trip, within the run-to-run noise of about 0.1 s, so the gain is plausible rather than proven. | done | P2 | Claude Code | - | S | seo |

## Phase 13 - Deployment and launch

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| DEP-01 | **Cloudflare Email Routing** for a domain address (e.g. `kontakt@ahmadreza.de`), tested with a real message from outside. **No longer a launch blocker** since 2026-09-24: the site shows only the Gmail address (OWN-09); needed only if a domain address is activated. | missing | P2 | Ahmadreza | OWN-09 | S | launch |
| DEP-02 | **www → apex 301** redirect rule. Verified live on 2026-09-23 (`www.ahmadreza.de` → `https://ahmadreza.de/`, 301). | done | P0 | Ahmadreza | - | XS | launch |
| DEP-03 | **Create the D1 database** `amonel-counters` (weur), put its `database_id` in `wrangler.jsonc`, apply the migration. A deploy with the placeholder id fails. | missing | P0 | Ahmadreza (or Claude Code with his login) | - | XS | launch |
| DEP-04 | **Rate-limiting rule** `api-count` (20 per 10 s, IP, Block) - exact values in TODO.md, Phase 13. | missing | P0 | Ahmadreza | - | XS | launch |
| DEP-05 | **Anonymous puzzle counters** (aggregate counts only, no personal data): built in Phase 9C (Worker + D1, `/api/*`), **not live** until DEP-03, DEP-04 and DEP-06. | partial | P1 | Claude Code | DEP-03, DEP-04, DEP-06 | M 70% | launch |
| DEP-06 | **Launch**: deploy the `ahmadreza-de` Worker, move both custom domains (apex and www) from the coming-soon Worker `silent-lake-8ae2` to it, then delete `silent-lake-8ae2`. Only with the owner's go. | missing | P0 | Ahmadreza + Claude Code | DEP-03, DEP-04, LEG-01..LEG-05, LEG-07, FIN-01 | M | launch |
| DEP-07 | **Post-deploy checks**: the counter `curl` checks (TODO.md), legal pages, redirects, 404 status, headers. | missing | P1 | Claude Code | DEP-06 | S | launch |
| DEP-08 | **Cloud-session build mode** (owner, 2026-09-24): `AMONEL_PREVIEW_BUILD=1` builds, lints and tests with the dummy address (`npm run setup:preview`); production and deploys still refuse the dummy, and the flag is refused on Cloudflare's builders. Rules in CLAUDE.md, "Cloud sessions"; pinned by `preview-build.test.mjs`. | done | P2 | Claude Code | - | XS | launch |

## Branding

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| BR-01 | **Final main logo** still to be designed; the current Amonel mark and wordmark are interim. Since 2026-09-24 the coming-soon page uses design 6 (the wordmark "Amonel" whose "o" is a power symbol) as its main logo and design 1 (`~$ amonel os` with a blinking cursor) only in its terminal panel; **the final main logo will be improved later** - design 6 is a stand-in, not the finished mark. | partial | P1 | Ahmadreza + Claude Code | - | L 25% | launch |
| BR-02 | **Coming-soon page rebranded** (owner, 2026-09-24): «AhmadOS» → «Amonel» everywhere on the page and a progress block computed from ROADMAP.md at build time. Rewritten the same day so anyone understands it in ten seconds: who (name, role line), what the site will be, the weighted progress overall and in seven areas (`scripts/roadmap.mjs`, `scripts/soon-progress.mjs`), what's next, contact and the legal links, in de/en/fa with the other two languages always visible under the role; no item IDs or phase numbers. Checked by `scripts/verify/soon.mjs` (wide and phone, dark and light, three languages). Copy CR-1080..CR-1084. | done | P2 | Claude Code | - | S | launch |
| BR-03 | **Redeploy the coming-soon page whenever the ROADMAP progress changes noticeably** (a few percentage points, or an area finishing; owner, 2026-09-24): its figures are computed at build time, so they are exactly as fresh as the last deploy (`npm run build:soon`, then `npx wrangler deploy` in `soon/`, then the curl checks in PROJECT_STATE.md). Until launch (DEP-06). Last deploy: see PROJECT_STATE.md. | missing | P2 | Claude Code | - | XS | launch |
| BR-04 | **Fonts, style and colours of the coming-soon page**: approved by the owner 2026-09-24 after five review rounds (DECISIONS.md 70). Style "K6": Martian Grotesk headings, Geist body, Geist Mono, Vazirmatn for Persian, Departure Mono only for the `~$ amonel os` line at 22 px; near-black dark mode (page #07090a, surfaces #0d1110, neutral borders and tracks, green only as the accent), Forest Luxe paper and forest green in light mode. Tokens in `soon/tokens.css`, fonts in `soon/fonts/` with licences (LEG-15); Latin-only heading word spacing, `<bdi>` for Latin terms in Persian, no orphans; `scripts/verify/soon.mjs` (196 checks) and `soon-style.test.mjs` pin it. Its look was reverted by the owner on 2026-09-25 (BR-07, DECISIONS.md 73); Vazirmatn for Persian stays. | done | P1 | Ahmadreza + Claude Code | - | M | launch |
| BR-05 | **Should the approved style become the main site's design system?** Decided by the owner 2026-09-24: **yes**, for the main site's own pages (landing, About, Impressum, Datenschutz, 404, UI chrome) - **not** for the journey eras, which keep their historical styles (DECISIONS.md 70). Applying it is BR-06. | done | P2 | Ahmadreza | BR-04 | S | launch |
| BR-06 | **Apply the K6 style to the main site's own pages** (new 2026-09-24, owner decision in BR-05; not started, do not begin without his go): the landing page, the About page, Impressum, Datenschutz, the 404 page and the UI chrome (`components/ui/`, `SiteFooter`, the language switcher, buttons); the tokens and fonts of `soon/tokens.css` become the site's tokens, fonts self-hosted through `@fontsource` or `public/`, the licences already in `public/fonts/`. The journey eras (Act 1) keep their era styles and themes; open question for the owner: the desktop shell (Act 3) and its `modern` theme. Legal, SEO and copy rules stay; every new or changed text gets CONTENT_REVIEW entries. Done 2026-09-25 (owner's queue, DECISIONS.md 72): the tokens and self-hosted fonts as the scoped `[data-style=k6]` layer, then the UI chrome, the landing page, About, Impressum and Datenschutz and the 404 page, one commit each, each checked with axe (de, fa) and the journey/vitals scripts. The desktop shell is not included - open question in TODO.md. **Visual part reverted by the owner 2026-09-25** after comparing old and new side by side (DECISIONS.md 73, BR-07): the old look is back; the non-colour fixes stay. | done | P1 | Claude Code | BR-05 | L | launch |
| BR-07 | **Revert the K6 look** (owner, 2026-09-25, DECISIONS.md 73): the main site's own pages (landing, About, Impressum, Datenschutz, 404, UI chrome) and the coming-soon page get their old look back - navy-teal page with the green and amber glows, blue-tinted cards, cyan and mint accents, the old heading and name fonts, dark only. Kept: all content, the app, SEO and performance work, the 301s, the tests, Vazirmatn for Persian everywhere, no letter-spacing in Persian, and the phone/RTL layout fixes of BR-06. Unused font files removed, `public/fonts/LICENSES.md` matches what ships. | done | P1 | Claude Code | BR-06 | M | launch |
| BR-08 | **Owner choices applied (DECISIONS 74):** fonts and light mode done; left: redeploy the coming-soon page (BR-03). | done | P1 | Ahmadreza + Claude Code | BR-07 | S | launch |
| BR-09 | **Illustrations and small learning details in one system** (owner, 2026-09-25, DECISIONS.md 75): the final design stays (navy palette, glows, Space Grotesk / Inter / JetBrains Mono / Vazirmatn, dark default with the sun/moon toggle); pages get inline-SVG illustrations, a 24 px icon set and at most three translated "Wussten Sie schon?" snippets each, all from `src/components/illustrations/` (icons.ts, illustrations.css, React components; the coming-soon build injects the same CSS and icons). Done 2026-09-25 in three steps: the coming-soon page (the e365de3 scene upgraded, star field, `ahmadreza@amonel:~$ status` terminal header, chips, icons, three snippets); landing, About and 404 (legal pages stay sober); axe clean (de, fa, dark, light, 1440 and 390) and screenshots in `Claude outputs/br09/`. Not deployed: the coming-soon page needs a redeploy (BR-03) to show it. | done | P2 | Claude Code | BR-08 | M | launch |

## Owner tasks - assets and accounts

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| OWN-01 | **Portrait photo**, 1200 x 1500 px, 4:5, `public/images/portrait.jpg` (details in TODO.md). | missing | P1 | Ahmadreza | LEG-09 | S | about |
| OWN-02 | **Résumé PDF**, `public/files/ahmadreza-taheri-lebenslauf.pdf`; one German PDF or one per language. | missing | P1 | Ahmadreza | - | S | about |
| OWN-03 | **Tidy LinkedIn, GitHub and XING** and send the profile URLs (for Contact, JSON-LD `sameAs`, the footer). | missing | P1 | Ahmadreza | - | S | about |
| OWN-04 | **German proofreading by a native speaker** (and Persian); all copy is a draft. | missing | P1 | Ahmadreza | FIN-01 | L | launch |
| OWN-05 | **About/CV facts**: apprenticeship start and end date, earlier stations, language levels, skill list, projects (TODO.md, Phase 7). | missing | P1 | Ahmadreza | - | S | about |
| OWN-06 | **Decide the GitHub repo link** is public on the site (Projects). | missing | P2 | Ahmadreza | - | XS | about |
| OWN-07 | **Postal address and published e-mail** for the Impressum and Datenschutzerklärung. Given 2026-09-23; the address lives only in the git-ignored `src/content/legal.local.ts` since 2026-09-24 (LEG-12). | done | P0 | Ahmadreza | - | XS | legal |
| OWN-08 | **Cloudflare login for deploys** (`npx wrangler login` on this machine, or deploy `soon/` yourself): nothing can be deployed without it. Done 2026-09-23 (OAuth, approved by the owner). | done | P0 | Ahmadreza | - | XS | launch |
| OWN-09 | **Decide final e-mail (keep Gmail or activate a domain address).** If forwarding is used: test delivery, never use an auto-reply, and name the mail services (e.g. Cloudflare Email Routing, Google) in the Datenschutzerklärung. Since 2026-09-24 the Gmail address is the only contact on the whole site, from one constant (`EMAIL` in `src/content/profile.ts`): changing it there changes the landing page, About, Terminal, Assistant, Contact, JSON-LD and the legal pages; `public/llms.txt` is pinned to it by a test. | missing | P2 | Ahmadreza | - | XS | launch |

## After launch

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| POST-01 | **Connect GitHub to Cloudflare** (Workers Builds) so every push to `main` auto-deploys; build command `npm run build`. | missing | P1 | Ahmadreza + Claude Code | DEP-06 | S | launch |
| POST-02 | **Optional CMS** (Decap or Sveltia at `/admin`) once the GitHub-edit workflow works; must not add third-party requests for visitors. | missing | P2 | Claude Code | POST-01 | L | launch |
| POST-03 | **Era 1977, the Apple II**: truth, sourced insider detail, visual, puzzle, theme, between 1971 and 1981. | missing | P2 | Claude Code | DEP-06 | XL | journey |
| POST-04 | **The address as a Cloudflare build secret**: once Workers Builds deploys from GitHub (POST-01), set `LEGAL_STREET` and `LEGAL_POSTCODE_CITY` as build secrets; `scripts/legal-address.mjs` writes `legal.local.ts` from them. Never commit the address to make a build pass. | missing | P0 | Ahmadreza + Claude Code | POST-01 | XS | launch |

## Final phase

| ID | Description | Status | Priority | Owner | Depends on | Effort | Area |
|---|---|---|---|---|---|---|---|
| FIN-01 | **Content review with the owner**: go through CONTENT_REVIEW.md one entry at a time, from the first to the last, and mark each FINAL only with his explicit approval. | missing | P0 | Ahmadreza + Claude Code | everything above that adds content | XL | launch |
