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

## Summary

Recount after each change: `node scripts/roadmap.mjs --write` rewrites this table
(the same parser gives the coming-soon page its progress figure).

| | missing | partial | done | total |
|---|---|---|---|---|
| P0 | 10 | 0 | 9 | 19 |
| P1 | 16 | 4 | 12 | 32 |
| P2 | 18 | 2 | 0 | 20 |
| **total** | **44** | **6** | **21** | **71** |

## Phase 9D-2 / 9D-3 - the remaining apps (Act 3)

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| APP-01 | **Timeline app** (base app): the seven eras and Ahmadreza's own path as one scrollable timeline, from `content/eras.ts` and `content/about.ts`. Today the placeholder. Built 2026-09-23: the eras from the journey's own copy (the page-messages chunk the puzzles already load) with links to `/amonel/#era-N`, then the current station from About's copy; its start date is owed (OWN-05). | done | P1 | Claude Code | - |
| APP-02 | **Contact app** (base app): today a placeholder with the `mailto:` link. Needs the full app: email, profiles (LinkedIn, GitHub, XING once OWN-03 is done), résumé, the legal links. `mailto:` only, never a form. Built 2026-09-23: its own copy, e-mail with a copy button, résumé, location, legal links; the profile links are **waiting for owner** (OWN-03) - add the URLs in `src/content/profiles.ts`. | partial | P1 | Claude Code | OWN-03 for the profile links |
| APP-03 | **CV app** (base app): today a placeholder. A readable CV view from `content/` plus the PDF download. The structure can be built now; the entries are **waiting for owner** (OWN-02, OWN-05). | missing | P1 | Claude Code + Ahmadreza | OWN-02, OWN-05 |
| APP-04 | **Network tools app** (1995 bonus, slot `network-tools`): ping, subnet calculator, DNS/port lookups as labelled simulations - never real network requests. | missing | P1 | Claude Code | - |
| APP-05 | **Time Machine app** (today bonus, slot `time-machine`): theme switcher over the eight themes; writes `amonel.theme.v1` (then LEG-02 must list it as used); restyles Snake via `--ao-snake-*`. | missing | P1 | Claude Code | LEG-02 update in the same change |
| APP-06 | **Scheduler app** (1956 bonus, slot `scheduler`): a batch/CPU scheduling sandbox (FCFS, SJF, round robin) that extends the era's one truth. | missing | P2 | Claude Code | - |
| APP-07 | **Filesystem app** (1971 bonus, slot `filesystem`): a file-tree explorer over the Terminal's in-memory tree, paths shown as you click. | missing | P2 | Claude Code | - |
| APP-08 | **Easter eggs** through `HIDDEN_COMMANDS` in `terminal/shell.ts` (empty today). | missing | P2 | Claude Code | - |
| APP-09 | **GSAP DrawSVG** (free plugin) for line-drawing effects; never ScrollSmoother. | missing | P2 | Claude Code | - |
| APP-10 | **"Legende" badges** are recorded (`selectLegendEras`) but never displayed. | partial | P2 | Claude Code | - |
| APP-11 | **Quiz result links** its missed eras to `/amonel/#era-N` (the journey honours the hash since 9D-1). | missing | P2 | Claude Code | - |
| APP-12 | **Audio**: every theme's `sound` profile is unused. Only on a click, never autoplay. | missing | P2 | Claude Code | - |
| APP-13 | Terminal `ask` command that hands a question to the Assistant. | missing | P2 | Claude Code | - |
| APP-14 | Locked-app notice covers the lowest desktop icon on a 768 px tall screen; move it. | missing | P2 | Claude Code | - |

