# Launch-day runbook

Last checked: 2026-09-27. `node scripts/verify/placeholders.mjs --quiet` today:
**1137 PLACEHOLDER row(s) visible in the build** (1 more sits under a "not built
yet" section, 1138 total). This must read **0 visible** before step 4 below can
pass in `--strict` mode — that means the owner has been through CONTENT_REVIEW.md
(FIN-01) and closed or reworded every visible row first. Nothing here can be run
correctly until that is done; the steps are listed in full so nothing is
forgotten on the day it finally can be.

Do not run this file top to bottom speculatively — steps 5 onward touch the
live domain and Cloudflare account. Re-read PROJECT_STATE.md and TODO.md
"Everything still open" immediately before starting, since some of these steps
may already be done by the time you launch.

## Order and ownership

Each step names who does it. "Ahmadreza" = the Cloudflare dashboard, wrangler
login, or a decision only the owner can make. "Claude Code" = a command run in
this repo, on the owner's own machine (never a cloud session — CLAUDE.md
"Cloud sessions" forbids any deploy or Cloudflare touch from there).

### 1. Content review closed (Ahmadreza + Claude Code, FIN-01)

Go through CONTENT_REVIEW.md entry by entry, oldest first, with the owner.
Every PLACEHOLDER row is either finalised or explicitly deferred with a
"not built yet" filing. This is a prerequisite for step 4's `--strict` gate,
not a single command — it is the bulk of what stands between here and launch.

