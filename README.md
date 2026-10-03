# Amonel — Portfolio of Ahmadreza Taheri

A static Next.js site for [ahmadreza.de](https://ahmadreza.de): a landing page,
and a scroll-driven journey through eighty years of computing - seven eras, each
with one truth about how computers work and a small puzzle - that compiles into
an operating system in the browser.

German at `/`, English at `/en/`, Persian (right to left) at `/fa/`.

## Develop

```bash
npm ci
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
- `PROJECT_STATUS.md` — the operational handoff; verify live Git before relying on its baseline.
- `ROADMAP.md` — master scope and remaining tasks.
- `REVIEW_INTAKE.md` — reviewed suggestions and task acceptance criteria.
- `PROJECT_STATE.md` — historical implementation record.
- `TODO.md` — open questions and owed assets.

Deployment: Cloudflare Workers with static assets (`wrangler.jsonc`), serving
`out/`. The application is statically exported; `worker/` separately handles
`/api/*` for anonymous D1 counters. Cloudflare Workers Builds integration is a
planned post-launch task (ROADMAP POST-01).

Use the Node version in `.node-version` and the npm policy in `CLAUDE.md`.
Cloud sessions must follow its dummy-address preview setup before building;
private legal data stays on the owner's machine.
