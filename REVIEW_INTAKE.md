# Review intake — 2026-10-03

این فایل نتیجهٔ خواندن کامل چهار فایل و تطبیق پیشنهادها با پروژه است.
پیشنهادهای مفید برای پیش از انتشار، کارهای بعد از انتشار، و پیشنهادهای
ناسازگار جدا شده‌اند. ثبت یک پیشنهاد به معنی اجرای آن یا تأیید نهایی محتوا نیست.

Operational home: [PROJECT_STATUS.md](PROJECT_STATUS.md).
Master scope and task status: [ROADMAP.md](ROADMAP.md).
This is a decision-and-acceptance appendix, not another status authority.
Update the linked ROADMAP row and operational handoff when work integrates.
Do not re-import the raw chats into Git: they contain personal/history material.

## Evidence and limits

Contents: applied documentation changes; execution sequence; bounded additions;
QA acceptance; existing-task follow-through; conditional intake; post-launch
candidates; rejected defaults; handoff; primary references.

- Reviewed baseline: `7578b009d9f98b947d506502233605fe5172845a`.
- GitHub was queried on October 3: main matched that baseline; no open PR.
  These are dated observations, not permanent live-state claims.
- Four attachments read in full: Go.txt 373 lines, Ge.txt 4160, C.txt 561,
  01.txt 975: 6069 lines in total. Repeated prompts and repeated proposals were
  read but consolidated below instead of creating duplicate work.
- Go and Ge include strong opinions and predictions without fresh execution
  evidence. C includes useful source observations; it does not prove a current
  browser reproduction. 01 is an older implementation/decision archive.
- Relevant source files were fetched at the pinned baseline, including landing,
  About, legal renderers, app registry, returning/unlocks, Journey, MobileShell,
  Scheduler, Paint, Binary/Morse, counters, build-soon and deployment documents.
- No fresh application build, browser/device QA, production-header inspection,
  private worktree inspection or Cloudflare acceptance was performed for this
  documentation task. Earlier test numbers are historical evidence.
- Documentation validation: the existing roadmap.test.mjs suite passed all
  6 tests, with 0 failures/skips, on the available Node 24.19.0 runtime.
  This does not replace canonical Node 24.21.0 application/CI validation.
- The supplied handoff says permanent CI has a separate local writer. Its local
  branch/commit was not visible here. Confirm that writer before starting or
  duplicating CI work; absence of a remote PR does not mean no local work exists.
- Owner decisions override speculative recommendations: keep Journey/OS/games,
  approved palette/fonts/light mode, chosen portrait, and the separate logo
  process. CV/final copy and owner real-device review remain in the final phase.

Source fingerprints, for identifying these exact inputs without committing them:

| Source | SHA-256 |
|---|---|
| Go.txt | da5680ce88daab948519329475504d2b47df5ca5311c00c0b1c3b453dfdaf1af |
| Ge.txt | d6b412c8f1354a435a72e7c896871071d01e6b37ca1e648cf39cd26b45382836 |
| C.txt | 3f20540ed90106ca200a2ebeff23e29812de791ee4f59238f74a8c22e6c5d564 |
| 01.txt | e648c1b35e287d7869ea2e46261fdda97ffb76a86565ffb2f68e3a51f5f6ed09 |

## Applied in this documentation change

1. Added the thin AGENTS.md entry point for tools that use it, pointing to the
   existing rules, shared status and this intake.
2. Corrected README's install instruction to npm ci, its obsolete “No server
   code” description, and its status-reading pointer.
3. Aligned SEO/deployment skill indexing instructions with DECISIONS 87:
   Impressum remains indexable; Datenschutz remains noindex.
   Removed duplicated legal identity from these instructions; they refer to
   src/content/legal.ts instead, preserving the legal-page-only policy.
4. Corrected the hosting handoff: Workers Builds integration is planned under
   POST-01, not established merely because the repo exists on GitHub.
5. Registered seven QA findings and three bounded technical improvements in
   ROADMAP, with real acceptance criteria below, and recalculated its tables.
   The lower percentage reflects newly registered remaining work; no completed
   implementation was removed.
6. Linked this intake from PROJECT_STATUS. Runtime changes below are queued,
   not claimed complete, reviewed or deployed.

## Execution sequence

1. Existing permanent CI writer finishes the separate CI PR (DEP-09).
2. Independent review and green remote runs; owner merges and attaches the stable
   required check. Canonical/npm10 lanes and Coming Soon coverage are verified.
