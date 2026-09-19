---
name: deployment-legal
description: "Read before changing deployment (Cloudflare Workers, wrangler.jsonc, _headers, _redirects, the domain), before handling any API key or secret (the Gemini key rule, Phase 8 Assistant), before adding or changing any font, or for anything with legal or GDPR weight."
---

### Deployment — Cloudflare, not a VPS

The site deploys to **Cloudflare Workers with static assets**, connected to the
public GitHub repo through Workers Builds. It is **not** a Cloudflare Pages
project: Cloudflare folded Pages into Workers during 2026, and while Pages is
still supported, all new investment goes to Workers and a new account may not
show a Pages tab at all.

Earlier drafts of this project specified nginx on a self-managed VPS. That is
reversed. **Do not reintroduce nginx, systemd or server backups** anywhere.

- `wrangler.jsonc` — `assets.directory: "./out"`, no Worker script, so this
  stays a pure static deploy. `html_handling: "auto-trailing-slash"` matches
  `trailingSlash: true`; `not_found_handling: "404-page"` serves Next's
  `404.html` with a real 404 status.
- `public/_headers` — security headers. Next copies `public/` verbatim into the
  export, so these land at `out/_headers`, where Cloudflare reads them. No
  Content-Security-Policy yet; that arrives in Phase 11 once every external
  origin is known.
- `public/_redirects` — `301 /de/ → /`. This is what used to be an nginx rule.
- Custom domain is **ahmadreza.de**. Workers custom domains require the zone's
  nameservers to be managed by Cloudflare — a CNAME from an external DNS
  provider is not enough, unlike Pages.
- `npm run build` must keep producing nothing but a static `out/` directory.
  Nothing in the application code may know it is running on Cloudflare.

### The Gemini API key — absolute rule

Phase 8's assistant uses the Google Gemini API through a server-side Cloudflare
function. **The API key lives only in a Cloudflare environment variable.** It
must never appear in client-side code, in a `NEXT_PUBLIC_*` variable, in a
committed `.env`, or in any other committed file. **The GitHub repository is
public**, so a key that is pushed once is compromised immediately, is billable,
and survives in the git history after deletion. If it ever lands in a commit,
rotate it rather than trying to rewrite history.

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
