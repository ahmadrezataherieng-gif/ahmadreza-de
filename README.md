# AhmadOS — Portfolio of Ahmadreza Taheri

A static Next.js site for [ahmadreza.de](https://ahmadreza.de): a landing page,
and a scroll-driven journey through eighty years of computing - seven eras, each
with one truth about how computers work and a small puzzle - that compiles into
an operating system in the browser.

German at `/`, English at `/en/`, Persian (right to left) at `/fa/`.

## Develop

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build                # type-check and static export to ./out
npm run lint
npm run check:pixel-font     # every Press Start 2P string has real glyphs
```

End-to-end check with a local Chrome, against a running server:

```bash
node scripts/verify/journey.mjs --mode play --base http://localhost:3000
```

## Where to read next

- `CLAUDE.md` — the concept, the rules and the architecture.
- `DECISIONS.md` — why things are the way they are.
- `PROJECT_STATE.md` — what exists and what is next.
- `TODO.md` — open questions and owed assets.

Deployment: Cloudflare Workers with static assets (`wrangler.jsonc`), serving
`out/`. No server code.
