# Project state

Last updated: 2026-09-27 (local sync: main pulled with PR #1, #2, #3 merged)

## Local sync 2026-09-27

`main` pulled locally with PR #1, #2 and #3 merged (queues A2 and B, plus the `apps.mjs` stale-check fix in commit `306983a`); the remote cloud branches were deleted after merge. 308/308 tests pass, lint clean, build clean (3 locales, 22 pages). `scripts/verify/apps.mjs` 175/175 and `desktop.mjs` 63/63 pass locally - the cloud-session failures noted in the queue B entries below were a headless-only environment quirk (`pointer: fine`/`hover: hover` reporting false), not a real bug; two checks in `scripts/verify/apps.mjs` that had gone stale were fixed in commit `306983a`. Manual checks confirmed OK: the boot sequence (de 1440, fa 390), Troubleshoot mode (de, fa RTL), the era 1 second legend, and the About page's print preview.

Next step: the logo (ROADMAP BR-01) - the owner has rejected all proposals so far; a new logo direction is being worked out in chat.

Older queues: see PROJECT_STATE-archive.md

## Private preview Worker (amonel-preview)

Kept here (not archived) per the amonel-preview operational-facts rule; full history in PROJECT_STATE-archive.md under "Phone preview of the main site, PERF-01 (2026-09-25)".

**Private preview:** https://amonel-preview.ahmadrezataherieng.workers.dev (Worker `amonel-preview`, workers.dev only, no route or DNS on ahmadreza.de; the coming-soon Worker is untouched). Built with `AMONEL_PREVIEW_BUILD=1` (dummy address "Musterstraße 1", the real one is not in `out/`), then `out/robots.txt` = `Disallow: /`, no sitemap, and `X-Robots-Tag: noindex, nofollow` appended to `out/_headers`; checked on `/`, `/amonel/`, `/impressum/`, `/robots.txt` (200 plus the header). No `/api/*` Worker in the preview, so the counters stay hidden. Deployed with a throwaway wrangler config outside the repo (name `amonel-preview`, `workers_dev: true`, assets from `out/`). Delete it later: `npx wrangler delete amonel-preview`. Rebuild the real site before any real deploy (`out/` now holds the preview build).

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
- **Coming-soon page, last deploy: 2026-09-25** (Worker `silent-lake-8ae2`, version `c2e5dc63`, the BR-09 design, see the section above; earlier deploys: `bbcc21b1` on 09-25 with the K6 style, `8eac93e8` on 09-24): the search layer, the 55-character title, the separate `/en/` and `/fa/` pages (SEO-15) and the entity work (SEO-16) are live. Verified with `node scripts/verify/live-soon.mjs` (34 checks incl. /en/ and /fa/: page, title, JSON-LD, OG tags, robots.txt, sitemap.xml, the six legal pages, the fonts, 404, www redirect) and `node scripts/verify/soon.mjs --base https://ahmadreza.de/` (196 checks in a real browser, each language loaded as its own URL). Redeploy whenever the progress changes noticeably (BR-03): `npm run build:soon`, `npx wrangler deploy` in `soon/`, then both scripts.
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
- [x] **Phase 9D-3** - easter eggs (APP-08) and the line-drawing effects (APP-09, done in CSS instead of GSAP DrawSVG, DECISIONS.md 71), both done 2026-09-24
- [x] **Phase 10** — SEO layer: robots.txt, sitemap, llms.txt, JSON-LD, descriptions, OG images, 404, static About page, journey text layer (DECISIONS.md 59); JSON-LD image/sameAs wait for the owner
- [~] **Phase 11** — Legal pages: Impressum and Datenschutzerklärung built in de/en/fa, linked one click from every page (DECISIONS.md 58), CSP in place; owner verification and the pre-launch legal check open (ROADMAP.md LEG-*)
- [~] **Phase 12** — Performance, accessibility, mobile pass: automated accessibility pass done (PERF-04, DECISIONS.md 65); vitals, phone scroll and real devices open (ROADMAP PERF-*)
- [ ] **Phase 13** — Cloudflare deployment: GitHub integration, custom domain, DNS, TLS