3. Actual Cloudflare build/preview acceptance, controlled by the owner.
4. Reproduce the QA findings on the accepted baseline; fix confirmed ones in
   bounded PRs. Proposed triage: C/E first, then I/H/J, then K/B; escalate any
   newly reproduced blocker. J is real data loss and should not be dismissed
   merely because Paint is a bonus app. This changes triage, not product scope.
5. Small PRs for UX-01, LEG-21 and DEP-10, with the validation below.
6. Final chosen logo and its assets; CV/profile facts and PDF; final content
   preparation. These owner activities can proceed separately without rewriting
   runtime infrastructure or re-opening completed portrait/font decisions.
7. Fresh cross-browser, owner real-device, RTL, motion, screen-reader and visual QA.
8. FIN-01 entry-by-entry approval and OWN-04 proofreading.
9. LEG-05/07/11, D1/migration/rate limits, reconciled launch runbook and check-only
   release preflight; owner production approval.
10. Post-deploy smoke checks and indexing; optional additions follow launch.

No speculative eight-day deadline is assigned. Dependencies and evidence decide
when a phase is complete. Headless checks and real devices serve different purposes.

## Accepted bounded additions

| Task | Sources | Benefit / current evidence | Scope and acceptance |
|---|---|---|---|
| UX-01: early static About link | Go fast-track; C pre-launch CTA; Ge recruiter ideas | Landing already presents name/role, mail and two PDF controls, but its shortcut opens Desktop and About is in the footer. A new global recruiter mode would duplicate existing paths. | Add one visible locale-aware link to the existing /about/ near identity/actions. Keep Guided/Play/Desktop. Verify de/en/fa, 320–390 px, keyboard, no-JS, dark/light and no extra Journey bundle. Reuse nav.about where adequate; any changed copy gets CONTENT-TODO and CONTENT_REVIEW. PDF stays disabled until the real file exists. Small effort. |
| LEG-21: address snippet control | Go/Ge privacy; C legal review | Both LegalPage contact spans and build-soon's contact HTML lack data-nosnippet. Search snippets can derive from body text, not just the meta description. | Put the attribute on supported span/div/section wrappers for street/postcode, in both renderers and all locales. Preserve visible legal text, legal-name policy, imprint indexing/hreflang/sitemap and privacy noindex. Verify exported HTML using dummy fixtures, unchanged print and RTL, and existing SEO/legal tests. It is snippet control, not authentication, scraping protection or removal of a public address. Small effort. |
| DEP-10: Coming Soon security headers | C critical issue 5; Go security/cache | Main has public/_headers; build-soon copies _redirects and robots but no _headers. This proves an output gap, not absence of every header on the live domain. | Add dedicated static headers to soon/dist and serve under them in verification. Preserve inline language/scheme scripts/styles, local fonts, legal links, 404 and redirects. Assert nosniff, frame restrictions, referrer/permissions and a compatible same-origin CSP; inspect actual deployed headers only after an owner deploy. Do not copy unrelated Next/vCard rules blindly or claim API responses inherit static headers. Small effort. |

### QA work: evidence is not a fresh browser reproduction

