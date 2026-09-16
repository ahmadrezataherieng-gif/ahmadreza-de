# Project state

Last updated: 2026-09-16

- [x] **Phase 0** — Environment and scaffold
- [x] **Phase 1** — Design system, i18n, theme engine
- [x] **Phase 2** — Journey scaffold and unlock store
- [x] **Phase 3** — Era visuals 1 to 4
- [x] **Phase 4** — Era visuals 5 to 7 and the Convergence sequence
- [x] **Phase 5** — Concept pass, landing page, puzzle engine and the seven puzzles
- [ ] **Phase 6** — Desktop shell: window manager, taskbar, mobile home screen
- [ ] **Phase 7** — Core apps: About, Terminal, Ticket System, Traceroute
- [ ] **Phase 8** — AI assistant app and server-side Cloudflare proxy function
- [ ] **Phase 9** — Unlockable apps, easter eggs, Time Machine theme switcher
- [ ] **Phase 10** — SEO layer: text fallback, JSON-LD, sitemap, hreflang, llms.txt
- [ ] **Phase 11** — Legal pages: Impressum and Datenschutzerklärung
- [ ] **Phase 12** — Performance, accessibility, mobile pass
- [ ] **Phase 13** — Cloudflare deployment: GitHub integration, custom domain, DNS, TLS

## What exists after Phase 5

- **Concept:** every era states one mechanical truth and one sourced insider
  detail, shown in the era's puzzle segment and in the static SEO list.
- **Two viewing modes** over one set of scenes: guided (puzzles play themselves
  as you scroll) and interactive (you play). The mode is one persisted value in
  the unlock store, chosen on the landing page and switchable from the journey
  chrome without losing position.
- **Landing page** at `/` (`/en/`, `/fa/`): name, role, facts, the two mode
  buttons, a discreet résumé control and a restrained timeline hint. The
  journey moved to `/journey/`. Portrait and résumé are placeholders until the
  assets arrive (TODO.md).
- **Puzzle engine** (`src/components/puzzles/`): one shell, one reducer-based
  engine with guided, play and final presentations, a held dialog for play,
  two-step help, skip everywhere, lazy code and copy.
- **Seven puzzles:** punch-card debugging (1946), shortest-job-first scheduling
  (1956), a shell over a file tree (1971), fitting drivers into 640 K (1981),
  drag and drop with mouse, touch and keyboard (1984), IPv4 subnetting (1995),
  and a first-match firewall (today). Each interactive solve unlocks its app's
  artifact.
- `/favicon.ico` is a static route serving the SVG favicon.
- Budgets after Phase 5: see the Phase 5 report and DECISIONS.md 34/38.

## What exists after Phase 4

- Next.js 15 static export, Tailwind v4, TypeScript strict. `npm run build`
  passes clean and emits `/`, `/en`, `/fa` into a static `out/`.
- Budgets, measured on the export:
  - First Load JS: 194 kB (188 kB after Phase 3; ceiling 235 kB).
  - `/` HTML: 234,107 B raw / 35,980 B gzipped (223,126 / 27,170 after Phase 3).
- Deployment config for Cloudflare Workers with static assets: `wrangler.jsonc`,
  `public/_headers`, `public/_redirects`. Not deployed yet. The create-next-app
  SVGs are gone from `public/` and from the export.
- Theme engine: `Theme` interface, eight themes, CSS-custom-property application,
  zustand store, tokens exposed to Tailwind. Also applied to subtrees via
  `[data-theme-scope]` (the Convergence uses it; the Time Machine will too).
- i18n: three locales, German at the root path, Persian in RTL, static
  `hreflang` and `canonical` pointing at https://ahmadreza.de.
- **Act 1 is complete: all seven era visuals** (`src/components/journey/eras/`).
  Wide viewports pin each era with CSS sticky while a scroll-scrubbed timeline
  plays; phones and reduced-motion visitors get the same eras in document flow,
  fully composed.
  - 1946 ENIAC — brushed metal, 120 CSS tube lamps, SVG switches and cables, a
    real IBM punch card encoding AHMADREZA TAHERI (digit grid now one pattern).
  - 1956 GM-NAA I/O — continuous-feed paper, mechanically printed text.
  - 1971 UNIX — CRT with scrubbed power-on, login banner, block cursor.
    Phase 5 mount point: `data-puzzle-mount="unix-filesystem"`.
  - 1981 MS-DOS — same monitor re-tinted amber, POST to 640K OK, DIR listing.
  - 1984 Macintosh — lights come on from black into a 1-bit dithered desktop;
    the first pointer enters with a ring and caption, pulls down a menu, opens a
    window out of zoom rectangles and selects an icon. SVG on a 320x214 grid at
    exactly 1x or 2x.
  - 1995 Windows 95 — teal desktop, taskbar, the persistent pointer opens Start
    and Dial-Up Networking; a modem dialog lights the hop chain (this PC, modem,
    phone network, provider, internet) with a chunky progress bar and a visual
    handshake; the tray lights and an early web page loads line by line.
  - Today — a calm dashboard: regions exchanging traffic, containers coming up,
    a deploy, a sparkline, a terminal, and an AI prompt that types and answers.
    Phase 8 mount point: `data-assistant-mount="journey-prompt"`.
- **Act 2, the Convergence** (`src/components/journey/Convergence.tsx`): seven
  chips - real pieces of each era, each in its own era's palette - fly into the
  foot of a forming desktop while a boot log types one line per component, then
  dissolve; the desktop grows to fill the screen and the story ends on an empty
  AhmadOS desktop. Pinned at every width. Reaching the end marks the journey
  complete in the unlock store. Phase 6 mount point: `data-shell-mount="ahmados"`.
- `npm run check:pixel-font` verifies every Press Start 2P string against the
  font's real glyph table.
- Unlock store with `localStorage` persistence, ready for Phase 5 to call.
- UI primitives: `Button`, `Panel`, `LanguageSwitcher`.

## Not built yet (after Phase 5)

- The desktop shell and every app. The journey records completion but there is
  no desktop to land on yet; returning visitors still see Act 1.
- Audio. Every theme's `sound` profile is still unused.
- Legal pages, sitemap, JSON-LD, `llms.txt`.
- Deployment.
