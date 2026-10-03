# Amonel / Ahmadreza.de — Living Project Status

> **Purpose:** this is the shared operational control-room file for all AI tools and the owner.
> It answers: **what is already done, what is only validated off-main, what is active now, what is still open, and what must happen next.**
>
> This file is intentionally separate from:
> - `ROADMAP.md` — master scope/progress until launch;
> - `DECISIONS.md` — architectural/product decisions and rationale;
> - `PROJECT_STATE.md` — historical implementation/state record;
> - `TODO.md` — detailed owner questions and operational follow-ups;
> - `CONTENT_REVIEW.md` — final owner approval of user-facing copy.
>
> **Never put secrets, private postal address data, tokens, API keys, credentials, or unredacted private legal data in this file.**

## Status metadata

- Last updated: **2026-10-03**
- Current phase: **pre-launch stabilization / infrastructure hardening**
- Authoritative public repository: `ahmadrezataherieng-gif/ahmadreza-de`
- Authoritative `main` at this snapshot: `4f7467c30ad595671393f172294e2646712a3914`
- Current open PRs at this snapshot: **0**
- Current non-main evidence branch retained at this snapshot:
  - `probe/toolchain-node24`
- Status-file integration branch is intentionally omitted from the operational branch list.
- Public site state last verified in the project review: **Coming Soon**, not the full production site.
- ROADMAP on current `main`: **91 done / 9 partial / 25 missing / 125 total; 78% weighted progress**.
- Important: ROADMAP progress is **not** the same as launch readiness.

## Status vocabulary

Use these labels consistently:

- **DONE** — merged into `main` and verified.
- **OFF-MAIN READY** — implementation exists outside `main`, has passed review/validation, but is not merged.
- **ACTIVE** — currently being worked on.
- **BLOCKED** — cannot move until a named dependency/owner action is resolved.
- **OPEN** — known remaining work, not currently active.
- **SUPERSEDED** — replaced by a later decision or implementation.
- **REJECTED** — investigated and intentionally not adopted.

## Mandatory AI handoff protocol

Every AI working on this repository must follow this order.

### Before doing work

1. Read `CLAUDE.md`.
2. Read this file, `PROJECT_STATUS.md`.
3. Read the relevant rows in `ROADMAP.md`.
4. Read the relevant decisions in `DECISIONS.md`.
5. Read the matching project skill under `.claude/skills/` when applicable.
6. Verify the live Git state before trusting this document:
   - current branch / worktree;
   - `HEAD`;
   - `origin/main`;
   - clean/dirty status;
   - open PRs when integration status matters.
7. If live Git evidence conflicts with this file, **live Git wins** and this file must be corrected in the integration step.

### While working

- Do not silently broaden scope.
- Keep experimental/research work separate from production implementation.
- Never push directly to `main`.
- Never deploy without the owner's explicit approval.
- Never put private legal address data or credentials into Git, public CI logs, artifacts, or this file.
- Distinguish clearly between:
  - verified on `main`;
  - verified on a feature/probe branch;
  - verified only in a disposable/local experiment;
  - merely proposed.

### After meaningful work

The **integration owner** for the task must update this file in the same PR when the canonical status changes.

Do **not** make every parallel reviewer edit this file independently; that creates needless merge conflicts. Reviewers should instead return a short handoff containing:

- task;
- verdict;
- evidence;
- required changes;
- remaining risks.

The integration owner then updates this file once the result is accepted.

Never mark an item DONE without concrete evidence such as:
- merged PR/commit;
- successful required tests;
- verified live configuration where relevant.

---

# 1. Current authoritative `main`

Current `main`:

`4f7467c30ad595671393f172294e2646712a3914`

Latest merged change:

`chore: pin validated Node 24 toolchain`

Recent merged fixes:

| Work | Status | Evidence |
|---|---|---|
| Reject inherited filesystem prototype keys and stop Terminal/Puzzle crashes | DONE | PR #4 |
| Preserve About identity/contact information in print/PDF | DONE | PR #5 |
| Stabilize `npm ci` dependency graph with Candidate A | DONE | PR #6 |
| Exclude local Impeccable vendor tooling from project lint scope | DONE | PR #7 |
| Pin the validated Node 24/npm toolchain policy | DONE | PR #8 / `4f7467c30ad595671393f172294e2646712a3914` |

