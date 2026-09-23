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
- `worker/` — a minimal Worker: `/api/*` is a plain 404, reserved for Phase 9's
  anonymous per-puzzle counters (DECISIONS.md, entry 53). It is bundled by
  wrangler, never by Next, and nothing under `src/` may import it (the
  application never knows it is on Cloudflare). `npx wrangler deploy --dry-run`
  checks the config and the bundle.
- `public/_headers` — security headers. Next copies `public/` verbatim into the
  export, so these land at `out/_headers`, where Cloudflare reads them. No
  Content-Security-Policy yet; that arrives in Phase 11 once every external
  origin is known.
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
`/api/*` is a plain 404 (see `worker/` above). There is no key, no secret and
no rate limit to configure. The site must never claim anywhere that questions
go to an AI service, because they do not.

### Visitor data — anonymous counts only

The only visitor data this site will ever collect is **anonymous aggregate
counts** - for example, how many visitors solved each puzzle (Phase 9,
`/api/*`). Never add names, e-mail addresses, IP storage, identifiers, a
comments section, or any form. Contact is a `mailto:` link only, nothing that
submits to this site.

**No analytics scripts, and no third-party requests of any kind** - fonts,
maps, video, captchas, CDNs. Everything the site needs is self-hosted (see
Fonts, below). This is what keeps the site free of a consent banner - see the
Legal-first core rule in CLAUDE.md.

**Cloudflare features that set cookies stay off:** Bot Fight Mode, Rate
Limiting Rules, Waiting Room, Always Online. Turning any of these on without
checking their cookie behaviour first would undo the "no consent banner"
decision.

Cloudflare's Data Processing Addendum is part of its self-serve terms. The
Datenschutzerklärung (Phase 11) must name Cloudflare as a US processor, with
the EU-US Data Privacy Framework and Standard Contractual Clauses as the
transfer basis.

### Impressum (Phase 11, not built yet)

- Full legal name: **Ahmadreza Taheri Momrabadi** (see the `seo` skill for
  where this name may and may not appear).
- A real postal address, a working e-mail, and a second fast contact channel.
- Reachable within **two clicks from every page**, labelled exactly
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