| Task / finding | Evidence at reviewed source | Regression acceptance |
|---|---|---|
| QA-01 / B | MobileShell's open-app request calls open without the unlock check. Base apps are already always open; Troubleshoot is a bonus experience. | Seed both locked and unlocked progress; exercise launcher, Terminal request and return/back on mobile and desktop. One consistent launch decision/notice, clear pending handoff correctly, and preserve About/CV/Contact access. No auth/security claim and no mass unlocking. |
| QA-02 / C | returningRedirectScript redirects completed users without a replay flag; static About Journey links are ordinary links. Shell marks Desktop arrival completed and clears replay. | Explicit Timeline/About/quiz era links and “replay” reach Journey/hash for returning users. Default returning behavior remains deliberate. Verify fresh/returning visitors, three locales, Back/Forward/reload, hash preservation and blocked storage. Use the existing replay mechanism where appropriate; do not abolish the owner's returning policy without a separate decision. |
| QA-03 / E | Journey changes puzzle-live/visual/pointer state. Old reports describe hidden focusable controls; needs a current keyboard reproduction. | Invisible try/skip/puzzle controls cannot receive focus or announcements; active controls remain usable. Check Tab/Shift+Tab, reduced motion, gate open/close and focus restoration. aria-hidden alone is insufficient; choose inert/rendering/focus logic after reproducing. |
| QA-04 / I | Narrow Punch Card layout is reported; not reproduced here. | Verify 320/360/390 px, de/en/fa, touch and browser-toolbar states. All controls/readable text reachable, no overlap or page-wide overflow, intended internal scroll works without trapping vertical page scroll. Visual owner device review remains after final assets. |
| QA-05 / H | Scheduler uses role=radio buttons with click handlers, without radio arrow handling/roving tabindex. | Native radio semantics or complete APG radio keyboard behavior: one group Tab stop, selected focus, arrows wrap/change selection, Space selects; RTL is checked. Do not use a listbox pattern. |
| QA-06 / J | Paint debounces 600 ms and clears the timer on effect cleanup. | Draw and close immediately; reopen and recover the newest state. Check rapid strokes, undo/redo, pagehide and unavailable/quota-full storage. Flush the latest dirty state safely; opening Paint alone writes nothing, and cleanup does not update unmounted React state or overwrite newer data with an old closure. |
| QA-07 / K | Bytes/Morse panels conditionally mount and own their input states. | Preserve each tab's text/format/direction while switching. Stop Morse playback/listeners on leaving its panel. Accessible tab/panel relationships and keyboard controls remain valid. No new persistent storage. Lifting state is preferable to blindly keeping background audio mounted. NetworkApp state is a separate finding to reproduce, not the same component. |

C/Go/Ge agree on most of these symptoms, but rank them differently. None of those
rankings turns a code inference into fresh browser evidence.

## Useful improvements already covered by existing work

These are retained with concrete acceptance, rather than duplicated as new tasks.

| Idea / sources | Existing owner / scope | Required outcome and limits |
|---|---|---|
| Permanent CI, locked toolchain, zero unintended skips (all reports) | DEP-09, separate active writer per supplied handoff | Fresh npm ci on canonical Node/npm and supported npm10; dummy main and soon builds before relevant tests; lint/pixel-font/dependency/manifest checks. Validate expected optional artifacts narrowly. Do not hardcode historical test totals or replay toolchain research. |
| Stable required gate, minimal permissions, action pinning and cache hygiene (C/Ge) | DEP-09 + owner repository settings | Stable aggregate must fail if a needed lane fails/cancels/skips. No production secrets/private address, no privileged untrusted PR execution; npm download cache rather than restored node_modules. Owner attaches checks after names/results stabilize. |
| Behavioral tests rather than only source regexes (C) | QA-01..07; BASE-17 / DEP-09 | Test user-observable paths/state. Keep useful privacy/name/storage/copy contract tests. Do not remove all text assertions or assume no visual checks exist: crossing/frame comparisons already exist. |
| Release preflight / reproducible launch (C) | DEP-06, LAU-01, LEG-05, POST-01/04 | A future check-only tool refuses dummy/preview output, placeholder D1, stale/unapproved content and mismatched release artifacts without printing private data. Fixtures are synthetic; no automatic deploy. Reconcile local owner launch vs future Workers Builds and private build inputs before changing LAUNCH. Pin Wrangler for reproducibility after verifying the chosen version; no speculative latest install. |
| Preview exposure / noindex (Go/C/Ge) | LEG-05, DEP-06 | Owner verifies the current preview route and headers, then decides temporary restriction/removal after its use. noindex is not access control. Do not delete an active preview before required owner/logo/device review or enable cookie-setting production features. |
| Real devices, screen readers, keyboard/touch/audio/RTL (all + archive) | PERF-01/02/06/08 | Focused automated bug checks now; final owner hardware walkthrough after assets. Chrome cloud does not substitute for Firefox/Safari/real touch. Preserve supported environments and log failures with exact configuration. |
| Measured performance and lazy boundaries (Go/Ge/archive) | PERF-02/09, BASE-17 | Registry already lazy-loads app components; Journey defers GSAP and loads Lenis only for eligible pointers. Measure cold routes and interleaved A/B before new changes. No unverified DrawSVG rewrite, blanket will-change or 100dvh rollback. |
| Contrast, fonts, Persian bidi, reduced motion, print (all/archive) | PERF-04/08, SEO-23, BR-08, FIN-01 | Approved tokens/fonts stay. Check computed contrast over actual backgrounds/opacity and theme states, mixed-script line metrics and readable print. Screen brightness is not a calculation of CSS contrast. Existing print/axe coverage stays; new failures get reproduction and small fixes. |
| Unified true CV facts and usable PDF (all/archive) | OWN-02/05, APP-03, FIN-01 | At content phase, one approved public facts source feeds About/CV/PDF/profile copy. Owner checks dates, actual role responsibilities, credential wording and language levels against private originals kept outside Git/AI. No invented dates, automatic downgrade of a genuine role, or unquestioned old qualification claim. PDF language/length follows approved need; no broken links. |
| Official profile URLs and sameAs (all) | OWN-03, APP-02, SEO-03 | Owner supplies/approves URLs; preserve Person vs Amonel identities and reciprocal links where possible. A square portrait already exists. Account rename is optional and separate, with integration/redirect review; no automatic external edits or ranking guarantee. |
| Final logo/icons/OG consistency (all/archive) | BR-01, SEO-05/24 | Use the result of the separate logo process, then apply/test SVG, small icons, social cards and locales. Do not choose a new mark from an old audit, regenerate the chosen portrait or reopen approved fonts. |
| Final copy, sourcing and proofreading (all/archive) | FIN-01, OWN-04, LEG-20 | Visible copy reviewed one entry at a time, explicit approval only. Historical source registry already exists; improve remaining secondary citations with primary/institutional sources where useful. Historical PLACEHOLDER-row counts are approval debt, not proof that every sentence is nonsense or literally shows PLACEHOLDER. |
| D1, API resilience and rate limiting (all) | DEP-03/04/05/07, LEG-11 | Owner sets real binding/migration; verify missing D1/failure leaves pages usable. Asset serving bypasses /api Worker. Test abuse and shared-IP behavior; keep IP + Block and scope to API. No IP DB, session IDs, challenges or arbitrary threshold change. |
| Email choice and deliverability (all) | OWN-09, DEP-01 | Current Gmail is the published contact and sufficient for planned launch. Domain email is optional; if chosen, test receipt and actual reply identity and update privacy disclosures. No form or auto-reply is introduced. |
| Legal review, naming, history and backups (Go/Ge/C/archive) | LEG-05/07/08/10/18 | Separate real owner/legal verification from audit speculation. Current source exclusion and old address purge are distinct from employer history. Owner handles remaining purge/backup verification privately. No legal certainty asserted from screenshots or automatic destructive Git rewrite. |
| Documentation and multi-tool handoff (all) | PROJECT_STATUS, ROADMAP, this change | One integration writer, explicit baseline/branch/tests/reviewer/handoff, small relevant reads. Keep roles of scope, rationale, history, owner questions and approval. Archive closed queues with links when useful; never delete pending approvals or force all records into an arbitrary 150 lines. |