No open PR exists at this snapshot.

---

# 2. Core product state

The main product structure already exists.

## Journey

- Seven-era computing journey exists.
- Guided and Interactive/Play modes exist.
- Puzzle engine exists.
- Era themes, transitions/crossings and Convergence exist.
- Historical source registry exists.
- Journey performance has already received multiple optimization rounds.

Status: **BUILT / stabilization remaining**

## Amonel Desktop

- Desktop shell exists.
- Window manager, launcher/taskbar/mobile shell exist.
- Core and bonus apps exist, including the newer utility/learning apps.
- Terminal, filesystem, network tools, scheduler, quiz, paint and other experiences exist.

Status: **BUILT / QA findings remain**

## Languages

- German, English and Persian exist.
- RTL handling exists for Persian.
- Legal bidi handling exists.

Status: **BUILT / final owner proofreading still OPEN**

## SEO / discoverability

Major SEO infrastructure exists, including:
- sitemap;
- robots;
- hreflang/canonical handling;
- structured data;
- static About pages;
- OG images;
- page-specific metadata;
- indexable Impressum;
- local/static content strategy.

Status: **BUILT / final launch tasks remain**

---

# 3. Recent infrastructure investigations — completed

## 3.1 npm-ci / SWC helper compatibility

Status: **DONE**

Merged Candidate A:

- root production dependency: `@swc/helpers@0.5.23` exact;
- Next keeps its own nested `@swc/helpers@0.5.15`;
- no override;
- Next / next-intl versions unchanged.

This fixed the older-npm `EUSAGE` lock mismatch.

Validated across Windows and native Ubuntu with npm versions including:
- 10.9.2;
- 11.4.2;
- 11.18.0.

Later validation also covered npm 11.19.0.

## 3.2 `allowScripts` investigation

Status: **REJECTED as a permanent name-wide denial policy**

Windows and Ubuntu evidence agreed:

- npm 11.18 runs the lifecycle scripts for:
  - `@parcel/watcher@2.6.0`;
  - `@swc/core@1.16.2`;
  - `unrs-resolver@1.12.2`.
- name-wide denial can block all three;
- the app still passed in the tested environments;
- npm 10.9.2 ignores that policy and executes the scripts;
- a name-wide deny would silently apply to future versions and may block a future required install script.

Decision:

- **do not add a permanent name-wide deny policy**;
- current default behavior remains until a better policy is justified.

## 3.3 npm 10 optional/extraneous artifacts

Status: **DONE / no repository change required**

Known npm 10 compatibility-lane artifacts:

- `@emnapi/runtime@1.11.3`;
- `@img/sharp-wasm32@0.35.4`.

Independent review classified them as harmless optional/platform tree artifacts in the tested graph.

Important CI rule:

- required/missing/invalid dependency failures remain blockers;
- these exact known optional artifacts must not trigger blind lockfile surgery;
- do not generalize this exception to arbitrary future extraneous packages.

---

# 4. Toolchain policy — current state

Status: **DONE on main**

Merged through **PR #8**:

- merge commit: `4f7467c30ad595671393f172294e2646712a3914`;
- `.node-version` = `24.21.0`;
- `engines.node` = `^24.18.0`;
- `engines.npm` = `>=10.9.2 <12`;
- canonical development/CI npm = `11.19.0`;
- compatibility npm = `10.9.2`;
- no `.nvmrc`;
- no `packageManager`;
- no `devEngines`;
- no `allowScripts`.

`package-lock.json` remained unchanged.

Independent implementation review verdict before merge:

**APPROVE WITH NON-BLOCKING NOTES**

Required changes:

**None**

## Validation evidence retained

### Windows

Node 24.21.0 / npm 11.19.0:

- `npm ci`: PASS;
- tests: zero failures;
- post-build result: 315 passed / 3 skipped;
- lint: 0 errors / 0 warnings;
- preview setup/build with dummy legal data: PASS;
- 22/22 static entries generated;
- pixel-font: PASS;
- `npm ls --all`: no invalid or missing required dependencies;
- lock durability: PASS;
- npm 10.9.2 still passed after npm 11.19 round trips.

### Ubuntu GitHub Actions probe

Temporary workflow run: **37002658467**

Successful lanes:

1. Node 24.21.0 / npm 11.19.0 — canonical candidate;
2. Node 24.18.0 / npm 10.9.2 — Cloudflare current-default compatibility;
3. Node 24.21.0 / npm 10.9.2 — Node-override/npm10 safety case.

