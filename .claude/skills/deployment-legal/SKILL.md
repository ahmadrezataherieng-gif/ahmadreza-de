---
name: deployment-legal
description: "Read before changing deployment (Cloudflare Workers, wrangler.jsonc, _headers, _redirects, the domain), before touching the Assistant app or worker/, before adding or changing any font, or for anything with legal or GDPR weight."
---

### Deployment — Cloudflare, not a VPS

The site deploys to **Cloudflare Workers with static assets**, connected to the
public GitHub repo through Workers Builds. It is **not** a Cloudflare Pages
project: Cloudflare folded Pages into Workers during 2026, and while Pages is
still supported, all new investment goes to Workers and a new account may not
show a Pages tab at all.

Earlier drafts of this project specified nginx on a self-managed VPS. That is
reversed. **Do not reintroduce nginx, systemd or server backups** anywhere.

- `wrangler.jsonc` — `assets.directory: "./out"`, plus one Worker script
  (`main: "worker/index.ts"`) that answers **only `/api/*`**:
  `assets.run_worker_first: ["/api/*"]`. Every other request is served by the
  asset layer without running the Worker, so `_headers`, `_redirects` and the
  404 page behave exactly as in a pure static deploy. The `ASSETS` binding is
  only the Worker's fallback if that list ever widens.
  `html_handling: "auto-trailing-slash"` matches `trailingSlash: true`;
  `not_found_handling: "404-page"` serves Next's `404.html` with a real 404
  status. Do not drop `run_worker_first`: with `not_found_handling` set, an
  unmatched `/api/*` would otherwise get the 404 page and the Worker would
  never run.
- `worker/` — the anonymous counters (Phase 9C, DECISIONS.md 56):
  `POST /api/count/<name>` and `GET /api/counts` over one D1 table
  (`COUNTERS_DB`, `migrations/`), every other `/api/*` a 404. The logic is in
  `worker/api.ts`; `worker/index.ts` exports the handler and nothing else
  (workerd refuses an entry with other named exports). It imports the
  allowlist from `src/lib/counters.ts`; the reverse is forbidden - nothing
  under `src/` may import `worker/`, and the application still works on any
  plain web server (the numbers simply stay hidden). It is bundled by
  wrangler, never by Next. `npx wrangler deploy --dry-run` checks the config
  and the bundle; `scripts/verify/worker-local.mjs` runs it under
  `wrangler dev --local` against a local D1. The `database_id` in
  `wrangler.jsonc` is a placeholder until the database is created (TODO.md,
  Phase 13).
- `public/_headers` — security headers. Next copies `public/` verbatim into the
  export, so these land at `out/_headers`, where Cloudflare reads them. Since
  2026-09-23 a **Content-Security-Policy** locks every fetch type to
  `'self'` (scripts and styles also `'unsafe-inline'`: a static export has no
  nonces, and Next streams page data as inline scripts). Adding any external
  origin means changing the CSP, the Datenschutzerklärung and this skill
  together - which is the point. `scripts/test/legal.test.mjs` pins it;
  `node scripts/verify/serve.mjs --headers` (launch config `export-csp`)
  serves the export with the real headers so the checks run under it.
- `public/_redirects` — `301 /de/ → /` (what used to be an nginx rule), and since
  Phase 9A the old `/journey/` URLs → `/amonel/` in every locale.
- Custom domain is **ahmadreza.de**. Workers custom domains require the zone's
  nameservers to be managed by Cloudflare — a CNAME from an external DNS
  provider is not enough, unlike Pages.
- `npm run build` must keep producing nothing but a static `out/` directory.
  Nothing in the application code may know it is running on Cloudflare.

### The assistant — a local search, not an external AI service

**Decided (DECISIONS.md, entry 53): the assistant does not use Gemini or any
external AI service.** Google's free tier is not permitted for apps serving
users in the EEA, the paid tier needs a card and a privacy disclosure, and
neither is worth it for this site. Phase 8A built a Gemini proxy behind
`/api/assistant`; Phase 8B removed all of it (`worker/gemini.ts`,
`context.ts`, `sources.ts`, `prompt.ts`, `rate-limit.ts`, `validate.ts`,
`handler.ts` - still in the git history). The assistant now answers entirely
from a local search over `src/content/` that runs in the visitor's browser
(`src/lib/search/`); nothing a visitor types ever leaves the device, and
the assistant never calls `/api/*` (which holds only the anonymous counters,
see `worker/` above). There is no key and no secret to configure. The site must never claim anywhere that questions
go to an AI service, because they do not.

### Visitor data — anonymous counts only

The only visitor data this site ever collects is **anonymous aggregate
counts** (Phase 9C, DECISIONS.md 56): a counter name from the allowlist in
`src/lib/counters.ts` and an integer, in D1. Never add names, e-mail
addresses, IP storage, identifiers, user agents, per-visitor timestamps, a
score, a comments section, or any form. A new counter is a new name in the
allowlist - never a new column. Contact is a `mailto:` link only, nothing that
submits to this site.

**No analytics scripts, and no third-party requests of any kind** - fonts,
maps, video, captchas, CDNs. Everything the site needs is self-hosted (see
Fonts, below). This is what keeps the site free of a consent banner - see the
Legal-first core rule in CLAUDE.md.

**Browser storage** - the complete list, for the Datenschutzerklärung (Phase
11). All of it stays on the visitor's device, is never sent anywhere, and is
what the visitor asked for by using the feature; no cookies. Add every new key
here, in `STORAGE_KEYS` (`src/lib/constants.ts`), in the same change:

| Key | Storage | Holds | Since |
|---|---|---|---|
| `amonel.unlocks.v1` | localStorage | journey progress: mode, passed and watched eras, artifacts, badges, reached the desktop, finished the journey (which bonus apps are unlocked follows from these) | Phase 2, extended 9D-1 |
| `amonel.theme.v1` | localStorage | reserved for the chosen theme; defined in `STORAGE_KEYS`, nothing writes it yet | - |
| `amonel.replay` | sessionStorage | this tab asked to see the journey again | Phase 6 |
| `amonel.quiz.v1` | localStorage | the Computer-Quiz's best score, one number | Phase 9B |
| `amonel.snake.v1` | localStorage | Snake's best score, one number | Phase 9D-1 |
| `amonel.paint.v1` | localStorage | Pixel Paint's current picture (size, palette, pixels), at most 16 KB, written only after the visitor draws | Phase 9D-1 |

The anonymous counters add **no** key: "once per page load" is kept in memory.
A test pins `STORAGE_KEYS` (`scripts/test/counters.test.mjs`).

**Cloudflare features that set cookies stay off:** Bot Fight Mode, Waiting
Room, Always Online, every challenge action (`cf_clearance`). Turning any of
these on without checking their cookie behaviour first would undo the "no
consent banner" decision. **One exception, checked in Phase 9C:** the single
free-plan Rate Limiting Rule on `/api/count/*` (TODO.md, Phase 13), counting
by **IP** with the action **Block**. Cloudflare's cookie list ties Rate
Limiting Rules' `_cfuvid` only to the "IP with NAT support" characteristic
(Enterprise); IP counting with Block sets no cookie. Never switch that rule
to a challenge or to "IP with NAT support".

Cloudflare's Data Processing Addendum is part of its self-serve terms. The
Datenschutzerklärung (Phase 11) must name Cloudflare as a US processor, with
the EU-US Data Privacy Framework and Standard Contractual Clauses as the
transfer basis.

### The legal pages (built 2026-09-23, DECISIONS.md 58)

- `/impressum/` and `/datenschutz/` in every locale (German slug in en and
  fa), rendered by `components/legal/LegalPage.tsx` from
  `messages/legal/{de,en,fa}.json`; the address and e-mail only in
  `content/legal.ts`, imported by nothing else. `noindex, follow`. German is
  binding. Status in CONTENT_REVIEW.md: **LEGAL – owner must verify** - never
  CONTENT-TODO, never marked final without Ahmadreza.
- **Any change to what the site stores, sends or loads changes the
  Datenschutzerklärung in the same change** - all three languages; the storage
  table is pinned to `STORAGE_KEYS` by `scripts/test/legal.test.mjs`.
- The legal links (`LegalLinks` in `components/ui/SiteFooter.tsx`) are one
  click from every page: landing and legal footers, the desktop top bar, the
  home screen, the journey's own chrome corner.
- **The coming-soon page** lives in `soon/` (`index.html`, `wrangler.jsonc`,
  Worker `silent-lake-8ae2`, named by the dashboard). `npm run build:soon` writes `soon/dist/` with the
  legal pages rendered from the same JSON (`scope: "soon"` sections), then
  `npx wrangler deploy` from `soon/`. It is the only thing deployed until
  launch.

### Datenschutzerklärung - it must say (built; keep it true)

- Cloudflare as a US processor, with the DPF and SCCs as transfer basis (above).
- The browser storage list above, all of it the visitor's own feature.
- **The anonymous counters** (Phase 9C, DECISIONS.md 56): what is counted (a
  puzzle solved in Play mode, a finished quiz round, a finished Snake game,
  reaching the end of the journey, the mode chosen, an app opened), that only a name and a total are
  stored, and that totals under ten are never shown.
- That **Cloudflare processes the visitor's IP address in transit** only to
  deliver the site and protect it (including the rate limit on the counters),
  on the basis of **Art. 6(1)(f) DSGVO** - the legitimate interest in a
  working, secure site.
- That **nothing is stored on or read from the device for counting** - no
  cookie, no storage key - so **no consent under § 25 TDDDG** is needed.
- That **the site operator stores no IP addresses**, no identifiers and no
  per-visitor records.

### Impressum (built)

- Full legal name: **Ahmadreza Taheri Momrabadi** (see the `seo` skill for
  where this name may and may not appear).
- A real postal address and a working e-mail. **No phone number**, by
  Ahmadreza's choice (2026-09-23) - never add a contact form instead.
- Reachable in **one click from every page**, labelled exactly
  **"Impressum"**.
- **No EU ODR link** - that platform closed in July 2025. Do not add one.

### Stadtverwaltung Trier

May only appear as the plain fact that Ahmadreza trains there: **no logo, no
workplace photos, no internal information.** The Tickets app must stay
fictional (see the `desktop-apps` skill - Talweber Logistik, not a real
employer).

### The portrait

The photographer must grant **written usage rights** before the photo goes
online. Do not publish the portrait (see the `landing-page` skill) without
that confirmation from Ahmadreza.

### Launch blocker: email must really work

`kontakt@ahmadreza.de` must receive real mail (via Cloudflare Email Routing)
**before the site goes live**. This is tested with a real message from
outside, not assumed. The Impressum, the landing page, About, Contact and the
Terminal all point at this address - do not deploy with an address that does
not receive mail. TODO.md, Phase 13.

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