## Conditional intake: verify before adding launch scope

The following candidates are registered in ROADMAP's review appendix. They are
not done, not assigned, and not weighted launch requirements until evidence and
a bounded implementation justify promotion.

| Candidate | Sources | Value / cost / decision gate |
|---|---|---|
| A11Y-SKIP: visible-on-focus skip link and landmarks | C a11y | Useful keyboard shortcut. Existing skipToContent message alone is not a link. Inspect all relevant layouts before adding; preserve one main landmark, page chrome and print identity. Small if missing. |
| A11Y-TABS: stable tab/panel relationships beyond Binary | C | Check aria-controls targets and NetworkApp input persistence after repro. Reuse QA-07 checks; keep inactive panel side effects stopped. Small/medium. |
| A11Y-WINDOW: focus/close lifecycle | Go/Ge/C | Verify current focus transfer/restoration first. Trap only modal dialogs; desktop windows are not automatically modal. Escape must not steal an app's own input/game/dialog key. Medium, conditional. |
| PERF-DEPENDENCIES: unused framer-motion / import layering | C/Ge | Package is installed; search current imports before removal. After CI, a separate dependency change may remove truly unused code and validate lock/npm lanes. Split long components or shared theme data only for a real boundary/state problem, not line count alone. |
| PERF-FA: Persian font-arrival cost | archive/Ge | Existing tracked re-test. Measure fallback/metric options; preserve all needed Persian/Arabic glyphs, self-hosting and approved Vazirmatn. No automatic font-display optional or aggressive subsetting. |
| TEST-BROWSER: modest continuous browser smoke lane | C | After CI is reliable, select meaningful route/keyboard smoke checks with explicit Chrome/pointer configuration. Isolate ports/profiles; no blanket parallelization of shared CDP harnesses. Existing manual device QA remains. Medium. |
| SEO-GRAPH: schema about/type and head validation | C | Validate actual graph against primary schema/search docs and rendered content. Change only a proven mismatch; no speculative schema proliferation or hidden legal surname. Small. |
| DOC-LAUNCH: reconcile remaining runbook drift | C | Resolve LAUNCH vs POST-01/04 ordering and stale wording before release preflight. Preserve historical decisions. Do not report fixed merely because this intake notes it. |
| SECURITY-HSTS: verify effective zone headers | C | Owner checks actual zone/browser response and subdomain requirements at LEG-11/DEP-07. No automatic preload or includeSubDomains. Small verification; configuration owner-gated. |
| CONTENT-FAMILY: name-origin/easter egg consent | Go/archive | If retained for public copy, confirm the other person's consent without copying private names into this plan; distinguish brand story from Person schema. Low priority, owner-gated. |