Temporary branch:

`probe/toolchain-node24`

Rules:
- it is evidence only;
- do not merge it blindly;
- retain it until permanent CI replaces the probe.

### Exact next action

Build **permanent GitHub Actions CI** as a separate PR, then attach stable required status checks to `main`.

---

# 5. Permanent CI and repository protection

Status: **NEXT / OPEN — toolchain merge complete**

Current main ruleset already enforces:

- PR required;
- linear history;
- no branch deletion;
- no force push;
- review-thread resolution;
- rebase merge only;
- no bypass actors.

Current gap:

- **no required status check is attached**;
- no permanent workflow exists on `main`;
- the only Actions workflow observed so far is the temporary toolchain probe branch.

## Planned permanent CI

At minimum, permanent CI must contain two explicit compatibility concepts:

### Canonical lane

Target:
- Node 24.21.0;
- npm 11.19.0.

Expected checks:
- clean `npm ci`;
- tests;
- lint;
- dummy-data preview setup/build;
- pixel-font;
- dependency integrity.

### Cloudflare compatibility lane

Target:
- effective supported Node 24 line;
- npm 10.9.2.

Expected checks:
- clean `npm ci`;
- dummy-data preview build;
- dependency integrity;
- no private legal data or Cloudflare secrets.

The permanent workflow must be written for PR/main use; do not simply merge the temporary probe workflow.

## Three currently skipped tests

Latest full post-build result:

- 318 total;
- 315 passed;
- 3 skipped.

The remaining skips require the separate Coming Soon output (`soon/dist`).

Permanent CI must explicitly decide whether to:
- build Coming Soon and run those checks in the same workflow; or
- separate them into a clearly named lane.

Do not misreport the partial suite as a completely unskipped suite.

## After stable CI exists

Add the stable required check(s) to the `Protect main` ruleset.

---

# 6. Open QA findings

The older QA report was based on an earlier main. Two major findings have already been fixed:

- Terminal prototype-key crash — **DONE**;
- About print identity hidden — **DONE**.

The following seven findings remain open in project tracking, but they do not all have equally fresh evidence.

| ID | Current classification | Finding |
|---|---|---|
| B | OPEN; current-code evidence exists | Mobile can reach locked Troubleshoot app via command path |
| C | OPEN; current-code evidence exists | Journey links from Timeline/About can redirect a returning user back to Desktop |
| E | OPEN; needs fresh browser revalidation | Hidden Journey try/skip controls can receive keyboard focus |
| I | OPEN; needs fresh narrow-mobile revalidation | Punch Card sizing/internal scroll/overlap on narrow mobile |
| H | OPEN; current-code evidence exists | Scheduler radio controls do not fully implement expected keyboard radio behavior |
| J | OPEN; current-code evidence exists | Closing Paint quickly can lose the most recent change before persistence |
| K | OPEN; current-code evidence exists | Switching Binary/Morse tabs clears typed input |

Additional QA notes:

- F/G were not reproduced in the later Chromium reconstruction and should not be treated as confirmed product bugs without new evidence.
- L remains a separate cold/offline translation-load recovery test.
- an old CDP pointer/layout observation was an environment issue and must not be promoted to a confirmed product bug.

Important:
- these seven items are not yet represented cleanly as their own ROADMAP rows;
- when the permanent CI/toolchain work is closed, revalidate them on current `main` before batching fixes.

---

# 7. Owner/content work still open

## Already supplied / do not reopen unnecessarily

- Portrait image: DONE and active in the site.
- Gmail contact address: active and currently the one public contact address.
- Square profile portrait asset: already prepared.

## Still open

### Resume

- PDF resume is not available in the repository.
- `RESUME.available = false`.
- CV UI structure exists, but final facts and PDF remain incomplete.

Related:
- OWN-02;
- APP-03;
- OWN-05.

### Public profile URLs

Still missing:

- LinkedIn URL;
- GitHub URL;
- XING URL.

Current `profiles.ts` values are null.

Related:
- OWN-03;
- APP-02;
- SEO-03.

### CV facts

Still incomplete:

- dates;
- earlier positions;
- education;
- certificates;
- final skills/languages/projects content where still placeholder-driven.

Related:
- OWN-05.