**Verify:** `node scripts/verify/placeholders.mjs --quiet` — the "visible"
count must be 0 (rows filed under "not built yet" don't count, per LAU-01).

### 2. Rebuild `out/` for real — never the preview build (Claude Code)

The preview build (`AMONEL_PREVIEW_BUILD=1`) writes the dummy address
"Musterstraße 1" into `out/`. A launch deploy must use a build with the real
address from the git-ignored `src/content/legal.local.ts`.

```bash
npm run build
```

**Verify:** `npm run build` finishes with zero TypeScript errors, zero build
errors, all three locales generated (per CLAUDE.md's definition of done).
Then spot-check `out/impressum/index.html` (and `/en/impressum/`,
`/fa/impressum/`) for the real street and postcode/city, not "Musterstraße 1".

### 3. Full test and lint pass (Claude Code)

```bash
npm test && npm run lint
```

**Verify:** both exit 0. `npm test` covers shell, traceroute, app data/copy,
the Assistant and the Worker (per CLAUDE.md "Commands").

### 4. Placeholder launch gate, strict (Claude Code, LAU-01)

```bash
node scripts/verify/placeholders.mjs --strict
```

**Verify:** exit 0. This is the DEP-06 precondition — it fails (non-zero
exit) while any visible PLACEHOLDER row remains in CONTENT_REVIEW.md. This
must be run again right before step 8 if any time passed since step 1.

### 5. D1 database for the anonymous counters (Ahmadreza, DEP-03)

Once, logged in with `npx wrangler login`:

```bash
npx wrangler d1 create amonel-counters
```

Choose the location hint **Western Europe (weur)** if asked. Copy the
`database_id` it prints into `wrangler.jsonc` (`d1_databases[0].database_id`,
currently the placeholder `00000000-0000-0000-0000-000000000000`) and commit
that change — a deploy with the placeholder id fails.

Then apply the migration:

```bash
npx wrangler d1 migrations apply amonel-counters --remote
```

**Verify:**

```bash
npx wrangler d1 execute amonel-counters --remote --command "SELECT * FROM counters"
```

should return an empty table (no error, no rows).

### 6. Rate-limiting rule (Ahmadreza, dashboard only, DEP-04)

Cloudflare dashboard → the `ahmadreza.de` zone → Security → WAF → **Rate
limiting rules** → Create rule. The free plan allows exactly one rule:

- Rule name: `api-count`
- If incoming requests match: Field **URI Path**, Operator **starts with**,
  Value `/api/count/` (if the free plan's editor offers no "starts with", use
  Operator **contains** with the same value)
- With the same characteristics: **IP** (the only choice on free; **never**
  "IP with NAT support" — it sets the `_cfuvid` cookie)
- When rate exceeds: Requests **20**, Period **10 seconds**
- Then take action: **Block** (never a challenge — that sets `cf_clearance`)
- Duration: **10 seconds** (the only free choice)
- Place at: first

**Verify:** the rule shows in the WAF rule list as active, in first position.
(Traffic-level verification happens in step 9, after deploy.)

### 7. Cookie-setting Cloudflare features stay off (Ahmadreza, dashboard, LEG-11)

Confirm, in the dashboard: Bot Fight Mode, challenges (Managed/JS/legacy
Challenge), Waiting Room and Always Online are all off for the zone. Rate
limiting (step 6) uses IP, not "IP with NAT support", and action Block, not a
challenge — both already specified above. This keeps the site cookie-free, so
it never needs a consent banner (CLAUDE.md "Legal first").

**Verify:** each toggle in the dashboard reads off/disabled.

### 8. Connect GitHub builds and set the address as a build secret (Ahmadreza + Claude Code, POST-01, POST-04)

In the Cloudflare dashboard, connect the `ahmadreza-de` Worker to the GitHub
repository (Workers Builds) so every push to `main` auto-deploys. Build
command: `npm run build`, no output-directory override (`wrangler.jsonc`
already points `assets.directory` at `out`).

Then set `LEGAL_STREET` and `LEGAL_POSTCODE_CITY` as build secrets in that
Worker's settings — `scripts/legal-address.mjs` writes `legal.local.ts` from
them at build time. Never commit the real address to make a build pass.

**Verify:** trigger a build (e.g. push a no-op commit or use "Retry deploy")
and confirm the build log shows `npm run build` succeeding and the deployed
Impressum shows the real address, not a placeholder.

### 9. Deploy: move both domains, then delete the coming-soon Worker (Ahmadreza + Claude Code, DEP-06)

Only with the owner's explicit go, and only after steps 1–8 are done and step
4's `--strict` check has been re-run clean immediately before this step.

1. Deploy the `ahmadreza-de` Worker (via the GitHub connection from step 8, or
   `npx wrangler deploy` by hand if deploying once before wiring up builds).
2. In the dashboard, move both custom domains — the apex `ahmadreza.de` and
   `www.ahmadreza.de` — from the coming-soon Worker `silent-lake-8ae2` to
   `ahmadreza-de`.
3. Delete `silent-lake-8ae2` once the domains are confirmed live on the new
   Worker (`npx wrangler delete silent-lake-8ae2` or via the dashboard).
4. Also delete the private preview Worker `amonel-preview` now, per TODO.md
   owner point 6 (it carries the dummy address and has served its purpose):
   `npx wrangler delete amonel-preview`.

**Verify:** `curl -I https://ahmadreza.de/` and `curl -I https://www.ahmadreza.de/`
both return 200 from the new Worker (not the coming-soon page); the dashboard
no longer lists `silent-lake-8ae2` or `amonel-preview` as deployed Workers with
routes.

### 10. Post-deploy checks (Claude Code, DEP-07, DEP-05 go-live)

The counters (from TODO.md Phase 13):

```bash
curl -i -X POST https://ahmadreza.de/api/count/quiz.completed
# expect 204
curl -i https://ahmadreza.de/api/counts
# expect JSON, cache-control: public, max-age=60
curl -i -X POST -H "Origin: https://evil.example" https://ahmadreza.de/api/count/quiz.completed
# expect 403
```

Reset the test count immediately after:

```bash
npx wrangler d1 execute amonel-counters --remote --command "DELETE FROM counters"
```

Also check: legal pages load on the live domain (de/en/fa Impressum and
Datenschutzerklärung), the old `/journey/` and `/og/og-<locale>.png` URLs
still 301, a stray path returns a real 404, and `_headers`/`_redirects`
behave as they did in `out/` locally.

**Verify:** every curl above matches the expected status/header; the legal
pages show the real address; redirects and 404 behave as listed.

### 11. Sitemap in Search Console and Bing (Ahmadreza, SEO-12)

Google Search Console already has a verified Domain property for
`ahmadreza.de` — submit `sitemap.xml` there and request indexing for `/`,
`/en/` and `/fa/`. Submit the same sitemap in Bing Webmaster Tools.

**Verify:** Search Console shows the sitemap as "Success" with the expected
page count; Bing Webmaster Tools accepts the same sitemap without error.

---

**MISSING:** none of the commands or files referenced above are missing —
every script (`scripts/verify/placeholders.mjs`, `scripts/legal-address.mjs`),
npm script (`build`, `test`, `lint`) and config path (`wrangler.jsonc`,
`out/`) named here exists in the repository as of 2026-09-27.