## Worth considering after launch

All are registered as candidates in ROADMAP. None is a new pre-launch blocker.

| Candidate | Sources | Why / cost / boundaries |
|---|---|---|
| EVIDENCE-MAP: skill → existing evidence | Ge/C | Link approved skills to real site engineering, network/support exercises or an honest case study. Explain “simulation” explicitly; games are not proof of production infrastructure experience. Small, can fit final About copy if owner chooses without delaying launch. |
| SITE-ARCH: explain how Amonel is built | Ge infra/stack; C Wie gebaut | Reuse existing Terminal/help/About where adequate before creating a new route. Describe static assets, /api Worker, D1, privacy and CI with an accurate diagram. No fake CPU/TLS/DNS live telemetry or third-party calls. Small/medium. |
| LAB-CASE: sanitized homelab/incident case study | Go/Ge/C | One genuine problem → diagnosis → implementation → verification → result, using owner-approved facts, diagrams and documentation IPs. No real internal hostnames, credentials, household address or live admin endpoints. Medium, facts required. |
| SUPPORT-CASES: stronger Linux/VLAN/network exercises | Ge | Tickets and Troubleshoot already exist. Add a small sourced case only if it teaches something new and matches demonstrated knowledge. Clearly fictional scenarios; no employer material. OSPF/BGP is not assumed competence or a launch requirement. Medium. |
| LAB-NOTES: small technical learning log | Ge | Only real, sanitized work the owner can maintain; no arbitrary target of fifty entries, generic blog, testimonials or reputation claims. Medium continuing effort. |
| PWA-OFFLINE: interview demo offline | Ge | A manifest already exists; true offline adds service-worker/cache freshness and privacy/storage work. Evaluate benefit and avoid retaining stale legal/CV content. Current CSP worker-src none would need deliberate review. Medium/high; optional. |
| WASM-SHELL: real in-browser shell | Ge | Educational experiment only after launch; weight, sandbox/memory limits, attack surface, licensing and accessibility need review. Local commands do not imply a real production server. High cost; low present priority. |
| ERA-EXPANSION / CMS | archive/Ge | Existing POST-02/03 already cover optional CMS and next era. Source facts and keep one mode-driven scene architecture. Do not expand era count during stabilization. |
| CSP-HASHES: tighter static inline policy | C/Ge | Explore build-derived hashes once stable; test bootstrap/Next data, scheme, styles, all routes and exports. Replacing unsafe-inline with self alone can break the site. Medium/high, optional. |
| DOC-ARCHIVE: archive finished evidence/queues | Go/Ge/C | Improve retrieval without destroying decision evidence or approval backlog. Keep PROJECT_STATUS as handoff and ROADMAP as scope; index/archive completed material with working links. Small/medium. |

## Proposals rejected or not adopted as defaults