### Final copy approval

All user-facing copy is still governed by `CONTENT_REVIEW.md`.

Final launch requires:

- owner review;
- explicit final approval;
- German/Persian proofreading.

Related:
- OWN-04;
- FIN-01.

### Final email decision

Gmail currently works and is sufficient for launch.

Domain email remains optional unless the owner chooses it.

Related:
- OWN-09 / DEP-01.

---

# 8. Branding / assets

Status: **OPEN / needs owner-confirmed final application**

The current repository contains Amonel branding, but the reviewed project status still treats the final logo/application pass as incomplete.

Before launch confirm:

- final chosen logo;
- site/header/desktop usage;
- favicons/app icons where relevant;
- final OG/share assets;
- no stale interim logo remains.

Do not reopen the portrait decision; that asset is already done.

---

# 9. Real-device / accessibility QA

Still open before launch:

- real Android/iPhone checks;
- Safari/WebKit behavior on a real device where practical;
- Firefox real-device/browser recheck;
- mobile keyboard behavior;
- touch/pen interaction;
- Morse audio;
- Persian/RTL performance;
- manual screen-reader walk;
- NVDA + Firefox;
- VoiceOver/iPhone where available.

Relevant ROADMAP:
- PERF-01;
- PERF-02 remaining re-test;
- PERF-06;
- PERF-08.

Automated accessibility coverage already exists and is not a substitute for these manual checks.

---

# 10. Legal and launch blockers

Still open / owner-gated:

- final legal feature audit (LEG-05);
- owner verification of Impressum/Datenschutz wording (LEG-07);
- trademark/commercial-name check where applicable (LEG-10);
- Cloudflare launch configuration confirmation (LEG-11);
- final verification of the old GitHub purge and backup disposition (LEG-18);
- create/confirm real D1 database and apply migration (DEP-03);
- configure/verify counter rate limiting (DEP-04);
- activate anonymous counters only with their prerequisites (DEP-05);
- actual production deployment and domain move (DEP-06);
- post-deploy validation (DEP-07);
- submit sitemap/request indexing after launch (SEO-12).

Current `wrangler.jsonc` on `main` still contains the placeholder D1 database id:

`00000000-0000-0000-0000-000000000000`

Do not deploy production with that placeholder.

---

# 11. Cloudflare / production boundary

Important distinctions:

- merged into GitHub != deployed;
- CI green != Cloudflare production proven;
- GitHub Ubuntu runner != full Cloudflare build image;
- local preview != production.

An **actual Cloudflare preview/build** remains a separate acceptance gate after permanent toolchain/CI work.

The public domain was still serving the Coming Soon site in the most recent project review, not the full current application.

---

# 12. Documentation drift still to resolve

Known documentation drift:

- `PROJECT_STATE.md` and `LAUNCH.md` still contain older snapshot assumptions in places;
- ROADMAP does not yet cleanly represent the seven QA findings as distinct work items;
- DEP-09 is now updated on `main` to the validated toolchain policy and permanent CI is its remaining half;
- launch/cloud-build sequencing needs to remain consistent between LAUNCH/POST-01/POST-04 and actual owner choice.

Do not rewrite historical decisions to hide this drift. Update the current operational sections with evidence.

---

# 13. Ordered execution plan from this snapshot

Do work in this order unless a new verified blocker changes dependencies.

## Step 1 — integrate the reviewed toolchain policy

Status: **DONE**

- PR #8 rebase-merged;
- merge commit: `4f7467c30ad595671393f172294e2646712a3914`;
- local owner checkout synchronized and clean.

## Step 2 — permanent GitHub Actions CI

Status: **NEXT**

- canonical Node/npm lane;
- Cloudflare compatibility lane;
- decide explicit Coming Soon test coverage for the three skips;
- dummy legal data only;
- no deploy/secrets.

## Step 3 — required checks on `main`

After CI names are stable:

- attach required successful status check(s) to the active branch ruleset;
- keep rebase-only / no-force / no-delete protections.

## Step 4 — actual Cloudflare build/preview acceptance

- no production domain move yet;
- validate effective toolchain/build behavior in the actual Cloudflare environment;
- investigate any Cloudflare-only difference.

## Step 5 — current-main QA bug revalidation and fixes

Recommended order after fresh reproduction:

1. B;
2. C;
3. E;
4. I;
5. H;
6. J;
7. K.

