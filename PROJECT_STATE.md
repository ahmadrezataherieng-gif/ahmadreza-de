# Project state

Last updated: 2026-09-15

- [x] **Phase 0** — Environment and scaffold
- [x] **Phase 1** — Design system, i18n, theme engine
- [x] **Phase 2** — Journey scaffold and unlock store
- [ ] **Phase 3** — Era visuals 1 to 4
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

## What exists after Phase 2

- Next.js 15 static export, Tailwind v4, TypeScript strict. `npm run build`
  passes clean and emits `/`, `/en`, `/fa`.
- Theme engine: `Theme` interface, eight themes, CSS-custom-property application,
  zustand store, tokens exposed to Tailwind.
- i18n: three locales, German at the root path, Persian in RTL, static
  `hreflang` and `canonical`.
- Act 1 scaffold: seven full-viewport era sections, Lenis + GSAP ScrollTrigger,
  automatic theme switching per era, progress rail, always-visible
  "Skip to Desktop", `prefers-reduced-motion` fallback.
- Unlock store with `localStorage` persistence, ready for Phase 5 to call.
- UI primitives: `Button`, `Panel`, `LanguageSwitcher`.

## Not built yet

- Any era visual beyond name/year/placeholder line.
- Any puzzle. `solvePuzzle` / `skipPuzzle` exist but nothing calls them.
- The Convergence sequence, the desktop shell, and every app.
- Legal pages, sitemap, JSON-LD, `llms.txt`.
- Deployment.
