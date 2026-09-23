---
name: verification
description: "Read before running or writing checks in scripts/verify, before declaring a phase done, or when a check fails: how to run each script, which setups exist, --quiet and matrix.mjs, and the template-string regex trap."
---

## How to run the checks

```bash
node scripts/verify/journey.mjs --mode play|watch [--width 380] [--locale fa] [--reduce] [--touch] [--tier light]
node scripts/verify/boundaries.mjs [--width 380] [--locale fa] [--tier light] [--steps 4]
node scripts/verify/perf.mjs [--width 380] [--tier light] [--cpu 4]
node scripts/verify/desktop.mjs [--width 380] [--locale fa] [--reduce] [--touch]
node scripts/verify/navigation.mjs [--width 380] [--locale fa] [--reduce] [--touch]
node scripts/verify/apps.mjs [--width 380] [--locale fa] [--reduce] [--touch]
node scripts/verify/sizes.mjs
node scripts/verify/worker-local.mjs          # against `npx wrangler dev --local --port 8787`
```

**The counters (Phase 9C):** `journey.mjs` and `apps.mjs` take `--api`, which
answers `/api/*` inside Chrome through CDP (`stubApi` in `cdp.mjs`, counts from
`api-stub.mjs`) and records every request; they then check what is counted
(never a guided auto-solve, never a score, each name once per page load) and
what is shown (Persian digits, nothing below ten). Without `--api` there is no
`/api` at all, as on any plain server, and the same scripts check that no
number appears. `worker-local.mjs` needs the local D1 first
(`npx wrangler d1 migrations apply amonel-counters --local`) and a fresh
`out/`. Stop `wrangler dev` and `serve.mjs` before `npm run build`, or Windows
keeps `out/` locked (EBUSY).

The verify script needs a running server (default `http://localhost:3001`,
`--base` to change) and a local Chrome (`CHROME_PATH`). Code sent to the page
is a template string: a regex in it needs its backslashes doubled (`\\b`), or
`\b` arrives as a backspace and the check silently passes.

## Which setups exist

The matrix run through Phase 8A (each configuration is one command; `node scripts/verify/matrix.mjs` runs them all quietly). `apps.mjs` also plays a Computer-Quiz round by keyboard (Phase 9B) and covers the Assistant: the demo against a server with no Worker, every live state against a stubbed `fetch`, and that the journey and landing HTML stay free of it:

- `apps.mjs`: 1280 in de, en, fa; 768 x 1024 in de and fa; 380 x 800 with `--touch` in de, en, fa; `--reduce` at 1280 and at 380 touch in fa.
- `desktop.mjs`: 1280 de and fa; 768 x 1024; 380 x 800 `--touch` en; `--reduce` at 380 touch.
- `navigation.mjs`: 1280 de and fa; 380 `--touch` en; `--reduce`.
- `journey.mjs`: `--mode play` at 1280 de, 380 touch, fa, 768 x 1024, `--reduce`; `--mode watch` at 1280 and `--reduce`.
- `--api` (Phase 9C): `apps.mjs` at 1280 de and 380 touch fa; `journey.mjs --mode play` at 1280 de and fa, `--mode watch` at 1280.
- `boundaries.mjs`, `perf.mjs`, `sizes.mjs` when the journey, its motion or the bundles changed.
- Also, every phase: `npm run build`, `npm run lint`, `npm run check:pixel-font`, `npm test`. What "done" means for a phase is in CLAUDE.md, under Commands.

## Quiet output

Every script takes `--quiet`: one line per configuration with the pass count, and detail only for failures. `matrix.mjs` uses it by default and prints one line per configuration; `--only apps|desktop|navigation|journey` narrows the run and `--verbose` drops `--quiet`. A long unquiet run floods the session, and every later message pays for it.