## Phase 10 - SEO layer

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| SEO-01 | **robots.txt** allowing all crawlers, explicitly including the AI bots (OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, Claude-User, ClaudeBot, PerplexityBot, CCBot, Google-Extended, meta-externalagent), plus the sitemap line. Built 2026-09-23: `public/robots.txt`, pinned by `scripts/test/seo.test.mjs`. | done | P1 | Claude Code | - |
| SEO-02 | **sitemap.xml** with every generated URL and its hreflang alternates (`xhtml:link`), generated at build time from `allRouteSegments()`. Built 2026-09-23: `src/app/sitemap.ts` → `out/sitemap.xml`, nine URLs, legal pages left out. | done | P1 | Claude Code | - |
| SEO-03 | **JSON-LD**: Person (`name`, `alternateName` = "احمدرضا طاهری" (never the legal name, owner 2026-09-23), `jobTitle`, `address` Trier, `knowsAbout`, `knowsLanguage`, `image` once OWN-01, `sameAs` once OWN-03), WebSite, ProfilePage. Built 2026-09-23 (`src/lib/structured-data.ts`, in every indexed page's head); `image` and `sameAs` **waiting for owner** (OWN-01, OWN-03). `sameAs` now fills itself from `content/profiles.ts` once the URLs are there. | partial | P1 | Claude Code | OWN-01, OWN-03 (can ship without, then extend) |
| SEO-04 | **llms.txt**: a plain-text summary of the person and the site for AI crawlers. Built 2026-09-23: `public/llms.txt`, facts the site already states, both spellings of the name. | done | P1 | Claude Code | - |
| SEO-05 | **Open Graph share image**: one 1200 x 630 PNG per language (or one shared), `og:image`, `og:image:alt`, `twitter:card`. Built 2026-09-23: `scripts/og-image.mjs` renders one PNG per language (about 47 kB each) in headless Chrome with the self-hosted fonts; og:image with alt, twitter summary_large_image. Regenerate for the final logo (BR-01). | done | P1 | Claude Code | BR-01 for the final version |
| SEO-06 | **Per-page meta descriptions**: the journey and the desktop reuse `site.description`; each view (and each new page) needs its own. Done 2026-09-23: `site.journeyDescription`, `site.desktopDescription`; legal pages have their own; drafts run 140-190 characters (CR-1051). | done | P1 | Claude Code | - |
| SEO-07 | **hreflang + canonical** per view incl. `x-default` - done for the nine pages; every new page (legal, About, 404 excluded) must emit them too. | done | P1 | Claude Code | - |
| SEO-08 | **Persian name "احمدرضا طاهری" coverage**: in `site.title`/`author` (fa) and About (fa) today; missing in JSON-LD, llms.txt, the static fa About page, the fa OG image alt. Since 2026-09-23 also in JSON-LD (`alternateName`), llms.txt and the fa About page; only the OG image alt is left (SEO-05). Done 2026-09-23 with the fa OG image and its alt text. | done | P1 | Claude Code | SEO-03, SEO-04, SEO-09 |
| SEO-09 | **Static, indexable About pages** at `/ueber-mich/`, `/en/about/`, `/fa/about/` (URL to be confirmed): real HTML text from `content/about.ts`, one h1, linked from landing and footer. Built 2026-09-23 at `/about/` in all three locales (one slug, like the legal pages): the About app's own component rendered on the server, name as h1, in the sitemap, linked from every page footer (DECISIONS.md 59). | done | P1 | Claude Code | - |
| SEO-10 | **Journey text fallback**: today a screen-reader-only list of the eras; expand to the full SEO layer (one truth, insider detail, puzzle summary per era) as real static text. Done 2026-09-23: per era an h2 with year and name, the truth, the era paragraph, the figures and the insider detail, plus links to the desktop and About - the same sentences the scenes show; puzzle copy stays out (budget). Journey HTML de 43.2 kB gz (limit 48). | done | P1 | Claude Code | - |
| SEO-11 | **Custom 404 page**: localised, on-brand, `noindex`, links home / desktop / journey; replaces Next's default `404.html` that `not_found_handling: "404-page"` serves. Built 2026-09-23: `src/app/not-found.tsx`, one page in all three languages (a stray URL has no locale), real 404 status, noindex; fonts and CSS moved to the root layout so it is styled. | done | P1 | Claude Code | - |
| SEO-12 | **Submit the sitemap** in Google Search Console and Bing Webmaster Tools (both already verified by the owner). | missing | P1 | Ahmadreza | SEO-02, DEP-06 |
| SEO-13 | Web manifest is German only (`name`, `description`). | partial | P2 | Claude Code | - |
| SEO-14 | Landing titles run over 60 characters (de 66, en 64, fa 66): **waiting for owner** decision on the wording (never shorten the name). | missing | P2 | Ahmadreza | FIN-01 |

## Phase 11 - Legal

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| LEG-01 | **Impressum** at `/impressum/` (+ `/en/`, `/fa/`), § 5 DDG and § 18 Abs. 2 MStV, legal name "Ahmadreza Taheri Momrabadi" (the only place it may appear). Built 2026-09-23 (DECISIONS.md 58), `noindex`. | done | P0 | Claude Code + Ahmadreza | OWN-07 |
| LEG-02 | **Datenschutzerklärung** at `/datenschutz/` (+ en, fa), written from an audit of the real data flows: Cloudflare hosting and logs, no external requests, the browser storage table, the anonymous counters, the local assistant, email contact, rights, LfDI RLP. German binding. Built 2026-09-23; the audit found no external request, so nothing had to be self-hosted. | done | P0 | Claude Code + Ahmadreza | OWN-07 |
| LEG-03 | **Legal links in the footer of every view** (landing, journey, desktop, About, 404) - one click from every page, labelled exactly "Impressum" / "Datenschutz". Done for every existing view: landing and legal footers, desktop top bar, home screen, journey chrome corner; new pages (About, 404) must add `SiteFooter`. | done | P0 | Claude Code | LEG-01, LEG-02 |
| LEG-04 | **Legal pages and links on the live "coming soon" page** (Worker `silent-lake-8ae2`), deployed to production. Built in `soon/` (`npm run build:soon`), deployed 2026-09-23; ahmadreza.de/impressum/ and /datenschutz/ (and en, fa) verified live. | done | P0 | Claude Code | LEG-01, LEG-02 |
| LEG-05 | **Legal check of every feature before launch** (DSGVO, TDDDG, DDG, copyright, image rights): no external request, no cookie, no consent banner needed, storage table complete. | missing | P0 | Claude Code + Ahmadreza | all feature work |
| LEG-06 | **Content-Security-Policy** in `public/_headers` (the comment there still mentions the removed Gemini proxy); `connect-src 'self'`, no third-party origins. Done 2026-09-23: every fetch type locked to 'self' (scripts/styles also 'unsafe-inline', no nonces in a static export); pinned by `legal.test.mjs`; `serve.mjs --headers` runs the checks under it (apps, bonus, desktop pass). | done | P1 | Claude Code | - |
| LEG-07 | **Owner verifies the legal texts** (CONTENT_REVIEW.md status "LEGAL – owner must verify"); ideally a lawyer or the Verbraucherzentrale reads them once. | missing | P0 | Ahmadreza | LEG-01, LEG-02 |
| LEG-08 | **May the employer, Stadtverwaltung Trier, be named** on a personal site, and in which wording? **Waiting for owner.** | missing | P0 | Ahmadreza | - |
| LEG-09 | **Written usage rights for the portrait** from the photographer before it goes online. | missing | P0 | Ahmadreza | OWN-01 |
| LEG-10 | **Check "Amonel"** in the DPMA and EUIPO registers before any commercial use. | missing | P1 | Ahmadreza | - |
| LEG-11 | **Cloudflare features that set cookies stay off** (Bot Fight Mode, challenges, Waiting Room, Always Online); rate limit only by IP with Block. Check at deploy. | missing | P0 | Ahmadreza | DEP-06 |
| LEG-12 | **Home address out of GitHub** (owner, 2026-09-24): the address moved to the git-ignored `src/content/legal.local.ts` (template `legal.example.ts`), `scripts/legal-address.mjs` stops every build without it; the whole git history rewritten with `git filter-repo` and force-pushed, backup bundle outside the repo (DECISIONS.md 60). | done | P0 | Claude Code | - |
| LEG-13 | **Phone number in the Impressum** (the § 5 DDG grey area: a "second fast way" of contact besides e-mail). **Resolved 2026-09-24 by the owner: no phone number.** The Impressum keeps name, postal address and e-mail; nothing to build. | done | P0 | Ahmadreza | - |

## Phase 12 - Performance, accessibility, mobile

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| PERF-01 | **Real devices**: iPhone, Android phone, iPad, a touchscreen laptop; Safari and Firefox. Everything so far ran in headless Chrome. | missing | P1 | Ahmadreza + Claude Code | - |
| PERF-02 | **Scene elements move badly during scroll on a real phone** (owner's report) and long tasks on a 4x-throttled phone: lighter era visuals, narrower `--era-progress` readers. | missing | P1 | Claude Code | PERF-01 to re-test |
| PERF-03 | **Theme switch cost** (~40 ms restyle at each crossing midpoint). | missing | P2 | Claude Code | - |
| PERF-04 | **Accessibility pass**: axe/Lighthouse on every view, keyboard-only walk, contrast in all eight themes, focus order, RTL. | missing | P1 | Claude Code | - |
| PERF-05 | **Lighthouse / Core Web Vitals** on the export, budgets recorded in PROJECT_STATE.md. | missing | P1 | Claude Code | - |
| PERF-06 | Phone keyboard handling (Terminal, Assistant) and touch/pen in the bonus apps on real devices; the Morse tone actually audible. | missing | P2 | Ahmadreza | PERF-01 |
| PERF-07 | **Flaky check**: `apps.mjs` "quiz 300x200: the question is in view" failed once on 2026-09-23 and passed on the rerun; find the timing it depends on. | missing | P2 | Claude Code | - |

## Phase 13 - Deployment and launch

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| DEP-01 | **Cloudflare Email Routing** for a domain address (e.g. `kontakt@ahmadreza.de`), tested with a real message from outside. **No longer a launch blocker** since 2026-09-24: the site shows only the Gmail address (OWN-09); needed only if a domain address is activated. | missing | P2 | Ahmadreza | OWN-09 |
| DEP-02 | **www → apex 301** redirect rule. Verified live on 2026-09-23 (`www.ahmadreza.de` → `https://ahmadreza.de/`, 301). | done | P0 | Ahmadreza | - |
| DEP-03 | **Create the D1 database** `amonel-counters` (weur), put its `database_id` in `wrangler.jsonc`, apply the migration. A deploy with the placeholder id fails. | missing | P0 | Ahmadreza (or Claude Code with his login) | - |
| DEP-04 | **Rate-limiting rule** `api-count` (20 per 10 s, IP, Block) - exact values in TODO.md, Phase 13. | missing | P0 | Ahmadreza | - |
| DEP-05 | **Anonymous puzzle counters** (aggregate counts only, no personal data): built in Phase 9C (Worker + D1, `/api/*`), **not live** until DEP-03, DEP-04 and DEP-06. | partial | P1 | Claude Code | DEP-03, DEP-04, DEP-06 |
| DEP-06 | **Launch**: deploy the `ahmadreza-de` Worker, move both custom domains (apex and www) from the coming-soon Worker `silent-lake-8ae2` to it, then delete `silent-lake-8ae2`. Only with the owner's go. | missing | P0 | Ahmadreza + Claude Code | DEP-03, DEP-04, LEG-01..LEG-05, LEG-07, FIN-01 |
| DEP-07 | **Post-deploy checks**: the counter `curl` checks (TODO.md), legal pages, redirects, 404 status, headers. | missing | P1 | Claude Code | DEP-06 |

## Branding

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| BR-01 | **Final main logo** still to be designed; the current Amonel mark and wordmark are interim. | partial | P1 | Ahmadreza + Claude Code | - |
| BR-02 | The live "coming soon" page still says **"AhmadOS"** (the old name) and "8 von 13 Phasen"; bring it in line with Amonel or leave it until launch. **Waiting for owner** (it is content). | missing | P2 | Ahmadreza | - |

## Owner tasks - assets and accounts

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| OWN-01 | **Portrait photo**, 1200 x 1500 px, 4:5, `public/images/portrait.jpg` (details in TODO.md). | missing | P1 | Ahmadreza | LEG-09 |
| OWN-02 | **Résumé PDF**, `public/files/ahmadreza-taheri-lebenslauf.pdf`; one German PDF or one per language. | missing | P1 | Ahmadreza | - |
| OWN-03 | **Tidy LinkedIn, GitHub and XING** and send the profile URLs (for Contact, JSON-LD `sameAs`, the footer). | missing | P1 | Ahmadreza | - |
| OWN-04 | **German proofreading by a native speaker** (and Persian); all copy is a draft. | missing | P1 | Ahmadreza | FIN-01 |
| OWN-05 | **About/CV facts**: apprenticeship start and end date, earlier stations, language levels, skill list, projects (TODO.md, Phase 7). | missing | P1 | Ahmadreza | - |
| OWN-06 | **Decide the GitHub repo link** is public on the site (Projects). | missing | P2 | Ahmadreza | - |
| OWN-07 | **Postal address and published e-mail** for the Impressum and Datenschutzerklärung. Given 2026-09-23; the address lives only in the git-ignored `src/content/legal.local.ts` since 2026-09-24 (LEG-12). | done | P0 | Ahmadreza | - |
| OWN-08 | **Cloudflare login for deploys** (`npx wrangler login` on this machine, or deploy `soon/` yourself): nothing can be deployed without it. Done 2026-09-23 (OAuth, approved by the owner). | done | P0 | Ahmadreza | - |
| OWN-09 | **Decide final e-mail (keep Gmail or activate a domain address).** If forwarding is used: test delivery, never use an auto-reply, and name the mail services (e.g. Cloudflare Email Routing, Google) in the Datenschutzerklärung. Since 2026-09-24 the Gmail address is the only contact on the whole site, from one constant (`EMAIL` in `src/content/profile.ts`): changing it there changes the landing page, About, Terminal, Assistant, Contact, JSON-LD and the legal pages; `public/llms.txt` is pinned to it by a test. | missing | P2 | Ahmadreza | - |

## After launch

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| POST-01 | **Connect GitHub to Cloudflare** (Workers Builds) so every push to `main` auto-deploys; build command `npm run build`. | missing | P1 | Ahmadreza + Claude Code | DEP-06 |
| POST-02 | **Optional CMS** (Decap or Sveltia at `/admin`) once the GitHub-edit workflow works; must not add third-party requests for visitors. | missing | P2 | Claude Code | POST-01 |
| POST-03 | **Era 1977, the Apple II**: truth, sourced insider detail, visual, puzzle, theme, between 1971 and 1981. | missing | P2 | Claude Code | DEP-06 |
| POST-04 | **The address as a Cloudflare build secret**: once Workers Builds deploys from GitHub (POST-01), set `LEGAL_STREET` and `LEGAL_POSTCODE_CITY` as build secrets; `scripts/legal-address.mjs` writes `legal.local.ts` from them. Never commit the address to make a build pass. | missing | P0 | Ahmadreza + Claude Code | POST-01 |

## Final phase

| ID | Description | Status | Priority | Owner | Depends on |
|---|---|---|---|---|---|
| FIN-01 | **Content review with the owner**: go through CONTENT_REVIEW.md one entry at a time, from the first to the last, and mark each FINAL only with his explicit approval. | missing | P0 | Ahmadreza + Claude Code | everything above that adds content |