| Proposal | Disposition / reason |
|---|---|
| Remove Journey, OS, games or rebuild as a conventional CV | Rejected. Conflicts with product purpose; improve access to existing professional content instead. |
| Unlock everything, move all creative apps away, replace the dock | Not adopted. Base CV/About/Contact are already available and mobile has a recruiter-oriented dock. Fix B consistently; a lock policy redesign needs an owner decision. |
| Global recruiter mode, new permanent sticky bar on every view | Not adopted. UX-01 solves the supported access gap with less state/chrome; no evidence yet justifies a second experience. |
| Force real-photo replacement or select a logo from an old review | Rejected as automatic work. Portrait is chosen/active; logo is handled separately. |
| Change approved typography, palette or all motion tiers | Rejected without a measured defect and owner decision. K6 visual rollback and native-touch/viewport fixes are already recorded. |
| Font-display optional, blanket 100dvh or will-change, remove mobile motion entirely | Not adopted. Risks Persian readability, toolbar stability, memory/performance and visual intent; require targeted A/B evidence. |
| Treat DrawSVG as a proven installed bottleneck | Unsupported report claim. Current evidence here does not establish that plugin or its cost. |
| Force domain email as a launch/legal blocker | Rejected. Existing working Gmail policy is explicit; optional OWN-09 remains. |
| New paid/external AI, analytics, forms, CDNs or live homelab API | Rejected by current privacy/product constraints. Assistant remains local search; real infrastructure status is not needed for a case study. |
| Repeat allowScripts/ignore-scripts research or manually patch lock | Rejected as routine next work. Validated toolchain policy and exact SWC bridge already merged. New upstream evidence can justify a future separate investigation. |
| Rewrite public history immediately to remove employer references | Not authorized; not an established legal necessity from these reports. Irreversible owner choice with evidence, backups/redirect consequences and protected-main governance. Do not conflate with completed private-address purge. |
| Change Impressum to noindex or publish legal surname in About/schema | Rejected under current owner decision and SEO rules. LEG-21 targets address snippets without overriding that decision. |
| data-nosnippet as anti-scraping/authentication or legal safety guarantee | Rejected claim. The page remains public; Google's snippet directive is narrower. |
| Session-based rate limiting, challenge cookies or per-user metrics | Rejected. Keep approved IP + Block and anonymous aggregates; no new tracking IDs. |
| Delete source/copy/privacy tests or replace all tests with screenshots | Rejected. Preserve useful contracts and add behavioral regressions where the actual gap is behavior. |
| Parallelize every browser harness | Rejected default. Shared ports/profiles and browser state can race; separate lanes only after isolation. |
| Combine every project document into a 150-line file / new duplicate rules authority | Rejected. Short bootstrap and indexed intake preserve the existing document roles and evidence. |
| Two-stage profile-only launch / counters disabled | Parked owner product decision. Can simplify release if explicitly chosen, but changes current scope/sequencing and is not implemented by an audit. |
| Guaranteed SEO rank, recruiter conversion/time-to-hire or eight-day launch | Unsupported predictions. Validate usability and indexing; do not promise outcomes or invent deadlines. |
| Assertions about degrees, job titles, employment permission, cookie exemption or AI Act compliance as settled facts | Not adopted from audits alone. Verify actual facts/document scope and current primary sources during owner content/legal phase; no automatic rewrite of personal history. |
| “D1 failure takes down the whole site” / “no lazy loading or visual tests exist” | Contradicted by asset/API separation, registry lazy imports and existing visual verification. Preserve and test the existing mechanisms. |
| New llms-full/FAQ/review/rating schema or other AI-SEO gimmicks | Rejected by existing external-checklist policy without real content and an owner-approved need. |

## Task handoff and review

- Writer: command-center documentation task.
- Branch: docs/review-intake-2026-10-03.
- Integration: independent review, then owner merge; no automated merge/deploy.
- Scope: Markdown instructions, plan and generated ROADMAP summary only.
- Publication review initially rejected the two skill-document blobs because
  their inherited text repeated the full legal identity. The revised versions
  remove that repetition and refer to the legal source instead.
- CI writer should rebase/recount if its parallel branch changes ROADMAP;
  preserve the new task IDs and intake pointer rather than replacing the file.
- On integration, record actual PR/commit and applicable validation in
  PROJECT_STATUS. Runtime work is still OPEN until implemented and verified.
- Review checklist: no private address/employer material; no user-copy approval;
  no runtime/dependency/workflow/config change; task IDs and relative links valid;
  summary parser agrees with rows; preserved owner decisions and active CI owner.

## Primary technical references

Checked on 2026-10-03:

- [Google: snippets](https://developers.google.com/search/docs/appearance/snippet)
  and [supported attributes](https://developers.google.com/search/docs/crawling-indexing/special-tags):
  snippets can use body text; data-nosnippet is supported on div/span/section.
- [WAI-ARIA APG: radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/):
  expected keyboard selection/focus behavior, including wrapping.
- [Cloudflare: static asset headers](https://developers.cloudflare.com/workers/static-assets/headers/):
  _headers belongs in the output directory; Worker-generated responses require
  their own headers.
