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
```

The verify script needs a running server (default `http://localhost:3001`,
`--base` to change) and a local Chrome (`CHROME_PATH`). Code sent to the page
is a template string: a regex in it needs its backslashes doubled (`\\b`), or
`\b` arrives as a backspace and the check silently passes.

## Which setups exist

The matrix run through Phase 7 (each configuration is one command; `node scripts/verify/matrix.mjs` runs them all quietly):

- `apps.mjs`: 1280 in de, en, fa; 768 x 1024 in de and fa; 380 x 800 with `--touch` in de, en, fa; `--reduce` at 1280 and at 380 touch in fa.
- `desktop.mjs`: 1280 de and fa; 768 x 1024; 380 x 800 `--touch` en; `--reduce` at 380 touch.
- `navigation.mjs`: 1280 de and fa; 380 `--touch` en; `--reduce`.
- `journey.mjs`: `--mode play` at 1280 de, 380 touch, fa, 768 x 1024, `--reduce`; `--mode watch` at 1280 and `--reduce`.
- `boundaries.mjs`, `perf.mjs`, `sizes.mjs` when the journey, its motion or the bundles changed.
- Also, every phase: `npm run build`, `npm run lint`, `npm run check:pixel-font`, `npm test`. What "done" means for a phase is in CLAUDE.md, under Commands.

## Quiet output

Every script takes `--quiet`: one line per configuration with the pass count, and detail only for failures. `matrix.mjs` uses it by default and prints one line per configuration; `--only apps|desktop|navigation|journey` narrows the run and `--verbose` drops `--quiet`. A long unquiet run floods the session, and every later message pays for it.
