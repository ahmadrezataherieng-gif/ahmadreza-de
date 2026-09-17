# Project state

Last updated: 2026-09-17

- [x] **Phase 0** — Environment and scaffold
- [x] **Phase 1** — Design system, i18n, theme engine
- [x] **Phase 2** — Journey scaffold and unlock store
- [x] **Phase 3** — Era visuals 1 to 4
- [x] **Phase 4** — Era visuals 5 to 7 and the Convergence sequence
- [x] **Phase 5** — Concept pass, landing page, puzzle engine and the seven puzzles
- [x] **Phase 5.5A** — Concept alignment: Play-mode gates, "Sie", the 1946 scene, working insider tricks, landing polish, full audit
- [ ] **Phase 5.5B** — Era-to-era transitions and 3D motion
- [ ] **Phase 6** — Desktop shell: window manager, taskbar, mobile home screen
- [ ] **Phase 7** — Core apps: About, Terminal, Ticket System, Traceroute
- [ ] **Phase 8** — AI assistant app and server-side Cloudflare proxy function
- [ ] **Phase 9** — Unlockable apps, easter eggs, Time Machine theme switcher
- [ ] **Phase 10** — SEO layer: text fallback, JSON-LD, sitemap, hreflang, llms.txt
- [ ] **Phase 11** — Legal pages: Impressum and Datenschutzerklärung
- [ ] **Phase 12** — Performance, accessibility, mobile pass
- [ ] **Phase 13** — Cloudflare deployment: GitHub integration, custom domain, DNS, TLS

## What exists

- **Build:** Next.js 15 static export, Tailwind v4, TypeScript strict. `npm run
  build` emits six pages - the landing page and the journey in de (`/`,
  `/journey/`), en (`/en/…`) and fa (`/fa/…`) - into a static `out/`, plus the
  SVG favicon. Deployment config for Cloudflare Workers with static assets is in
  place (`wrangler.jsonc`, `public/_headers`, `public/_redirects`); not deployed.
- **Landing page** (`/`): name, role, bold key facts, two mode cards, the résumé
  control in the header and under the role, an email link that appears once the
  address is confirmed. Portrait, résumé and email are owed (TODO.md). No journey
  code is loaded there.
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
- **Act 2, the Convergence:** the seven eras compile into an empty AhmadOS
  desktop; reaching it (or Zum Desktop) completes the journey.
- **Checks:** `npm run check:pixel-font`; `scripts/verify/journey.mjs` drives a
  real Chrome through both modes, all puzzles, the gates and the landing page.

## Budgets (measured on the export)

Reported per phase; see the phase reports and DECISIONS.md 34 and 38.

| After Phase 5.5A | Value |
|---|---|
| Route First Load JS | 133 kB (limit 250) |
| Landing HTML, gzipped | de 6.5 kB · en 6.4 kB · fa 6.8 kB |
| Journey HTML, gzipped | de 38.0 kB · en 36.3 kB · fa 34.4 kB (limit 48) |
| Journey chunk (with gates), gzipped | 17.6 kB; GSAP and Lenis chunks 19.8 + 31.1 kB, unchanged |
| Per puzzle, gzipped | 2.6-4.0 kB; shell 4.3 kB; puzzle copy 8.5-10.1 kB per locale |

## Not built yet

- The desktop shell and every app. Zum Desktop scrolls to the empty desktop at
  the end of the Convergence; returning visitors still see Act 1.
- Badges are recorded but not displayed.
- Audio. Every theme's `sound` profile is still unused.
- Legal pages, sitemap, JSON-LD, `llms.txt`.
- Deployment.
