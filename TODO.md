# Open questions

Things that need a decision from Ahmadreza before the phase that depends on them.

## Assets Ahmadreza owes

- **Portrait photo.** Portrait orientation, **4:5, exactly 1200 × 1500 px**
  (2x the largest display size, 600 × 750 CSS px). Progressive JPEG, ideally
  under 250 kB, face in the upper third, plain or softly blurred background.
  Put it at `public/images/portrait.jpg`, then set `PORTRAIT.available = true` in
  `src/content/profile.ts`. The layout reserves exactly this box, so nothing
  shifts when it arrives.
- **Résumé PDF.** Put it at `public/files/ahmadreza-taheri-lebenslauf.pdf`, then
  set `RESUME.available = true` in `src/content/profile.ts`. Until then the
  controls (header corner and under the role) show "Lebenslauf folgt in Kürze"
  and are not links. Decide whether you want one German PDF for all languages or
  one per language.
- **Email address:** confirmed as `kontakt@ahmadreza.de` in Phase 7 and live on
  the site (`EMAIL.available = true`). It must receive mail before launch - see
  Phase 13.

## Copy to confirm

- **Landing role line** (`landing.role`): "Fachinformatiker für
  Systemintegration in Ausbildung bei der Stadtverwaltung Trier". Draft; finalise
  the exact wording, and check the English and Persian versions.
- **Landing facts** (`landing.facts`): Systemintegration · Stadtverwaltung Trier ·
  Netzwerke · Linux · Deutsch · Englisch · Persisch. Drafted from what the site
  already says about you; confirm or replace, and say whether English really is
  a working language for you.
- **Era copy.** The seven truths and insider details were written in Phase 5 and
  are sourced (DECISIONS.md 32), but the remaining era prose is still a draft in
  German, English and Persian.
- **German tone.** All German copy was rewritten to "Sie" in Phase 5.5A. Read
  it once as a whole: landing, journey, puzzles, the lock cue.
- **Puzzle copy** (`puzzles.*` in all three message files): invitation, task,
  hint, answer, success and skip for each of the seven puzzles, the gate cue,
  and the mode labels ("Zuschauen" / "Selbst lösen"). German is the source,
  English and Persian are translations to check. The 1946 bug history (Harvard
  Mark II, 9 September 1947, a year after ENIAC) is sourced in DECISIONS.md 32.
- **Play-mode card** (`landing.interactiveText`): now says that each era opens
  once its puzzle is solved or its solution shown. Confirm the wording.
- **Puzzle scenarios** are invented but technically exact: the home network
  192.168.1.0/24 with router .1 and printer .20, the service `portfolio-web` on
  TCP 443, and the file tree under `/home/ahmadreza`. Say if any of it should
  mirror something real of yours instead.
- Which projects, skills and CV entries go into `src/content/`.

### Phase 7 — the apps' copy (German is the source; check en and fa)

- **About** (`messages/apps/about/`, structure in `src/content/about.ts`) is a
  draft written only from facts already on the site. Confirm the wording, first
  person included, and supply what is marked "Angabe folgt" on the page:
  - the **start date** of the apprenticeship (`careerStations[0].start`, `YYYY-MM`)
    and its expected end, if it should show;
  - the **earlier stations** - school, studies, earlier work, the move to
    Germany - which replace the placeholder station `earlier`;
  - the **level of each language** (`languages[].level`); none is shown until
    then, rather than a guess;
  - whether the **skill list** (three areas, thirteen items, no levels) is right:
    it follows the stated focus (networks, Linux) and the apprenticeship's
    subjects, so remove anything you would not want to be asked about;
  - the sentence "Mich interessiert, was unter der Oberfläche passiert …" states
    an interest - keep it only if it is yours.
- **Projects** (`src/content/projects.ts`): only this website so far, with the
  GitHub repository `ahmadrezataherieng-gif/ahmadreza-de` as its source link.
  Confirm the link should be public on the site, and name other projects.
- **Tickets** (`messages/apps/tickets/`, `src/content/tickets.ts`): nine
  invented cases at the invented company Talweber Logistik. Technically checked,
  but read them once: they are presented as how you work.
- **Traceroute** copy (`messages/apps/traceroute/`), and the Terminal's help
  and welcome lines (`messages/apps/terminal/`).

