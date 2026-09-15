# Project state

Last updated: 2026-09-15

- [x] **Phase 0** — Environment and scaffold
- [x] **Phase 1** — Design system, i18n, theme engine
- [x] **Phase 2** — Journey scaffold and unlock store
- [x] **Phase 3** — Era visuals 1 to 4
- [ ] **Phase 4** — Era visuals 5 to 7 and the Convergence sequence
- [ ] **Phase 5** — Puzzle engine and the seven puzzles
- [ ] **Phase 6** — Desktop shell: window manager, taskbar, mobile home screen
- [ ] **Phase 7** — Core apps: About, Terminal, Ticket System, Traceroute
- [ ] **Phase 8** — AI assistant app and server-side Cloudflare proxy function
- [ ] **Phase 9** — Unlockable apps, easter eggs, Time Machine theme switcher
- [ ] **Phase 10** — SEO layer: text fallback, JSON-LD, sitemap, hreflang, llms.txt
- [ ] **Phase 11** — Legal pages: Impressum and Datenschutzerklärung
- [ ] **Phase 12** — Performance, accessibility, mobile pass
- [ ] **Phase 13** — Cloudflare deployment: GitHub integration, custom domain, DNS, TLS

## What exists after Phase 3

- Next.js 15 static export, Tailwind v4, TypeScript strict. `npm run build`
  passes clean and emits `/`, `/en`, `/fa` into a static `out/`.
  First Load JS: 188 kB (183 kB before Phase 3; ceiling 220 kB).
- Deployment config for Cloudflare Workers with static assets: `wrangler.jsonc`,
  `public/_headers`, `public/_redirects`. Not deployed yet.
- Theme engine: `Theme` interface, eight themes, CSS-custom-property application,
  zustand store, tokens exposed to Tailwind.
- i18n: three locales, German at the root path, Persian in RTL, static
  `hreflang` and `canonical` pointing at https://ahmadreza.de.
- Act 1: seven era sections. Wide viewports pin each era with CSS sticky while a
  scroll-scrubbed timeline plays; phones and reduced-motion visitors get the
  same eras in document flow, fully composed.
- **Era visuals 1–4 are finished** (`src/components/journey/eras/`):
  - 1946 ENIAC — brushed-metal panel, 120 CSS-animated tube lamps, toggle
    switches and patch cables in SVG, a real IBM 80-column punch card encoding
    AHMADREZA TAHERI.
  - 1956 GM-NAA I/O — continuous-feed paper with sprocket holes and green bars,
    mechanically printed text, paper feeding out on scroll.
  - 1971 UNIX — CRT with scrubbed power-on (darkness, beam, phosphor warm-up),
    scanlines, bloom, curvature, flicker, login banner and block cursor.
    Phase 5 mount point for the filesystem puzzle is in place.
  - 1981 IBM PC / MS-DOS — same monitor re-tinted amber, POST count to 640K OK,
    visual beep, DOS-formatted DIR listing, ASCII year.
- Eras 5–7 use a pinned placeholder (name, year, one line).
- Unlock store with `localStorage` persistence, ready for Phase 5 to call.
- UI primitives: `Button`, `Panel`, `LanguageSwitcher`.

## Not built yet

- Era visuals 5–7 and the Convergence sequence (Phase 4).
- Any puzzle. `solvePuzzle` / `skipPuzzle` exist but nothing calls them.
- The desktop shell and every app. "Skip to Desktop" records completion but
  there is no desktop to land on yet.
- Audio. Every theme's `sound` profile is still unused.
- Legal pages, sitemap, JSON-LD, `llms.txt`.
- Deployment.