Use small independent PRs when reasonable.

## Step 6 — final branding/assets

- final logo;
- icons/share assets;
- verify no interim assets remain.

## Step 7 — CV/profile/content completion

- resume facts;
- resume PDF;
- profile URLs;
- About/CV corrections;
- final email choice if desired.

## Step 8 — fresh QA

- browser matrix;
- real devices;
- RTL/Persian;
- accessibility/screen readers;
- performance sanity check;
- owner visual preview.

## Step 9 — FIN-01 final content review

Review `CONTENT_REVIEW.md` with the owner item by item.

No automatic bulk-finalization.

## Step 10 — legal / Cloudflare / launch prerequisites

- final legal review;
- D1;
- migration;
- rate limit;
- placeholder gate;
- actual deploy only with owner approval.

## Step 11 — post-deploy

- counters;
- legal routes;
- headers;
- redirects;
- 404;
- sitemap;
- indexing;
- production smoke test.

Post-launch-only work such as CMS and the planned 1977/Apple II era stays out of the launch-critical path unless the owner explicitly changes scope.

---

# 14. Active work ledger

Update this table whenever a task is assigned or completed.

| Task | Tool / role | State | Integration target | Notes |
|---|---|---|---|---|
| Toolchain validation | Codex + GitHub Actions + independent architecture reviews | DONE | evidence only | probe run 37002658467 successful |
| Toolchain policy implementation | Codex writer | DONE | PR #8 / main | merged as `4f7467c30ad595671393f172294e2646712a3914` |
| Toolchain independent implementation review | Claude Sonnet Thinking | DONE | review gate | APPROVE WITH NON-BLOCKING NOTES |
| npm 10 optional artifact review | Claude Sonnet Thinking | DONE | no code change | harmless known optional artifacts |
| Permanent CI | unassigned | NEXT | future PR | canonical + Cloudflare-compatibility lanes |
| Required status checks | owner + GitHub | OPEN | repository settings | begins after stable CI |
| Seven QA findings | unassigned | OPEN | small future PRs | fresh reproduction first |

---

# 15. Evidence hierarchy

When deciding what is true, use this order:

1. **Current live Git/GitHub state** — branch, commit, PR, diff, Actions result.
2. **Actual current source files on the relevant commit/worktree**.
3. **Current test/build/browser evidence**.
4. **This file — PROJECT_STATUS.md**.
5. **ROADMAP.md / DECISIONS.md / PROJECT_STATE.md / TODO.md / LAUNCH.md** according to their roles.
6. Older QA reports and generated reports.
7. Chat history / memory.

A newer lower-level primary fact beats an older report.

---

# 16. Update template for future AI integrations

When a meaningful task reaches integration, update the smallest relevant sections above and add a short handoff below.

Use this template:

```md
## Handoff YYYY-MM-DD — <task>

- Base main:
- Feature branch / worktree:
- Writer:
- Reviewer:
- Files changed:
- Tests:
- Browser/visual QA:
- Security/privacy checks:
- PR:
- Merge commit:
- Deployment:
- Final state: DONE / OFF-MAIN READY / BLOCKED
- Remaining follow-up:
```

Keep handoffs factual and short. Do not turn this file into a raw chat log.

---

# 17. Current next command-center decision

At this snapshot:

**Do not restart DEP-09 research.**

Research and validation are already complete.

The next engineering action is:

**build permanent GitHub Actions CI as a separate task, then attach stable required checks to `main`.**


## Handoff 2026-10-03 — Toolchain policy integration

- Base main: `fdb3c4bbb4b54a63424c846504aa518015f90ea5`
- Feature branch / worktree: `chore/toolchain-policy-node24`
- Writer: Codex
- Reviewer: Claude Sonnet Thinking + command-center verification
- Files changed: `.node-version`, `package.json`, `DECISIONS.md`, `ROADMAP.md`, `CLAUDE.md`
- Tests: validated before integration on Windows and Ubuntu; probe run 37002658467 green
- Browser/visual QA: not applicable; no user-facing visual change
- Security/privacy checks: dummy legal data only; no secrets; no Cloudflare mutation
- PR: #8
- Merge commit: `4f7467c30ad595671393f172294e2646712a3914`
- Deployment: none
- Final state: DONE
- Remaining follow-up: permanent GitHub Actions CI, then required checks