## After launch

- **The first era added after launch will be 1977: the Apple II.** It needs its
  own truth, sourced insider detail, visual, puzzle and theme, and slots in
  between 1971 and 1981 (`src/content/eras.ts`, `eras/registry.ts`, themes,
  messages, the Convergence).

## Phase 6 — Desktop copy to confirm

- **The desktop's copy** (`os.*` in all three message files): launcher, taskbar,
  window controls, the locked-app message, the placeholder text of every app.
  German is the source.
- **The landing shortcut for first-time visitors** ("Direkt zum Desktop", under
  the mode cards): added so a recruiter who only wants the CV never has to pass
  through the journey. Say if you would rather first-time visitors only see the
  two modes.
- **The dock** holds About, Lebenslauf, Kontakt and Assistent. Confirm the four.

## Phase 8B — the assistant became a local search (done)

**Decided: the assistant does not use Gemini or any external AI service**
(DECISIONS.md 53). It answers entirely from a local search over
`src/content/`, running in the visitor's browser. There is no key, no billing,
no rate limit and no Datenschutzerklärung disclosure to write for it.

What is left:

- **Real devices:** the phone-keyboard handling of the Terminal and the Assistant
  was checked by shrinking the emulated viewport only. Test an iPhone and an
  Android phone, and the window manager on a touchscreen laptop and an iPad.
- **Maybe:** a Terminal `ask` command that hands a question to the assistant; the
  journey teaser could open the assistant window directly (it opens the desktop).
- **Copy to confirm:** the assistant's copy (`messages/apps/assistant/`, and the
  journey teaser `assistant-journey/`) is a draft; German is the source.

## Phase 11 — Legal

- **The assistant needs no Datenschutzerklärung entry of its own.** It is a
  local search that never leaves the visitor's browser - no processor, no
  transfer, nothing to disclose (DECISIONS.md 53). Cloudflare, named below, is
  still a processor for the site itself.

- Impressum details: full address, contact, responsible person under § 5 DDG.
- Whether the employer, Stadtverwaltung Trier, may be named on a personal site,
  and in what wording.
- The Datenschutzerklärung must disclose Cloudflare as a processor (US company,
  global edge network sees visitor IP addresses). Standard contractual clauses
  and the EU-US Data Privacy Framework are the legal basis to cite.

## Phase 12 — Performance (from Phase 5.5B, DECISIONS.md 48)

- **Test the journey on a real phone and in Safari and Firefox.** Everything so
  far was measured in headless Chrome under emulation.
- **Heavy era visuals on slow phones.** On a 4x-throttled phone the journey holds
  about 43 fps but still has long tasks: each era's scrubbing restyles its whole
  visual, and some are large (the 1956 printout is ~730 spans). Options: fewer
  nodes in the printers, or narrower readers of `--era-progress`.
- **Theme switch cost.** Each crossing's midpoint restyles nearly the whole page
  (~40 ms) because theme tokens are written onto `<html>`. Removing it means
  changing the theme engine's contract - decide before Phase 9's Time Machine.

- **On a real phone, elements inside the scenes move badly during scroll**
  (reported by Ahmadreza after testing on a physical device). The full fix
  belongs here, together with the heavy-era-visual work above.

## Phase 13 — Deployment

- **BLOCKING: `kontakt@ahmadreza.de` must really receive mail before the site
  goes live** - for example through Cloudflare Email Routing to a mailbox
  Ahmadreza reads, tested with a real message from outside. The address is on
  the landing page, in About, Contact and the Terminal, and the Impressum
  (Phase 11) requires a real, working contact. **Do not deploy with an address
  that does not receive mail.**

- `ahmadreza.de` nameservers must be moved to Cloudflare. Workers custom domains
  **only** work for zones whose nameservers Cloudflare manages — unlike Pages,
  a CNAME from an external DNS provider is not enough.
- Confirm the Workers Builds GitHub connection (repo is public) and that the
  build command is `npm run build` with no output-directory setting, since
  `wrangler.jsonc` already points at `out`.

## Answered

- Domain: **ahmadreza.de**, registered and owned.
- Hosting: **Cloudflare Workers with static assets**.
- Assistant: **a local search over the site's own content, no external AI
  service** (DECISIONS.md 53).
