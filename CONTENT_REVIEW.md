# Content review list

**Status of all content on this site: PLACEHOLDER.** Every text, label, puzzle, game, section and metadata value was written by Claude as a stand-in. The real wording is written together with the owner **after the whole site is finished**. Until then only structure and features are built.

Generated from the codebase on 2026-09-23. **1078 entries.**

## How to use this file

- Order = the order a visitor experiences the site. Work through it from the first entry to the last, one entry at a time, with the owner.
- **ID**: stable, never reused. New entries get the next free number (see the Content placeholder rule in CLAUDE.md).
- **Location**: the i18n key (dot path) inside the file named in the section's "File" line, or the constant/component for content that lives in code. In code, every placeholder is marked `// CONTENT-TODO CR-xxx` (search for `CONTENT-TODO`). JSON message files cannot hold comments, so they are tracked only here, by key.
- **Type**: long text, short text, single word / label, button, puzzle / game, alt text, SEO / meta, other (machine text, terminal output, ticket consoles, addresses, names, files).
- **Languages**: which of de / en / fa carry the text. "all (machine text)" is identical in every language.
- **Status**: PLACEHOLDER until the owner approves the final wording. Change it to FINAL (with the date) only after explicit approval.
- Rows with file "(not built yet)" are for pages and assets that do not exist yet.
- Tone reminder for the final wording: German uses "Sie", Persian uses "شما", English is neutral.

## Summary by type

| Type | Entries |
|---|---|
| long text | 95 |
| short text | 217 |
| single word / label | 259 |
| button | 66 |
| puzzle / game | 353 |
| alt text | 1 |
| SEO / meta | 16 |
| other | 66 |
| legal (not placeholder; LEGAL – owner must verify) | 5 |
| **Total** | **1078** |

## 1. Global chrome: navigation and language switcher

Header, footer and switcher labels that appear on every page.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-001 | `nav.journey` | single word / label | de / en / fa | PLACEHOLDER | Short label: journey (global navigation). Now (de): «Die Reise» |
| CR-002 | `nav.desktop` | single word / label | de / en / fa | PLACEHOLDER | Short label: desktop (global navigation). Now (de): «Desktop» |
| CR-003 | `nav.about` | single word / label | de / en / fa | PLACEHOLDER | Short label: about (global navigation). Now (de): «Über mich» |
| CR-004 | `nav.projects` | single word / label | de / en / fa | PLACEHOLDER | Short label: projects (global navigation). Now (de): «Projekte» |
| CR-005 | `nav.skills` | single word / label | de / en / fa | PLACEHOLDER | Short label: skills (global navigation). Now (de): «Fähigkeiten» |
| CR-006 | `nav.contact` | single word / label | de / en / fa | PLACEHOLDER | Short label: contact (global navigation). Now (de): «Kontakt» |
| CR-007 | `nav.imprint` | single word / label | de / en / fa | PLACEHOLDER | Short label: imprint (global navigation). Now (de): «Impressum» |
| CR-008 | `nav.privacy` | single word / label | de / en / fa | PLACEHOLDER | Short label: privacy (global navigation). Now (de): «Datenschutz» |
| CR-009 | `nav.language` | single word / label | de / en / fa | PLACEHOLDER | Short label: language (global navigation). Now (de): «Sprache» |
| CR-010 | `nav.skipToDesktop` | single word / label | de / en / fa | PLACEHOLDER | Short label: skipToDesktop (global navigation). Now (de): «Zum Desktop» |
| CR-011 | `nav.skipToContent` | single word / label | de / en / fa | PLACEHOLDER | Short label: skipToContent (global navigation). Now (de): «Zum Inhalt springen» |
| CR-012 | `nav.home` | button | de / en / fa | PLACEHOLDER | Button label: home (global navigation). Now (de): «Startseite» |
| CR-013 | `languages.de` | single word / label | de / en / fa | PLACEHOLDER | Short label: de (global navigation). Now (de): «Deutsch» |
| CR-014 | `languages.en` | single word / label | de / en / fa | PLACEHOLDER | Short label: en (global navigation). Now (de): «English» |
| CR-015 | `languages.fa` | single word / label | de / en / fa | PLACEHOLDER | Short label: fa (global navigation). Now (de): «فارسی» |

## 2. Landing page (home, `/`, `/en/`, `/fa/`)

The first thing every visitor and recruiter sees. Highest priority for the final review.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-016 | `landing.eyebrow` | single word / label | de / en / fa | PLACEHOLDER | Short label: eyebrow (landing page). Now (de): «Portfolio» |
| CR-017 | `landing.firstName` | single word / label | de / en / fa | PLACEHOLDER | Short label: firstName (landing page). Now (de): «Ahmadreza» |
| CR-018 | `landing.lastName` | single word / label | de / en / fa | PLACEHOLDER | Short label: lastName (landing page). Now (de): «Taheri» |
| CR-019 | `landing.role` | short text | de / en / fa | PLACEHOLDER | Role / job description (landing page). Now (de): «Fachinformatiker für Systemintegration in Ausbil…» |
| CR-020 | `landing.factsLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: facts (landing page). Now (de): «Auf einen Blick» |
| CR-021 | `landing.facts` | long text | de / en / fa | PLACEHOLDER | Wording for "facts" (landing page). Now (de): «[{"value":"System­integration","label":"Ausbildu…» |
| CR-022 | `landing.chooseTitle` | short text | de / en / fa | PLACEHOLDER | Wording for "chooseTitle" (landing page). Now (de): «Wie möchten Sie die Reise erleben?» |
| CR-023 | `landing.chooseLead` | short text | de / en / fa | PLACEHOLDER | Wording for "chooseLead" (landing page). Now (de): «80 Jahre Computergeschichte — und dabei, wie Com…» |
| CR-024 | `landing.guidedTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: guidedTitle (landing page). Now (de): «Zuschauen» |
| CR-025 | `landing.guidedText` | short text | de / en / fa | PLACEHOLDER | Wording for "guidedText" (landing page). Now (de): «Sie scrollen, und jedes Rätsel löst sich vor Ihr…» |
| CR-026 | `landing.guidedTime` | single word / label | de / en / fa | PLACEHOLDER | Short label: guidedTime (landing page). Now (de): «etwa 2 Minuten» |
| CR-027 | `landing.interactiveTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: interactiveTitle (landing page). Now (de): «Selbst lösen» |
| CR-028 | `landing.interactiveText` | long text | de / en / fa | PLACEHOLDER | Wording for "interactiveText" (landing page). Now (de): «Sieben kleine Rätsel mit Hinweis und Lösung. Jed…» |
| CR-029 | `landing.interactiveTime` | single word / label | de / en / fa | PLACEHOLDER | Short label: interactiveTime (landing page). Now (de): «etwa 15 Minuten» |
| CR-030 | `landing.lastChosen` | single word / label | de / en / fa | PLACEHOLDER | Short label: lastChosen (landing page). Now (de): «Zuletzt gewählt» |
| CR-031 | `landing.resume` | button | de / en / fa | PLACEHOLDER | Button label: resume (landing page). Now (de): «Lebenslauf (PDF)» |
| CR-032 | `landing.resumePending` | short text | de / en / fa | PLACEHOLDER | Wording for "resumePending" (landing page). Now (de): «Lebenslauf folgt in Kürze» |
| CR-033 | `landing.portraitAlt` | alt text | de / en / fa | PLACEHOLDER | Wording for "portraitAlt" (landing page). Now (de): «Porträt von Ahmadreza Taheri» |
| CR-034 | `landing.photoPlaceholder` | single word / label | de / en / fa | PLACEHOLDER | Short label: photoPlaceholder (landing page). Now (de): «Porträt folgt» |
| CR-035 | `landing.photoDimensions` | short text | de / en / fa | PLACEHOLDER | Wording for "photoDimensions" (landing page). Now (de): «{width} × {height} px» |
| CR-036 | `landing.hint` | button | de / en / fa | PLACEHOLDER | Button label: hint (landing page). Now (de): «80 Jahre in 90 Sekunden» |
| CR-037 | `landing.journeyTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: journeyTitle (landing page). Now (de): «Die Reise» |
| CR-038 | `landing.resumeShort` | single word / label | de / en / fa | PLACEHOLDER | Short label: resumeShort (landing page). Now (de): «Lebenslauf» |
| CR-039 | `landing.email` | button | de / en / fa | PLACEHOLDER | Button label: email (landing page). Now (de): «E-Mail» |
| CR-040 | `landing.welcomeBack` | short text | de / en / fa | PLACEHOLDER | Wording for "welcomeBack" (landing page). Now (de): «Willkommen zurück.» |
| CR-041 | `landing.desktopCta` | button | de / en / fa | PLACEHOLDER | Button label: desktopCta (landing page). Now (de): «Zum Desktop» |
| CR-042 | `landing.desktopShortcutLead` | short text | de / en / fa | PLACEHOLDER | Wording for "desktopShortcutLead" (landing page). Now (de): «Nur Lebenslauf und Kontakt?» |
| CR-043 | `landing.desktopShortcut` | button | de / en / fa | PLACEHOLDER | Button label: desktopShortcut (landing page). Now (de): «Direkt zum Desktop» |

**File:** `src/content/profile.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-044 | `RESUME (résumé PDF path and availability)` | other | all | PLACEHOLDER | The real résumé PDF (content of the file itself is owed) and its filename |
| CR-045 | `PORTRAIT (portrait image)` | other | all | PLACEHOLDER | The real portrait photo; also needs its final alt text (`landing.portraitAlt`) |
| CR-046 | `EMAIL (contact address)` in `src/content/profile.ts` | other | all | PLACEHOLDER | Since 2026-09-24 the Gmail address from the Impressum, the only contact on the whole site (Landing, About, Terminal, Assistant, Contact, JSON-LD, llms.txt, legal pages). Final choice: ROADMAP OWN-09 |

## 3. Journey chrome (progress, mode switch, skip links)

Text around the eras: the Guided / Interactive switch, progress and scroll hints.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-047 | `journey.progressLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: progress (journey chrome). Now (de): «Fortschritt durch die Epochen» |
| CR-048 | `journey.eraOf` | short text | de / en / fa | PLACEHOLDER | Wording for "eraOf" (journey chrome). Now (de): «Epoche {current} von {total}» |
| CR-049 | `journey.scrollHint` | short text | de / en / fa | PLACEHOLDER | Wording for "scrollHint" (journey chrome). Now (de): «Scrollen, um zu beginnen» |
| CR-050 | `journey.truthLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: truth (journey chrome). Now (de): «Was bis heute gilt» |
| CR-051 | `mode.label` | single word / label | de / en / fa | PLACEHOLDER | Short label: label (journey chrome). Now (de): «Modus» |
| CR-052 | `mode.guided` | single word / label | de / en / fa | PLACEHOLDER | Short label: guided (journey chrome). Now (de): «Zuschauen» |
| CR-053 | `mode.interactive` | single word / label | de / en / fa | PLACEHOLDER | Short label: interactive (journey chrome). Now (de): «Selbst lösen» |

**File:** `src/messages/apps/assistant-journey/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-054 | `text` | short text | de / en / fa | PLACEHOLDER | Body text (Assistant teaser line inside the journey). Now (de): «Fragen dürfen Sie auch stellen: Der Assistent au…» |
| CR-055 | `cta` | button | de / en / fa | PLACEHOLDER | Button label: cta (Assistant teaser line inside the journey). Now (de): «Zum Assistenten» |

## 4. Puzzle chrome (shared by all seven puzzles)

Buttons, labels and gate texts every puzzle uses.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-056 | `puzzles.common.start` | button | de / en / fa | PLACEHOLDER | Button label: start (shared puzzle chrome). Now (de): «Rätsel starten» |
| CR-057 | `puzzles.common.tryMyself` | button | de / en / fa | PLACEHOLDER | Button label: tryMyself (shared puzzle chrome). Now (de): «Selbst probieren» |
| CR-058 | `puzzles.common.close` | button | de / en / fa | PLACEHOLDER | Button label: close (shared puzzle chrome). Now (de): «Schließen» |
| CR-059 | `puzzles.common.continue` | button | de / en / fa | PLACEHOLDER | Button label: continue (shared puzzle chrome). Now (de): «Weiter» |
| CR-060 | `puzzles.common.hint` | button | de / en / fa | PLACEHOLDER | Button label: hint (shared puzzle chrome). Now (de): «Hinweis» |
| CR-061 | `puzzles.common.hintLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: hint (shared puzzle chrome). Now (de): «Hinweis» |
| CR-062 | `puzzles.common.answerLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: answer (shared puzzle chrome). Now (de): «Lösung» |
| CR-063 | `puzzles.common.solved` | single word / label | de / en / fa | PLACEHOLDER | Short label: solved (shared puzzle chrome). Now (de): «Gelöst» |
| CR-064 | `puzzles.common.playAgain` | button | de / en / fa | PLACEHOLDER | Button label: playAgain (shared puzzle chrome). Now (de): «Noch einmal spielen» |
| CR-065 | `puzzles.common.watching` | single word / label | de / en / fa | PLACEHOLDER | Short label: watching (shared puzzle chrome). Now (de): «Wird vorgeführt» |
| CR-066 | `puzzles.common.dialogLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: dialog (shared puzzle chrome). Now (de): «Rätsel: {title}» |
| CR-067 | `puzzles.common.optional` | single word / label | de / en / fa | PLACEHOLDER | Short label: optional (shared puzzle chrome). Now (de): «Optional» |
| CR-068 | `puzzles.common.taskLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: task (shared puzzle chrome). Now (de): «Aufgabe» |
| CR-069 | `puzzles.common.summaryLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: summary (shared puzzle chrome). Now (de): «Was hier vorgeführt wird» |
| CR-070 | `puzzles.common.reveal` | button | de / en / fa | PLACEHOLDER | Button label: reveal (shared puzzle chrome). Now (de): «Lösung zeigen» |
| CR-071 | `puzzles.common.revealed` | single word / label | de / en / fa | PLACEHOLDER | Short label: revealed (shared puzzle chrome). Now (de): «Lösung gezeigt» |
| CR-072 | `puzzles.common.revealing` | short text | de / en / fa | PLACEHOLDER | Wording for "revealing" (shared puzzle chrome). Now (de): «Die Lösung wird vorgeführt …» |
| CR-073 | `puzzles.common.insiderLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: insider (shared puzzle chrome). Now (de): «Insider» |
| CR-074 | `puzzles.common.gateNote` | short text | de / en / fa | PLACEHOLDER | Wording for "gateNote" (shared puzzle chrome). Now (de): «Weiter geht es, sobald Sie das Rätsel lösen oder…» |
| CR-075 | `puzzles.common.solvedBy` | short text | de / en / fa | PLACEHOLDER | Wording for "solvedBy" (shared puzzle chrome). Now (de): «Bisher {count, number}-mal selbst gelöst.» |
| CR-076 | `puzzles.gate.label` | single word / label | de / en / fa | PLACEHOLDER | Short label: label (shared puzzle chrome). Now (de): «Gesperrter Abschnitt» |
| CR-077 | `puzzles.gate.locked` | short text | de / en / fa | PLACEHOLDER | Wording for "locked" (shared puzzle chrome). Now (de): «Rätsel {index} ist noch offen: {title}.» |
| CR-078 | `puzzles.gate.explain` | short text | de / en / fa | PLACEHOLDER | Wording for "explain" (shared puzzle chrome). Now (de): «Lösen Sie es, oder lassen Sie sich die Lösung ze…» |
| CR-079 | `puzzles.gate.open` | button | de / en / fa | PLACEHOLDER | Button label: open (shared puzzle chrome). Now (de): «Rätsel öffnen» |
| CR-080 | `puzzles.gate.reveal` | button | de / en / fa | PLACEHOLDER | Button label: reveal (shared puzzle chrome). Now (de): «Lösung zeigen» |

## 5. Era 1: 1946, ENIAC and punch cards

Truth: text is numbers.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-081 | `eras.eniac.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (era 1 scene). Now (de): «ENIAC und Lochkarten» |
| CR-082 | `eras.eniac.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (era 1 scene). Now (de): «Text ist Zahlen. Jedes Zeichen ist ein Muster au…» |
| CR-083 | `eras.eniac.visual.stats` | long text | de / en / fa | PLACEHOLDER | Wording for "stats" (era 1 scene). Now (de): «[{"value":"27","label":"Tonnen"},{"value":"17.46…» |
| CR-084 | `eras.eniac.visual.body` | long text | de / en / fa | PLACEHOLDER | Narrative body text (era 1 scene). Now (de): «Programmieren hieß, die Maschine von Hand neu zu…» |
| CR-085 | `eras.eniac.visual.panelLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: panel (era 1 scene). Now (de): «Anzeigetafel mit Röhrenlampen» |
| CR-086 | `eras.eniac.visual.cardLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: card (era 1 scene). Now (de): «IBM-Lochkarte, 80 Spalten» |
| CR-087 | `eras.eniac.visual.cardCaption` | single word / label | de / en / fa | PLACEHOLDER | Short label: cardCaption (era 1 scene). Now (de): «Gestanzt: {text}» |
| CR-088 | `eras.eniac.insider` | long text | de / en / fa | PLACEHOLDER | Insider detail (a real, checkable fact for this era) (era 1 scene). Now (de): «Wer mit Lochkarten programmierte, zog mit dem Fi…» |
| CR-089 | `puzzles.eniac.title` | puzzle / game | de / en / fa | PLACEHOLDER | Title (era 1 puzzle). Now (de): «Der Bug» |
| CR-090 | `puzzles.eniac.invitation` | puzzle / game | de / en / fa | PLACEHOLDER | Short invitation to start (era 1 puzzle). Now (de): «Etwas stimmt nicht: Auf der Karte sitzt eine Mot…» |
| CR-091 | `puzzles.eniac.task` | puzzle / game | de / en / fa | PLACEHOLDER | Task description (era 1 puzzle). Now (de): «Die Karte soll AHMADREZA ergeben, doch eine Spal…» |
| CR-092 | `puzzles.eniac.hint` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (era 1 puzzle). Now (de): «Spalte 5 zeigt E statt D. Vergleichen Sie ihre L…» |
| CR-093 | `puzzles.eniac.answer` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle solution explanation (era 1 puzzle). Now (de): «In Spalte 5 das Loch in Zeile 5 entfernen und Ze…» |
| CR-094 | `puzzles.eniac.success` | puzzle / game | de / en / fa | PLACEHOLDER | Text shown when solved (era 1 puzzle). Now (de): «AHMADREZA – nichts als Löcher und keine Löcher.» |
| CR-095 | `puzzles.eniac.skip` | button | de / en / fa | PLACEHOLDER | Button label: skip (era 1 puzzle). Now (de): «Karte überspringen» |
| CR-096 | `puzzles.eniac.tableTitle` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "tableTitle" (era 1 puzzle). Now (de): «IBM-Lochkartencode» |
| CR-097 | `puzzles.eniac.table` | long text | de / en / fa | PLACEHOLDER | Wording for "table" (era 1 puzzle). Now (de): «["A–I: Zone 12 + Ziffer 1–9","J–R: Zone 11 + Zif…» |
| CR-098 | `puzzles.eniac.readsLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: reads (era 1 puzzle). Now (de): «Die Karte liest» |
| CR-099 | `puzzles.eniac.holeLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: hole (era 1 puzzle). Now (de): «Spalte {column}, Zeile {row}: {state}» |
| CR-100 | `puzzles.eniac.punched` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "punched" (era 1 puzzle). Now (de): «gestanzt» |
| CR-101 | `puzzles.eniac.blank` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "blank" (era 1 puzzle). Now (de): «nicht gestanzt» |
| CR-102 | `puzzles.eniac.bugNote` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "bugNote" (era 1 puzzle). Now (de): «Und der Bug? Die berühmte Motte gab es wirklich,…» |
| CR-103 | `puzzles.eniac.nameLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: name (era 1 puzzle). Now (de): «Der Name, gebaut aus den korrigierten Spalten» |
| CR-104 | `puzzles.eniac.explain` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "explain" (era 1 puzzle). Now (de): «Jede Spalte ist nur eine Zahl: eine Zone und ein…» |
| CR-105 | `puzzles.eniac.mothHere` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "mothHere" (era 1 puzzle). Now (de): «Eine Motte sitzt auf Spalte 5.» |
| CR-106 | `puzzles.eniac.mothGone` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "mothGone" (era 1 puzzle). Now (de): «Die Motte ist fortgeflogen.» |
| CR-107 | `puzzles.eniac.deckLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: deck (era 1 puzzle). Now (de): «Der Kartenstapel, von der Kante gesehen» |
| CR-108 | `puzzles.eniac.deckCard` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "deckCard" (era 1 puzzle). Now (de): «Karte an Position {position}» |
| CR-109 | `puzzles.eniac.deckPicked` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "deckPicked" (era 1 puzzle). Now (de): «Karte aufgenommen. Wählen Sie die Karte, mit der…» |
| CR-110 | `puzzles.eniac.deckSorted` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "deckSorted" (era 1 puzzle). Now (de): «Der Stapel ist wieder in Ordnung: Die Linie läuf…» |

**File:** `src/content/eras.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-111 | `eras.ts `teaches` for eniac (English concept summary, reserved for SEO copy)` | short text | en (structure) | PLACEHOLDER | English one-line "what this era teaches" used for SEO copy later (era 1) |

**File:** `src/components/puzzles/PunchCardPuzzle.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-112 | `WORD (the word punched in the puzzle)` | puzzle / game | all (machine text) | PLACEHOLDER | The word built from the punch-card bits (currently the first name) |

**File:** `src/components/journey/eras/EraEniac.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-113 | `CARD_TEXT (text on the scene's punch card)` | short text | all (machine text) | PLACEHOLDER | Text punched on the card in the era scene |

## 6. Era 2: 1956, mainframes and batch processing

Truth: a computer hates waiting; scheduling is why operating systems exist.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-114 | `eras.batch.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (era 2 scene). Now (de): «Großrechner und Stapel­verarbeitung» |
| CR-115 | `eras.batch.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (era 2 scene). Now (de): «Ein Computer hasst Warten. Genau dafür gibt es B…» |
| CR-116 | `eras.batch.visual.paperLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: paper (era 2 scene). Now (de): «Endlospapier aus dem Drucker» |
| CR-117 | `eras.batch.visual.printed` | long text | de / en / fa | PLACEHOLDER | Wording for "printed" (era 2 scene). Now (de): «["GM-NAA I/O ..... 1956","","Davor lief genau ei…» |
| CR-118 | `eras.batch.insider` | long text | de / en / fa | PLACEHOLDER | Insider detail (a real, checkable fact for this era) (era 2 scene). Now (de): «Die IBM 704 hatte Sense Switches: Kippschalter a…» |
| CR-119 | `puzzles.batch.title` | puzzle / game | de / en / fa | PLACEHOLDER | Title (era 2 puzzle). Now (de): «Die Warteschlange» |
| CR-120 | `puzzles.batch.invitation` | puzzle / game | de / en / fa | PLACEHOLDER | Short invitation to start (era 2 puzzle). Now (de): «Vier Jobs warten auf die Maschine. In welcher Re…» |
| CR-121 | `puzzles.batch.task` | puzzle / game | de / en / fa | PLACEHOLDER | Task description (era 2 puzzle). Now (de): «Ordnen Sie die Jobs so, dass die gesamte Warteze…» |
| CR-122 | `puzzles.batch.hint` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (era 2 puzzle). Now (de): «Jede Minute am Anfang der Schlange warten alle a…» |
| CR-123 | `puzzles.batch.answer` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle solution explanation (era 2 puzzle). Now (de): «Bericht (2), Inventur (5), Rechnungen (15), Lohn…» |
| CR-124 | `puzzles.batch.success` | puzzle / game | de / en / fa | PLACEHOLDER | Text shown when solved (era 2 puzzle). Now (de): «31 Minuten statt 115: der kürzeste Job zuerst. G…» |
| CR-125 | `puzzles.batch.skip` | button | de / en / fa | PLACEHOLDER | Button label: skip (era 2 puzzle). Now (de): «Warteschlange überspringen» |
| CR-126 | `puzzles.batch.jobs.payroll` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "payroll" (era 2 puzzle). Now (de): «Lohnabrechnung» |
| CR-127 | `puzzles.batch.jobs.inventory` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "inventory" (era 2 puzzle). Now (de): «Inventur» |
| CR-128 | `puzzles.batch.jobs.invoices` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "invoices" (era 2 puzzle). Now (de): «Rechnungen» |
| CR-129 | `puzzles.batch.jobs.report` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "report" (era 2 puzzle). Now (de): «Bericht» |
| CR-130 | `puzzles.batch.runs` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "runs" (era 2 puzzle). Now (de): «läuft {minutes} Min.» |
| CR-131 | `puzzles.batch.waits` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "waits" (era 2 puzzle). Now (de): «wartet {minutes} Min.» |
| CR-132 | `puzzles.batch.total` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "total" (era 2 puzzle). Now (de): «Gesamtwartezeit: {minutes} Min.» |
| CR-133 | `puzzles.batch.moveUp` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "moveUp" (era 2 puzzle). Now (de): «{job} nach vorn» |
| CR-134 | `puzzles.batch.moveDown` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "moveDown" (era 2 puzzle). Now (de): «{job} nach hinten» |
| CR-135 | `puzzles.batch.listingLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: listing (era 2 puzzle). Now (de): «Auszug aus dem FORTRAN-Programm» |
| CR-136 | `puzzles.batch.switchesLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: switches (era 2 puzzle). Now (de): «Sense Switches an der Konsole» |
| CR-137 | `puzzles.batch.switchLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: switch (era 2 puzzle). Now (de): «Sense Switch {which}» |

**File:** `src/content/eras.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-138 | `eras.ts `teaches` for batch (English concept summary, reserved for SEO copy)` | short text | en (structure) | PLACEHOLDER | English one-line "what this era teaches" used for SEO copy later (era 2) |

**File:** `src/components/puzzles/SchedulingPuzzle.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-139 | `JOBS (the four batch jobs and their run times)` | puzzle / game | all (machine text) | PLACEHOLDER | Job names (labels are in messages) and durations; the optimal wait time depends on them |
| CR-140 | `LISTING (FORTRAN listing shown on the teletype)` | puzzle / game | all (machine text) | PLACEHOLDER | Sense-switch FORTRAN listing (insider detail) |

## 7. Era 3: 1971, UNIX

Truth: a filesystem is a tree, and every file has a path.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-141 | `eras.unix.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (era 3 scene). Now (de): «UNIX» |
| CR-142 | `eras.unix.description` | long text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (era 3 scene). Now (de): «Ein Dateisystem ist ein Baum. Jede Datei hat ein…» |
| CR-143 | `eras.unix.visual.screenLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: screen (era 3 scene). Now (de): «Bildschirm eines Terminals» |
| CR-144 | `eras.unix.visual.banner` | single word / label | de / en / fa | PLACEHOLDER | Short label: banner (era 3 scene). Now (de): «UNIX Time-Sharing System» |
| CR-145 | `eras.unix.visual.loginLine` | single word / label | de / en / fa | PLACEHOLDER | Short label: loginLine (era 3 scene). Now (de): «login: ahmadreza» |
| CR-146 | `eras.unix.visual.lines` | long text | de / en / fa | PLACEHOLDER | Wording for "lines" (era 3 scene). Now (de): «["Alles ist eine Datei, und alle","Dateien haeng…» |
| CR-147 | `eras.unix.visual.prompt` | single word / label | de / en / fa | PLACEHOLDER | Short label: prompt (era 3 scene). Now (de): «$» |
| CR-148 | `eras.unix.insider` | long text | de / en / fa | PLACEHOLDER | Insider detail (a real, checkable fact for this era) (era 3 scene). Now (de): «Bis zur Sixth Edition hieß der Befehl zum Verzei…» |
| CR-149 | `puzzles.unix.title` | puzzle / game | de / en / fa | PLACEHOLDER | Title (era 3 puzzle). Now (de): «Die versteckte Datei» |
| CR-150 | `puzzles.unix.invitation` | puzzle / game | de / en / fa | PLACEHOLDER | Short invitation to start (era 3 puzzle). Now (de): «Irgendwo unter /home liegt eine versteckte Datei…» |
| CR-151 | `puzzles.unix.task` | puzzle / game | de / en / fa | PLACEHOLDER | Task description (era 3 puzzle). Now (de): «Finden Sie die versteckte Datei und lesen Sie si…» |
| CR-152 | `puzzles.unix.hint` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (era 3 puzzle). Now (de): «Wechseln Sie mit cd /home/ahmadreza ins Heimatve…» |
| CR-153 | `puzzles.unix.answer` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle solution explanation (era 3 puzzle). Now (de): «cd /home/ahmadreza/projects, dann ls -a, dann ca…» |
| CR-154 | `puzzles.unix.success` | puzzle / game | de / en / fa | PLACEHOLDER | Text shown when solved (era 3 puzzle). Now (de): «Gefunden: /home/ahmadreza/projects/.secret. Ein …» |
| CR-155 | `puzzles.unix.skip` | button | de / en / fa | PLACEHOLDER | Button label: skip (era 3 puzzle). Now (de): «Terminal überspringen» |
| CR-156 | `puzzles.unix.inputLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: input (era 3 puzzle). Now (de): «Befehl eingeben» |
| CR-157 | `puzzles.unix.help` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "help" (era 3 puzzle). Now (de): «Befehle: pwd ls ls -a cd <pfad> cat <datei> clea…» |
| CR-158 | `puzzles.unix.files.motd` | puzzle / game | de / en / fa | PLACEHOLDER | Message of the day shown when the terminal opens (era 3 puzzle). Now (de): «Willkommen. Tippen Sie help. Wer die Sixth Editi…» |
| CR-159 | `puzzles.unix.files.notes` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "notes" (era 3 puzzle). Now (de): «Das Interessante liegt in projects.» |
| CR-160 | `puzzles.unix.files.network` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "network" (era 3 puzzle). Now (de): «192.168.1.0/24 -- mein Heimnetz.» |
| CR-161 | `puzzles.unix.files.secret` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "secret" (era 3 puzzle). Now (de): «Sie haben den Pfad gefunden.» |
| CR-162 | `puzzles.unix.errors.noDir` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: noDir (era 3 puzzle). Now (de): «cd: {path}: No such file or directory» |
| CR-163 | `puzzles.unix.errors.notDir` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: notDir (era 3 puzzle). Now (de): «cd: {path}: Not a directory» |
| CR-164 | `puzzles.unix.errors.noFile` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: noFile (era 3 puzzle). Now (de): «cat: {path}: No such file or directory» |
| CR-165 | `puzzles.unix.errors.isDir` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: isDir (era 3 puzzle). Now (de): «cat: {path}: Is a directory» |
| CR-166 | `puzzles.unix.errors.lsNoFile` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: lsNoFile (era 3 puzzle). Now (de): «ls: {path}: No such file or directory» |
| CR-167 | `puzzles.unix.errors.unknown` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: unknown (era 3 puzzle). Now (de): «{command}: command not found» |

**File:** `src/content/eras.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-168 | `eras.ts `teaches` for unix (English concept summary, reserved for SEO copy)` | short text | en (structure) | PLACEHOLDER | English one-line "what this era teaches" used for SEO copy later (era 3) |

**File:** `src/components/puzzles/shell-filesystem.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-169 | `ROOT, HOME, SECRET_PATH (the simulated filesystem: directory and file names)` | puzzle / game | all (machine text) | PLACEHOLDER | Names of directories and files, and the hidden file to find; file contents are the `puzzles.unix.*` messages |

**File:** `src/components/puzzles/ShellPuzzle.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-170 | `Guided-mode script (commands typed automatically)` | puzzle / game | all (machine text) | PLACEHOLDER | Commands the guided pointer types: ls, cd, chdir, ls -a, cat .secret |

## 8. Era 4: 1981, IBM PC and MS-DOS

Truth: memory is finite.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-171 | `eras.dos.name` | short text | de / en / fa | PLACEHOLDER | Display name (era 4 scene). Now (de): «IBM PC und MS-DOS» |
| CR-172 | `eras.dos.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (era 4 scene). Now (de): «Speicher ist endlich. Diese Grenze bestimmt, was…» |
| CR-173 | `eras.dos.visual.screenLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: screen (era 4 scene). Now (de): «Bildschirm eines IBM PC» |
| CR-174 | `eras.dos.visual.biosLine` | single word / label | de / en / fa | PLACEHOLDER | Short label: biosLine (era 4 scene). Now (de): «IBM Personal Computer» |
| CR-175 | `eras.dos.visual.memoryOk` | single word / label | de / en / fa | PLACEHOLDER | Short label: memoryOk (era 4 scene). Now (de): «640K OK» |
| CR-176 | `eras.dos.visual.beepLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: beep (era 4 scene). Now (de): «BEEP» |
| CR-177 | `eras.dos.visual.prompt` | single word / label | de / en / fa | PLACEHOLDER | Short label: prompt (era 4 scene). Now (de): «C:\>» |
| CR-178 | `eras.dos.visual.dirCommand` | single word / label | de / en / fa | PLACEHOLDER | Short label: dirCommand (era 4 scene). Now (de): «DIR» |
| CR-179 | `eras.dos.visual.dirVolume` | short text | de / en / fa | PLACEHOLDER | Wording for "dirVolume" (era 4 scene). Now (de): «Datentraeger in Laufwerk C: ist AMONEL» |
| CR-180 | `eras.dos.visual.dirRows` | other | de / en / fa | PLACEHOLDER | Wording for "dirRows" (era 4 scene). Now (de): «[{"name":"CV","ext":"PDF","size":"212.992","date…» |
| CR-181 | `eras.dos.visual.dirFooter` | short text | de / en / fa | PLACEHOLDER | Wording for "dirFooter" (era 4 scene). Now (de): «8 Datei(en) 942.080 Bytes» |
| CR-182 | `eras.dos.visual.body` | long text | de / en / fa | PLACEHOLDER | Narrative body text (era 4 scene). Now (de): «Computer kommen auf die Schreibtische. Ein Progr…» |
| CR-183 | `eras.dos.insider` | long text | de / en / fa | PLACEHOLDER | Insider detail (a real, checkable fact for this era) (era 4 scene). Now (de): «F3 holte in MS-DOS die zuletzt getippte Befehlsz…» |
| CR-184 | `puzzles.dos.title` | puzzle / game | de / en / fa | PLACEHOLDER | Title (era 4 puzzle). Now (de): «640 Kilobyte» |
| CR-185 | `puzzles.dos.invitation` | puzzle / game | de / en / fa | PLACEHOLDER | Short invitation to start (era 4 puzzle). Now (de): «Die Textverarbeitung startet nicht: zu wenig Spe…» |
| CR-186 | `puzzles.dos.task` | puzzle / game | de / en / fa | PLACEHOLDER | Task description (era 4 puzzle). Now (de): «Ein PC mit MS-DOS, einige Jahre nach 1981 und vo…» |
| CR-187 | `puzzles.dos.hint` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (era 4 puzzle). Now (de): «Es fehlen 88 K. Welche Treiber brauchen Sie zum …» |
| CR-188 | `puzzles.dos.answer` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle solution explanation (era 4 puzzle). Now (de): «Sound-Treiber und CD-ROM-Treiber entladen, den N…» |
| CR-189 | `puzzles.dos.success` | puzzle / game | de / en / fa | PLACEHOLDER | Text shown when solved (era 4 puzzle). Now (de): «Die Textverarbeitung läuft, und der Drucker ist …» |
| CR-190 | `puzzles.dos.skip` | button | de / en / fa | PLACEHOLDER | Button label: skip (era 4 puzzle). Now (de): «Speicher überspringen» |
| CR-191 | `puzzles.dos.drivers.dos` | puzzle / game | de / en / fa | PLACEHOLDER | Driver name: dos (era 4 puzzle). Now (de): «MS-DOS» |
| CR-192 | `puzzles.dos.drivers.mouse` | puzzle / game | de / en / fa | PLACEHOLDER | Driver name: mouse (era 4 puzzle). Now (de): «Maustreiber» |
| CR-193 | `puzzles.dos.drivers.cdrom` | puzzle / game | de / en / fa | PLACEHOLDER | Driver name: cdrom (era 4 puzzle). Now (de): «CD-ROM-Treiber» |
| CR-194 | `puzzles.dos.drivers.network` | puzzle / game | de / en / fa | PLACEHOLDER | Driver name: network (era 4 puzzle). Now (de): «Netzwerktreiber» |
| CR-195 | `puzzles.dos.drivers.sound` | puzzle / game | de / en / fa | PLACEHOLDER | Driver name: sound (era 4 puzzle). Now (de): «Sound-Treiber» |
| CR-196 | `puzzles.dos.drivers.screensaver` | puzzle / game | de / en / fa | PLACEHOLDER | Driver name: screensaver (era 4 puzzle). Now (de): «Bildschirmschoner» |
| CR-197 | `puzzles.dos.fixed` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "fixed" (era 4 puzzle). Now (de): «fest» |
| CR-198 | `puzzles.dos.free` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "free" (era 4 puzzle). Now (de): «Frei: {kb} K» |
| CR-199 | `puzzles.dos.needs` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "needs" (era 4 puzzle). Now (de): «{command} braucht {kb} K» |
| CR-200 | `puzzles.dos.run` | button | de / en / fa | PLACEHOLDER | Button label: run (era 4 puzzle). Now (de): «Textverarbeitung starten» |
| CR-201 | `puzzles.dos.tooBig` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "tooBig" (era 4 puzzle). Now (de): «Program too big to fit in memory» |
| CR-202 | `puzzles.dos.noNetwork` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "noNetwork" (era 4 puzzle). Now (de): «Die Textverarbeitung läuft, aber ohne Netzwerktr…» |
| CR-203 | `puzzles.dos.toggleLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: toggle (era 4 puzzle). Now (de): «{driver}, {kb} K» |
| CR-204 | `puzzles.dos.memoryLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: memory (era 4 puzzle). Now (de): «Arbeitsspeicher: {used} K von 640 K belegt» |
| CR-205 | `puzzles.dos.badCommand` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "badCommand" (era 4 puzzle). Now (de): «Bad command or file name» |
| CR-206 | `puzzles.dos.promptLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: prompt (era 4 puzzle). Now (de): «DOS-Befehl eingeben, zum Beispiel {command}» |
| CR-207 | `puzzles.dos.f3Label` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: f3 (era 4 puzzle). Now (de): «F3: letzte Befehlszeile zurückholen» |

**File:** `src/content/eras.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-208 | `eras.ts `teaches` for dos (English concept summary, reserved for SEO copy)` | short text | en (structure) | PLACEHOLDER | English one-line "what this era teaches" used for SEO copy later (era 4) |

**File:** `src/components/puzzles/MemoryPuzzle.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-209 | `PROGRAM (command the visitor types)` | puzzle / game | all (machine text) | PLACEHOLDER | Program name typed at the DOS prompt (WP) |
| CR-210 | `DRIVERS (driver ids and their kilobyte sizes)` | puzzle / game | all (machine text) | PLACEHOLDER | Memory sizes decide the puzzle solution; names are in messages |
| CR-211 | `LISTING (DIR output in the puzzle)` | puzzle / game | all (machine text) | PLACEHOLDER | File names shown by DIR |

**File:** `src/components/journey/EraBridge.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-212 | `DOS_PROMPT (`C:\>`)` | other | all (machine text) | PLACEHOLDER | DOS prompt shown in the 1971 to 1981 crossing |

**File:** `src/components/journey/eras/EraDos.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-213 | `ASCII_YEAR (the year 1981 as block art)` | other | all (machine text) | PLACEHOLDER | Block-letter year on the boot screen; changes only if the year changes |

## 9. Era 5: 1984, Macintosh

Truth: pointing is easier than remembering.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-214 | `eras.macintosh.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (era 5 scene). Now (de): «Macintosh» |
| CR-215 | `eras.macintosh.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (era 5 scene). Now (de): «Zeigen ist leichter als Erinnern. Auf dieser Ide…» |
| CR-216 | `eras.macintosh.visual.body` | long text | de / en / fa | PLACEHOLDER | Narrative body text (era 5 scene). Now (de): «1984, der Apple Macintosh. Der erste Massencompu…» |
| CR-217 | `eras.macintosh.visual.screenLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: screen (era 5 scene). Now (de): «Bildschirm eines Macintosh mit Menüleiste, Fenst…» |
| CR-218 | `eras.macintosh.visual.menu` | long text | de / en / fa | PLACEHOLDER | Wording for "menu" (era 5 scene). Now (de): «["Ablage","Bearbeiten","Spezial"]» |
| CR-219 | `eras.macintosh.visual.menuItems` | long text | de / en / fa | PLACEHOLDER | Wording for "menuItems" (era 5 scene). Now (de): «["Neu","Öffnen","Schließen"]» |
| CR-220 | `eras.macintosh.visual.windowTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: windowTitle (era 5 scene). Now (de): «Portfolio» |
| CR-221 | `eras.macintosh.visual.icons` | long text | de / en / fa | PLACEHOLDER | Wording for "icons" (era 5 scene). Now (de): «["Vita","Projekte","Netzwerk"]» |
| CR-222 | `eras.macintosh.visual.desktopIcons` | long text | de / en / fa | PLACEHOLDER | Wording for "desktopIcons" (era 5 scene). Now (de): «["System","Papierkorb"]» |
| CR-223 | `eras.macintosh.visual.pointerCaption` | short text | de / en / fa | PLACEHOLDER | Wording for "pointerCaption" (era 5 scene). Now (de): «Zum ersten Mal: zeigen statt tippen.» |
| CR-224 | `eras.macintosh.insider` | long text | de / en / fa | PLACEHOLDER | Insider detail (a real, checkable fact for this era) (era 5 scene). Now (de): «Das Zeichen ⌘ auf der Befehlstaste stammt von Su…» |
| CR-225 | `puzzles.macintosh.title` | puzzle / game | de / en / fa | PLACEHOLDER | Title (era 5 puzzle). Now (de): «Aufräumen» |
| CR-226 | `puzzles.macintosh.invitation` | puzzle / game | de / en / fa | PLACEHOLDER | Short invitation to start (era 5 puzzle). Now (de): «Zum ersten Mal ganz ohne Befehl: Räumen Sie den …» |
| CR-227 | `puzzles.macintosh.task` | puzzle / game | de / en / fa | PLACEHOLDER | Task description (era 5 puzzle). Now (de): «Ziehen Sie die Vita in den Ordner Bewerbung und …» |
| CR-228 | `puzzles.macintosh.hint` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (era 5 puzzle). Now (de): «Halten Sie ein Symbol gedrückt, ziehen Sie es au…» |
| CR-229 | `puzzles.macintosh.answer` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle solution explanation (era 5 puzzle). Now (de): «Vita auf Bewerbung ziehen, Alt auf den Papierkor…» |
| CR-230 | `puzzles.macintosh.success` | puzzle / game | de / en / fa | PLACEHOLDER | Text shown when solved (era 5 puzzle). Now (de): «Aufgeräumt, ohne einen einzigen Befehl. Zeigen i…» |
| CR-231 | `puzzles.macintosh.skip` | button | de / en / fa | PLACEHOLDER | Button label: skip (era 5 puzzle). Now (de): «Schreibtisch überspringen» |
| CR-232 | `puzzles.macintosh.window` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "window" (era 5 puzzle). Now (de): «Schreibtisch» |
| CR-233 | `puzzles.macintosh.items.vita` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "vita" (era 5 puzzle). Now (de): «Vita» |
| CR-234 | `puzzles.macintosh.items.old` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "old" (era 5 puzzle). Now (de): «Alt» |
| CR-235 | `puzzles.macintosh.items.folder` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "folder" (era 5 puzzle). Now (de): «Bewerbung» |
| CR-236 | `puzzles.macintosh.items.trash` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "trash" (era 5 puzzle). Now (de): «Papierkorb» |
| CR-237 | `puzzles.macintosh.pickUp` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "pickUp" (era 5 puzzle). Now (de): «{item} aufnehmen» |
| CR-238 | `puzzles.macintosh.dropOn` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "dropOn" (era 5 puzzle). Now (de): «{item} auf {target} ablegen» |
| CR-239 | `puzzles.macintosh.carrying` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "carrying" (era 5 puzzle). Now (de): «Sie halten {item}. Wählen Sie ein Ziel.» |
| CR-240 | `puzzles.macintosh.cancel` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "cancel" (era 5 puzzle). Now (de): «Ablegen abbrechen» |
| CR-241 | `puzzles.macintosh.moved` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "moved" (era 5 puzzle). Now (de): «{item} liegt jetzt in {target}.» |
| CR-242 | `puzzles.macintosh.wrongTrash` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "wrongTrash" (era 5 puzzle). Now (de): «Die Vita brauchen Sie noch. Nicht in den Papierk…» |
| CR-243 | `puzzles.macintosh.wrongFolder` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "wrongFolder" (era 5 puzzle). Now (de): «Die alte Datei gehört nicht zur Bewerbung.» |
| CR-244 | `puzzles.macintosh.keyboardHelp` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "keyboardHelp" (era 5 puzzle). Now (de): «Tastatur: Leertaste nimmt auf, Pfeiltasten wähle…» |

**File:** `src/content/eras.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-245 | `eras.ts `teaches` for macintosh (English concept summary, reserved for SEO copy)` | short text | en (structure) | PLACEHOLDER | English one-line "what this era teaches" used for SEO copy later (era 5) |

**File:** `src/components/puzzles/DragDropPuzzle.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-246 | `ITEMS, TARGETS, BELONGS (what is dragged where)` | puzzle / game | all (machine text) | PLACEHOLDER | Which item belongs in which target (labels are in messages) |

## 10. Era 6: 1995, Windows 95 and dial-up

Truth: a network needs addresses.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-247 | `eras.win95.name` | short text | de / en / fa | PLACEHOLDER | Display name (era 6 scene). Now (de): «Windows 95 und Einwahl» |
| CR-248 | `eras.win95.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (era 6 scene). Now (de): «Ein Netzwerk braucht Adressen. Ohne sie findet e…» |
| CR-249 | `eras.win95.visual.body` | long text | de / en / fa | PLACEHOLDER | Narrative body text (era 6 scene). Now (de): «1995, Windows 95 und das Modem. Taskleiste und S…» |
| CR-250 | `eras.win95.visual.screenLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: screen (era 6 scene). Now (de): «Windows-95-Desktop, der sich per Modem mit dem I…» |
| CR-251 | `eras.win95.visual.infoTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: infoTitle (era 6 scene). Now (de): «Info.txt - Editor» |
| CR-252 | `eras.win95.visual.start` | button | de / en / fa | PLACEHOLDER | Button label: start (era 6 scene). Now (de): «Start» |
| CR-253 | `eras.win95.visual.banner` | single word / label | de / en / fa | PLACEHOLDER | Short label: banner (era 6 scene). Now (de): «Amonel OS 95» |
| CR-254 | `eras.win95.visual.startItems` | long text | de / en / fa | PLACEHOLDER | Wording for "startItems" (era 6 scene). Now (de): «["Programme","Dokumente","Einstellungen","DFÜ-Ne…» |
| CR-255 | `eras.win95.visual.clock` | single word / label | de / en / fa | PLACEHOLDER | Short label: clock (era 6 scene). Now (de): «10:32» |
| CR-256 | `eras.win95.visual.dialTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: dialTitle (era 6 scene). Now (de): «Verbindung mit Internet» |
| CR-257 | `eras.win95.visual.dialSteps` | long text | de / en / fa | PLACEHOLDER | Wording for "dialSteps" (era 6 scene). Now (de): «["Modem wird initialisiert...","Wählt 0651 19411…» |
| CR-258 | `eras.win95.visual.hops` | long text | de / en / fa | PLACEHOLDER | Wording for "hops" (era 6 scene). Now (de): «["Dieser PC","Modem","Telefonnetz","Provider","I…» |
| CR-259 | `eras.win95.visual.nodeCaption` | short text | de / en / fa | PLACEHOLDER | Wording for "nodeCaption" (era 6 scene). Now (de): «Aus einer einzelnen Maschine wird ein Knoten im …» |
| CR-260 | `eras.win95.visual.trayLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: tray (era 6 scene). Now (de): «Netzwerkstatus» |
| CR-261 | `eras.win95.visual.browserTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: browserTitle (era 6 scene). Now (de): «Browser - Willkommen» |
| CR-262 | `eras.win95.visual.address` | single word / label | de / en / fa | PLACEHOLDER | Short label: address (era 6 scene). Now (de): «http://www.ahmadreza.de/» |
| CR-263 | `eras.win95.visual.pageHeading` | short text | de / en / fa | PLACEHOLDER | Wording for "pageHeading" (era 6 scene). Now (de): «Willkommen auf meiner Homepage!» |
| CR-264 | `eras.win95.visual.pageLines` | long text | de / en / fa | PLACEHOLDER | Wording for "pageLines" (era 6 scene). Now (de): «["Diese Seite ist im Aufbau.","Links: Lebenslauf…» |
| CR-265 | `eras.win95.visual.counter` | single word / label | de / en / fa | PLACEHOLDER | Short label: counter (era 6 scene). Now (de): «Besucher: 000042» |
| CR-266 | `eras.win95.visual.status` | single word / label | de / en / fa | PLACEHOLDER | Short label: status (era 6 scene). Now (de): «Dokument: Übermittelt» |
| CR-267 | `eras.win95.insider` | long text | de / en / fa | PLACEHOLDER | Insider detail (a real, checkable fact for this era) (era 6 scene). Now (de): «Wer unter Windows 95 seine IP-Adresse sehen woll…» |
| CR-268 | `puzzles.win95.title` | puzzle / game | de / en / fa | PLACEHOLDER | Title (era 6 puzzle). Now (de): «Keine Verbindung» |
| CR-269 | `puzzles.win95.invitation` | puzzle / game | de / en / fa | PLACEHOLDER | Short invitation to start (era 6 puzzle). Now (de): «Das Modem ist verbunden, aber das Netz antwortet…» |
| CR-270 | `puzzles.win95.task` | puzzle / game | de / en / fa | PLACEHOLDER | Task description (era 6 puzzle). Now (de): «Stellen Sie IP-Adresse, Subnetzmaske und Gateway…» |
| CR-271 | `puzzles.win95.hint` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (era 6 puzzle). Now (de): «Das Gateway muss in Ihrem eigenen Subnetz liegen…» |
| CR-272 | `puzzles.win95.answer` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle solution explanation (era 6 puzzle). Now (de): «IP-Adresse 192.168.1.50, Subnetzmaske 255.255.25…» |
| CR-273 | `puzzles.win95.success` | puzzle / game | de / en / fa | PLACEHOLDER | Text shown when solved (era 6 puzzle). Now (de): «Verbunden. Ein Netzwerk braucht Adressen: Ihre e…» |
| CR-274 | `puzzles.win95.skip` | button | de / en / fa | PLACEHOLDER | Button label: skip (era 6 puzzle). Now (de): «Verbindung überspringen» |
| CR-275 | `puzzles.win95.dialogTitle` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "dialogTitle" (era 6 puzzle). Now (de): «TCP/IP-Eigenschaften» |
| CR-276 | `puzzles.win95.ip` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "ip" (era 6 puzzle). Now (de): «IP-Adresse» |
| CR-277 | `puzzles.win95.mask` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "mask" (era 6 puzzle). Now (de): «Subnetzmaske» |
| CR-278 | `puzzles.win95.gateway` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "gateway" (era 6 puzzle). Now (de): «Standard-Gateway» |
| CR-279 | `puzzles.win95.connect` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "connect" (era 6 puzzle). Now (de): «Verbinden» |
| CR-280 | `puzzles.win95.errors.invalidAddress` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: invalidAddress (era 6 puzzle). Now (de): «„{value}“ ist keine gültige IPv4-Adresse.» |
| CR-281 | `puzzles.win95.errors.invalidMask` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: invalidMask (era 6 puzzle). Now (de): «„{value}“ ist keine gültige Subnetzmaske: Die Ei…» |
| CR-282 | `puzzles.win95.errors.networkAddress` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: networkAddress (era 6 puzzle). Now (de): «{ip} ist die Netzadresse. Die darf kein Gerät be…» |
| CR-283 | `puzzles.win95.errors.broadcastAddress` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: broadcastAddress (era 6 puzzle). Now (de): «{ip} ist die Broadcast-Adresse. Die darf kein Ge…» |
| CR-284 | `puzzles.win95.errors.gatewayOutside` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: gatewayOutside (era 6 puzzle). Now (de): «Das Gateway {gateway} liegt nicht in Ihrem Subne…» |
| CR-285 | `puzzles.win95.errors.sameAsGateway` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: sameAsGateway (era 6 puzzle). Now (de): «PC und Gateway haben dieselbe Adresse {ip}.» |
| CR-286 | `puzzles.win95.errors.conflictRouter` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: conflictRouter (era 6 puzzle). Now (de): «{ip} gehört schon dem Router.» |
| CR-287 | `puzzles.win95.errors.conflictPrinter` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: conflictPrinter (era 6 puzzle). Now (de): «{ip} gehört schon dem Drucker.» |
| CR-288 | `puzzles.win95.errors.routerCannotReply` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: routerCannotReply (era 6 puzzle). Now (de): «Der Router sitzt im Netz 192.168.1.0/24. Er kann…» |
| CR-289 | `puzzles.win95.errors.noRouter` | puzzle / game | de / en / fa | PLACEHOLDER | Error message: noRouter (era 6 puzzle). Now (de): «Unter {gateway} antwortet kein Router. Der Route…» |
| CR-290 | `puzzles.win95.runMenu` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "runMenu" (era 6 puzzle). Now (de): «Start › Ausführen …» |
| CR-291 | `puzzles.win95.runOpen` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "runOpen" (era 6 puzzle). Now (de): «Öffnen:» |
| CR-292 | `puzzles.win95.runOk` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "runOk" (era 6 puzzle). Now (de): «OK» |
| CR-293 | `puzzles.win95.runNotFound` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "runNotFound" (era 6 puzzle). Now (de): «Die Datei {name} (oder eine ihrer Komponenten) w…» |
| CR-294 | `puzzles.win95.ipcfgTitle` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "ipcfgTitle" (era 6 puzzle). Now (de): «IP-Konfiguration» |
| CR-295 | `puzzles.win95.ipcfgAdapter` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "ipcfgAdapter" (era 6 puzzle). Now (de): «Adapteradresse» |

**File:** `src/content/eras.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-296 | `eras.ts `teaches` for win95 (English concept summary, reserved for SEO copy)` | short text | en (structure) | PLACEHOLDER | English one-line "what this era teaches" used for SEO copy later (era 6) |

**File:** `src/components/puzzles/ipv4.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-297 | `ROUTER, PRINTER (addresses in the puzzle)` | puzzle / game | all (machine text) | PLACEHOLDER | Router and printer addresses that define the correct IP/mask/gateway answer |

**File:** `src/components/puzzles/SubnetPuzzle.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-298 | `Guided-mode script (winipcfg, 192.168.1.50)` | puzzle / game | all (machine text) | PLACEHOLDER | Values the guided pointer types into the dialog |

## 11. Era 7: Today, cloud, containers, AI

Truth: programs run isolated, in many places at once.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-299 | `eras.cloud.name` | short text | de / en / fa | PLACEHOLDER | Display name (era 7 scene). Now (de): «Cloud, Container und KI» |
| CR-300 | `eras.cloud.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (era 7 scene). Now (de): «Programme laufen voneinander isoliert, an vielen…» |
| CR-301 | `eras.cloud.visual.body` | long text | de / en / fa | PLACEHOLDER | Narrative body text (era 7 scene). Now (de): «Heute. Der Computer ist keine einzelne Maschine …» |
| CR-302 | `eras.cloud.visual.dashboardLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: dashboard (era 7 scene). Now (de): «Dashboard einer verteilten Anwendung mit Contain…» |
| CR-303 | `eras.cloud.visual.containersTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: containersTitle (era 7 scene). Now (de): «Container» |
| CR-304 | `eras.cloud.visual.containers` | other | de / en / fa | PLACEHOLDER | Wording for "containers" (era 7 scene). Now (de): «[{"name":"portfolio-web","replicas":"3/3"},{"nam…» |
| CR-305 | `eras.cloud.visual.running` | single word / label | de / en / fa | PLACEHOLDER | Short label: running (era 7 scene). Now (de): «Running» |
| CR-306 | `eras.cloud.visual.pending` | single word / label | de / en / fa | PLACEHOLDER | Short label: pending (era 7 scene). Now (de): «Pending» |
| CR-307 | `eras.cloud.visual.deployTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: deployTitle (era 7 scene). Now (de): «Deployment» |
| CR-308 | `eras.cloud.visual.deploySteps` | other | de / en / fa | PLACEHOLDER | Wording for "deploySteps" (era 7 scene). Now (de): «["Build","Test","Deploy"]» |
| CR-309 | `eras.cloud.visual.deployRef` | single word / label | de / en / fa | PLACEHOLDER | Short label: deployRef (era 7 scene). Now (de): «main @ ea736fc» |
| CR-310 | `eras.cloud.visual.deployDone` | short text | de / en / fa | PLACEHOLDER | Wording for "deployDone" (era 7 scene). Now (de): «Live in 4 Regionen» |
| CR-311 | `eras.cloud.visual.metricsTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: metricsTitle (era 7 scene). Now (de): «Anfragen pro Sekunde» |
| CR-312 | `eras.cloud.visual.metricLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: metric (era 7 scene). Now (de): «p95 Latenz» |
| CR-313 | `eras.cloud.visual.metricValue` | single word / label | de / en / fa | PLACEHOLDER | Short label: metricValue (era 7 scene). Now (de): «42 ms» |
| CR-314 | `eras.cloud.visual.regionsTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: regionsTitle (era 7 scene). Now (de): «Regionen» |
| CR-315 | `eras.cloud.visual.regions` | other | de / en / fa | PLACEHOLDER | Wording for "regions" (era 7 scene). Now (de): «["Frankfurt","Amsterdam","Virginia","Singapur"]» |
| CR-316 | `eras.cloud.visual.terminalTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: terminalTitle (era 7 scene). Now (de): «Terminal» |
| CR-317 | `eras.cloud.visual.terminal` | other | de / en / fa | PLACEHOLDER | Wording for "terminal" (era 7 scene). Now (de): «["$ kubectl get pods -A","portfolio-web-7d9f Run…» |
| CR-318 | `eras.cloud.visual.promptLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: prompt (era 7 scene). Now (de): «Fragen Sie diese Website» |
| CR-319 | `eras.cloud.visual.prompt` | short text | de / en / fa | PLACEHOLDER | Wording for "prompt" (era 7 scene). Now (de): «Was ist ein Container?» |
| CR-320 | `eras.cloud.visual.response` | long text | de / en / fa | PLACEHOLDER | Wording for "response" (era 7 scene). Now (de): «["Ein Container bündelt ein Programm mit allem, …» |
| CR-321 | `eras.cloud.yearLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: year (era 7 scene). Now (de): «Heute» |
| CR-322 | `eras.cloud.insider` | long text | de / en / fa | PLACEHOLDER | Insider detail (a real, checkable fact for this era) (era 7 scene). Now (de): «Ports unter 1024 darf unter Linux nur root öffne…» |
| CR-323 | `puzzles.cloud.title` | puzzle / game | de / en / fa | PLACEHOLDER | Title (era 7 puzzle). Now (de): «Nicht erreichbar» |
| CR-324 | `puzzles.cloud.invitation` | puzzle / game | de / en / fa | PLACEHOLDER | Short invitation to start (era 7 puzzle). Now (de): «portfolio-web läuft, aber niemand erreicht es. F…» |
| CR-325 | `puzzles.cloud.task` | puzzle / game | de / en / fa | PLACEHOLDER | Task description (era 7 puzzle). Now (de): «Der Dienst lauscht auf TCP-Port 443. Die Firewal…» |
| CR-326 | `puzzles.cloud.hint` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (era 7 puzzle). Now (de): «Welche Regel trifft ein Paket für Port 443 als e…» |
| CR-327 | `puzzles.cloud.answer` | puzzle / game | de / en / fa | PLACEHOLDER | Puzzle solution explanation (era 7 puzzle). Now (de): «Regel 2 sperrt Port 443, bevor Regel 3 überhaupt…» |
| CR-328 | `puzzles.cloud.success` | puzzle / game | de / en / fa | PLACEHOLDER | Text shown when solved (era 7 puzzle). Now (de): «Erreichbar, und alles andere bleibt zu. Jeder Di…» |
| CR-329 | `puzzles.cloud.skip` | button | de / en / fa | PLACEHOLDER | Button label: skip (era 7 puzzle). Now (de): «Firewall überspringen» |
| CR-330 | `puzzles.cloud.columns.rule` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "rule" (era 7 puzzle). Now (de): «#» |
| CR-331 | `puzzles.cloud.columns.action` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "action" (era 7 puzzle). Now (de): «Aktion» |
| CR-332 | `puzzles.cloud.columns.protocol` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "protocol" (era 7 puzzle). Now (de): «Protokoll» |
| CR-333 | `puzzles.cloud.columns.port` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "port" (era 7 puzzle). Now (de): «Port» |
| CR-334 | `puzzles.cloud.columns.source` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "source" (era 7 puzzle). Now (de): «Quelle» |
| CR-335 | `puzzles.cloud.any` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "any" (era 7 puzzle). Now (de): «alle» |
| CR-336 | `puzzles.cloud.test` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "test" (era 7 puzzle). Now (de): «Verbindung testen» |
| CR-337 | `puzzles.cloud.probe` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "probe" (era 7 puzzle). Now (de): «Test: TCP-Port 443 von 203.0.113.7» |
| CR-338 | `puzzles.cloud.blocked` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "blocked" (era 7 puzzle). Now (de): «Blockiert von Regel {rule}.» |
| CR-339 | `puzzles.cloud.wideOpen` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "wideOpen" (era 7 puzzle). Now (de): «Erreichbar, aber jetzt ist jeder Port für das ga…» |
| CR-340 | `puzzles.cloud.actionLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: action (era 7 puzzle). Now (de): «Regel {rule}: Aktion» |
| CR-341 | `puzzles.cloud.portLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: port (era 7 puzzle). Now (de): «Regel {rule}: Port» |
| CR-342 | `puzzles.cloud.keywords.allow` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "allow" (era 7 puzzle). Now (de): «ALLOW» |
| CR-343 | `puzzles.cloud.keywords.deny` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "deny" (era 7 puzzle). Now (de): «DENY» |
| CR-344 | `puzzles.cloud.keywords.tcp` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "tcp" (era 7 puzzle). Now (de): «tcp» |

**File:** `src/content/eras.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-345 | `eras.ts `teaches` for cloud (English concept summary, reserved for SEO copy)` | short text | en (structure) | PLACEHOLDER | English one-line "what this era teaches" used for SEO copy later (era 7) |

**File:** `src/components/puzzles/FirewallPuzzle.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-346 | `PORT_CHOICES and PROBE (ports and the probe request)` | puzzle / game | all (machine text) | PLACEHOLDER | The port options and the blocked probe (tcp 443 from 203.0.113.7) |

## 12. Convergence (end of the journey, Act 2)

The build-log sequence in which the seven eras compile into Amonel OS.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-347 | `convergence.title` | short text | de / en / fa | PLACEHOLDER | Title (convergence). Now (de): «Die Konvergenz: achtzig Jahre werden zu Amonel O…» |
| CR-348 | `convergence.intro` | short text | de / en / fa | PLACEHOLDER | Introductory text (convergence). Now (de): «Kompiliere 80 Jahre Computergeschichte...» |
| CR-349 | `convergence.components` | other | de / en / fa | PLACEHOLDER | Wording for "components" (convergence). Now (de): «[{"label":"Lochkarten","status":"OK"},{"label":"…» |
| CR-350 | `convergence.osName` | single word / label | de / en / fa | PLACEHOLDER | Short label: osName (convergence). Now (de): «Amonel OS» |
| CR-351 | `convergence.welcome` | short text | de / en / fa | PLACEHOLDER | Wording for "welcome" (convergence). Now (de): «Willkommen bei Amonel OS» |
| CR-352 | `convergence.desktopLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: desktop (convergence). Now (de): «Leerer Amonel-OS-Desktop» |

## 13. Desktop shell: launcher, taskbar, windows, app names

Amonel OS chrome and the title and one-line description of every app.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-353 | `os.brand` | single word / label | de / en / fa | PLACEHOLDER | Short label: brand (desktop shell). Now (de): «Amonel OS» |
| CR-354 | `os.pageName` | single word / label | de / en / fa | PLACEHOLDER | Short label: pageName (desktop shell). Now (de): «Desktop» |
| CR-355 | `os.heading` | short text | de / en / fa | PLACEHOLDER | Wording for "heading" (desktop shell). Now (de): «Amonel OS – der Desktop von Ahmadreza Taheri» |
| CR-356 | `os.noscript` | short text | de / en / fa | PLACEHOLDER | Wording for "noscript" (desktop shell). Now (de): «Der Desktop braucht JavaScript. Alles Wichtige f…» |
| CR-357 | `os.home` | button | de / en / fa | PLACEHOLDER | Button label: home (desktop shell). Now (de): «Zur Startseite» |
| CR-358 | `os.replay` | button | de / en / fa | PLACEHOLDER | Button label: replay (desktop shell). Now (de): «Reise erneut ansehen» |
| CR-359 | `os.desktopLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: desktop (desktop shell). Now (de): «Amonel-OS-Desktop» |
| CR-360 | `os.icons` | short text | de / en / fa | PLACEHOLDER | Wording for "icons" (desktop shell). Now (de): «Programme auf dem Desktop» |
| CR-361 | `os.launcher.open` | button | de / en / fa | PLACEHOLDER | Button label: open (desktop shell). Now (de): «Programme» |
| CR-362 | `os.launcher.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Alle Programme» |
| CR-363 | `os.launcher.base` | single word / label | de / en / fa | PLACEHOLDER | Short label: base (desktop shell). Now (de): «Programme» |
| CR-364 | `os.launcher.bonus` | single word / label | de / en / fa | PLACEHOLDER | Short label: bonus (desktop shell). Now (de): «Freischaltbar» |
| CR-365 | `os.launcher.shortcutsTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: shortcutsTitle (desktop shell). Now (de): «Tastenkürzel» |
| CR-366 | `os.launcher.shortcuts` | other | de / en / fa | PLACEHOLDER | Wording for "shortcuts" (desktop shell). Now (de): «["Alt+Umschalt+Pfeil rechts oder links: nächstes…» |
| CR-367 | `os.taskbar.label` | single word / label | de / en / fa | PLACEHOLDER | Short label: label (desktop shell). Now (de): «Taskleiste» |
| CR-368 | `os.taskbar.windows` | single word / label | de / en / fa | PLACEHOLDER | Short label: windows (desktop shell). Now (de): «Geöffnete Fenster» |
| CR-369 | `os.taskbar.clock` | single word / label | de / en / fa | PLACEHOLDER | Short label: clock (desktop shell). Now (de): «Uhrzeit» |
| CR-370 | `os.taskbar.resume` | button | de / en / fa | PLACEHOLDER | Button label: resume (desktop shell). Now (de): «Lebenslauf herunterladen» |
| CR-371 | `os.taskbar.resumePending` | short text | de / en / fa | PLACEHOLDER | Wording for "resumePending" (desktop shell). Now (de): «Lebenslauf folgt in Kürze» |
| CR-372 | `os.window.minimize` | button | de / en / fa | PLACEHOLDER | Button label: minimize (desktop shell). Now (de): «Minimieren» |
| CR-373 | `os.window.maximize` | button | de / en / fa | PLACEHOLDER | Button label: maximize (desktop shell). Now (de): «Maximieren» |
| CR-374 | `os.window.restore` | button | de / en / fa | PLACEHOLDER | Button label: restore (desktop shell). Now (de): «Wiederherstellen» |
| CR-375 | `os.window.close` | button | de / en / fa | PLACEHOLDER | Button label: close (desktop shell). Now (de): «Schließen» |
| CR-376 | `os.window.grip` | single word / label | de / en / fa | PLACEHOLDER | Short label: grip (desktop shell). Now (de): «Fenster {title}» |
| CR-377 | `os.window.gripHint` | short text | de / en / fa | PLACEHOLDER | Wording for "gripHint" (desktop shell). Now (de): «Pfeiltasten verschieben, Umschalt+Pfeiltasten än…» |
| CR-378 | `os.window.loading` | single word / label | de / en / fa | PLACEHOLDER | Short label: loading (desktop shell). Now (de): «Wird geladen …» |
| CR-379 | `os.locked.label` | single word / label | de / en / fa | PLACEHOLDER | Short label: label (desktop shell). Now (de): «Gesperrt» |
| CR-380 | `os.locked.message` | long text | de / en / fa | PLACEHOLDER | Message text (desktop shell). Now (de): «{year, select, today {Das Rätsel von heute schal…» |
| CR-381 | `os.locked.orFinish` | short text | de / en / fa | PLACEHOLDER | Wording for "orFinish" (desktop shell). Now (de): «Am Ende der Reise sind alle Programme frei.» |
| CR-382 | `os.locked.dismiss` | button | de / en / fa | PLACEHOLDER | Button label: dismiss (desktop shell). Now (de): «Hinweis schließen» |
| CR-383 | `os.locked.play` | short text | de / en / fa | PLACEHOLDER | Wording for "play" (desktop shell). Now (de): «{year, select, today {Zum Rätsel von heute} othe…» |
| CR-384 | `os.locked.iconLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: icon (desktop shell). Now (de): «{app} (gesperrt)» |
| CR-385 | `os.mobile.back` | button | de / en / fa | PLACEHOLDER | Button label: back (desktop shell). Now (de): «Zurück» |
| CR-386 | `os.mobile.home` | button | de / en / fa | PLACEHOLDER | Button label: home (desktop shell). Now (de): «Startbildschirm» |
| CR-387 | `os.mobile.dock` | single word / label | de / en / fa | PLACEHOLDER | Short label: dock (desktop shell). Now (de): «Dock» |
| CR-388 | `os.mobile.apps` | single word / label | de / en / fa | PLACEHOLDER | Short label: apps (desktop shell). Now (de): «Programme» |
| CR-389 | `os.soon` | short text | de / en / fa | PLACEHOLDER | Wording for "soon" (desktop shell). Now (de): «Diese Anwendung entsteht gerade.» |
| CR-390 | `os.bonusBody` | long text | de / en / fa | PLACEHOLDER | Wording for "bonusBody" (desktop shell). Now (de): «{year, select, today {Freigeschaltet mit dem Rät…» |
| CR-391 | `os.apps.about.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Über mich» |
| CR-392 | `os.apps.terminal.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Terminal» |
| CR-393 | `os.apps.tickets.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Tickets» |
| CR-394 | `os.apps.traceroute.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Traceroute» |
| CR-395 | `os.apps.assistant.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Assistent» |
| CR-396 | `os.apps.contact.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Kontakt» |
| CR-397 | `os.apps.contact.body` | short text | de / en / fa | PLACEHOLDER | Narrative body text (desktop shell). Now (de): «So erreichen Sie Ahmadreza.» |
| CR-398 | `os.apps.timeline.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Zeitleiste» |
| CR-399 | `os.apps.timeline.body` | short text | de / en / fa | PLACEHOLDER | Narrative body text (desktop shell). Now (de): «Die Stationen seines Werdegangs auf einer Zeitle…» |
| CR-400 | `os.apps.cv.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Lebenslauf» |
| CR-401 | `os.apps.cv.body` | short text | de / en / fa | PLACEHOLDER | Narrative body text (desktop shell). Now (de): «Der Lebenslauf als PDF zum Herunterladen.» |
| CR-402 | `os.apps.quiz.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Computer-Quiz» |
| CR-403 | `os.apps.binary.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Binär & Morse» |
| CR-404 | `os.apps.binary.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (desktop shell). Now (de): «Text in Bits, Bytes, Hex und Morsezeichen verwan…» |
| CR-405 | `os.apps.scheduler.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Stapelplaner» |
| CR-406 | `os.apps.scheduler.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (desktop shell). Now (de): «Aufträge der Reihe nach abarbeiten, wie ein Groß…» |
| CR-407 | `os.apps.filesystem.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Dateibaum» |
| CR-408 | `os.apps.filesystem.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (desktop shell). Now (de): «Ein Dateisystem als Baum erkunden.» |
| CR-409 | `os.apps.snake.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Snake» |
| CR-410 | `os.apps.snake.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (desktop shell). Now (de): «Das Spiel mit der Schlange auf einem begrenzten …» |
| CR-411 | `os.apps.paint.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Pixelmaler» |
| CR-412 | `os.apps.paint.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (desktop shell). Now (de): «Pixelbilder malen, mit Farbpaletten von 1 Bit bi…» |
| CR-413 | `os.apps.network-tools.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Netzwerk-Werkzeuge» |
| CR-414 | `os.apps.network-tools.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (desktop shell). Now (de): «Adressen, Masken und Wege im Netz nachvollziehen…» |
| CR-415 | `os.apps.time-machine.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (desktop shell). Now (de): «Zeitmaschine» |
| CR-416 | `os.apps.time-machine.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (desktop shell). Now (de): «Den Desktop in das Aussehen einer früheren Epoch…» |

## 14. Desktop app: Contact and CV (placeholder apps)

Small apps whose real content is still owed.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-417 | `os.cv.download` | button | de / en / fa | PLACEHOLDER | Button label: download (Contact / CV app). Now (de): «Lebenslauf herunterladen (PDF)» |
| CR-418 | `os.cv.pending` | short text | de / en / fa | PLACEHOLDER | Wording for "pending" (Contact / CV app). Now (de): «Der Lebenslauf folgt in Kürze.» |
| CR-419 | `os.contact.email` | button | de / en / fa | REMOVED 2026-09-23 (the Contact app has its own copy, section 28) | Button label: email (Contact / CV app). Now (de): «E-Mail schreiben» |
| CR-420 | `os.contact.pending` | short text | de / en / fa | REMOVED 2026-09-23 (the Contact app has its own copy, section 28) | Wording for "pending" (Contact / CV app). Now (de): «Die E-Mail-Adresse wird in Kürze ergänzt.» |

## 15. Desktop app: About (Über mich)

The recruiter's main page: life story, career path, skills, languages.

**File:** `src/messages/apps/about/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-421 | `eyebrow` | single word / label | de / en / fa | PLACEHOLDER | Short label: eyebrow (About app). Now (de): «Über mich» |
| CR-422 | `name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (About app). Now (de): «Ahmadreza Taheri» |
| CR-423 | `role` | short text | de / en / fa | PLACEHOLDER | Role / job description (About app). Now (de): «Fachinformatiker für Systemintegration in Ausbil…» |
| CR-424 | `intro` | long text | de / en / fa | PLACEHOLDER | Introductory text (About app). Now (de): «["Ich bin Ahmadreza Taheri und arbeite in der IT…» |
| CR-425 | `actions.label` | single word / label | de / en / fa | PLACEHOLDER | Short label: label (About app). Now (de): «Kontakt und Lebenslauf» |
| CR-426 | `actions.resume` | button | de / en / fa | PLACEHOLDER | Button label: resume (About app). Now (de): «Lebenslauf herunterladen (PDF)» |
| CR-427 | `actions.resumePending` | short text | de / en / fa | PLACEHOLDER | Wording for "resumePending" (About app). Now (de): «Lebenslauf folgt in Kürze» |
| CR-428 | `actions.email` | button | de / en / fa | PLACEHOLDER | Button label: email (About app). Now (de): «E-Mail schreiben» |
| CR-429 | `path.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (About app). Now (de): «Werdegang» |
| CR-430 | `path.since` | single word / label | de / en / fa | PLACEHOLDER | Short label: since (About app). Now (de): «seit <date></date>» |
| CR-431 | `path.range` | single word / label | de / en / fa | PLACEHOLDER | Short label: range (About app). Now (de): «<start></start> – <end></end>» |
| CR-432 | `path.present` | single word / label | de / en / fa | PLACEHOLDER | Short label: present (About app). Now (de): «heute» |
| CR-433 | `path.stations.apprenticeship.title` | short text | de / en / fa | PLACEHOLDER | Title (About app). Now (de): «Ausbildung zum Fachinformatiker für Systemintegr…» |
| CR-434 | `path.stations.apprenticeship.place` | single word / label | de / en / fa | PLACEHOLDER | Short label: place (About app). Now (de): «Trier» (employer removed 2026-09-24, LEG-08) |
| CR-435 | `path.stations.apprenticeship.text` | long text | de / en / fa | PLACEHOLDER | Body text (About app). Now (de): «Eine duale Ausbildung, im Betrieb und in der Ber…» |
| CR-436 | `path.stations.earlier.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (About app). Now (de): «Frühere Stationen» |
| CR-437 | `path.stations.earlier.place` | single word / label | de / en / fa | PLACEHOLDER | Short label: place (About app). Now (de): «» |
| CR-438 | `path.stations.earlier.text` | short text | de / en / fa | PLACEHOLDER | Body text (About app). Now (de): «Schule, Studium und bisherige Tätigkeiten werden…» |
| CR-439 | `now.title` | short text | de / en / fa | PLACEHOLDER | Title (About app). Now (de): «Was ich heute mache» |
| CR-440 | `now.text` | long text | de / en / fa | PLACEHOLDER | Body text (About app). Now (de): «["Im Betrieb und in der Berufsschule lerne ich, …» |
| CR-441 | `skills.title` | short text | de / en / fa | PLACEHOLDER | Title (About app). Now (de): «Themen, mit denen ich arbeite» |
| CR-442 | `skills.areas.network.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (About app). Now (de): «Netzwerke» |
| CR-443 | `skills.areas.network.skills.tcpip` | single word / label | de / en / fa | PLACEHOLDER | Skill line: tcpip (About app). Now (de): «TCP/IP und IPv4-Adressen» |
| CR-444 | `skills.areas.network.skills.subnetting` | short text | de / en / fa | PLACEHOLDER | Skill line: subnetting (About app). Now (de): «Subnetze berechnen und planen» |
| CR-445 | `skills.areas.network.skills.dnsDhcp` | single word / label | de / en / fa | PLACEHOLDER | Skill line: dnsDhcp (About app). Now (de): «DNS und DHCP» |
| CR-446 | `skills.areas.network.skills.firewall` | single word / label | de / en / fa | PLACEHOLDER | Skill line: firewall (About app). Now (de): «Ports und Firewall-Regeln» |
| CR-447 | `skills.areas.network.skills.wifi` | single word / label | de / en / fa | PLACEHOLDER | Skill line: wifi (About app). Now (de): «WLAN-Grundlagen» |
| CR-448 | `skills.areas.systems.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (About app). Now (de): «Systeme» |
| CR-449 | `skills.areas.systems.skills.linux` | short text | de / en / fa | PLACEHOLDER | Skill line: linux (About app). Now (de): «Linux: Dateisystem, Rechte, Dienste» |
| CR-450 | `skills.areas.systems.skills.shell` | short text | de / en / fa | PLACEHOLDER | Skill line: shell (About app). Now (de): «Arbeiten in der Shell» |
| CR-451 | `skills.areas.systems.skills.windows` | short text | de / en / fa | PLACEHOLDER | Skill line: windows (About app). Now (de): «Windows-Clients einrichten und pflegen» |
| CR-452 | `skills.areas.systems.skills.accounts` | short text | de / en / fa | PLACEHOLDER | Skill line: accounts (About app). Now (de): «Benutzer, Gruppen und Berechtigungen» |
| CR-453 | `skills.areas.support.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (About app). Now (de): «Support» |
| CR-454 | `skills.areas.support.skills.troubleshooting` | single word / label | de / en / fa | PLACEHOLDER | Skill line: troubleshooting (About app). Now (de): «Strukturierte Fehlersuche» |
| CR-455 | `skills.areas.support.skills.tickets` | single word / label | de / en / fa | PLACEHOLDER | Skill line: tickets (About app). Now (de): «Arbeiten mit Tickets» |
| CR-456 | `skills.areas.support.skills.documentation` | single word / label | de / en / fa | PLACEHOLDER | Skill line: documentation (About app). Now (de): «Nachvollziehbare Dokumentation» |
| CR-457 | `skills.areas.support.skills.hardware` | short text | de / en / fa | PLACEHOLDER | Skill line: hardware (About app). Now (de): «Hardware prüfen und tauschen» |
| CR-458 | `languages.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (About app). Now (de): «Sprachen» |
| CR-459 | `languages.names.de` | single word / label | de / en / fa | PLACEHOLDER | Language name: de (About app). Now (de): «Deutsch» |
| CR-460 | `languages.names.en` | single word / label | de / en / fa | PLACEHOLDER | Language name: en (About app). Now (de): «Englisch» |
| CR-461 | `languages.names.fa` | single word / label | de / en / fa | PLACEHOLDER | Language name: fa (About app). Now (de): «Persisch» |
| CR-462 | `placeholder` | single word / label | de / en / fa | PLACEHOLDER | Short label: placeholder (About app). Now (de): «Angabe folgt» |
| CR-463 | `placeholderDate` | single word / label | de / en / fa | PLACEHOLDER | Short label: placeholderDate (About app). Now (de): «Datum folgt» |

**File:** `src/messages/apps/stats/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-464 | `title` | short text | de / en / fa | PLACEHOLDER | Title (About app: "this site in numbers"). Now (de): «Diese Website in Zahlen» |
| CR-465 | `journeyCompleted` | short text | de / en / fa | PLACEHOLDER | Wording for "journeyCompleted" (About app: "this site in numbers"). Now (de): «Reise bis zum Desktop verfolgt» |
| CR-466 | `modeGuided` | single word / label | de / en / fa | PLACEHOLDER | Short label: modeGuided (About app: "this site in numbers"). Now (de): «Modus „Zuschauen“ gewählt» |
| CR-467 | `modeInteractive` | short text | de / en / fa | PLACEHOLDER | Wording for "modeInteractive" (About app: "this site in numbers"). Now (de): «Modus „Selbst lösen“ gewählt» |
| CR-468 | `topApps` | short text | de / en / fa | PLACEHOLDER | Wording for "topApps" (About app: "this site in numbers"). Now (de): «Am häufigsten geöffnete Programme» |
| CR-469 | `note` | long text | de / en / fa | PLACEHOLDER | Explanatory note (About app: "this site in numbers"). Now (de): «Anonym gezählt: nur wie oft etwas geschehen ist,…» |

**File:** `src/content/about.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-470 | `careerStations (dates, current flags, placeholder flag)` | other | de / en / fa | PLACEHOLDER | Real career stations with real start and end dates; the second station is an explicit placeholder |
| CR-471 | `skillAreas (skill ids per area)` | other | de / en / fa | PLACEHOLDER | Final list of skill areas and skills (ids here, wording in `about` messages) |
| CR-472 | `languages (levels are null)` | other | de / en / fa | PLACEHOLDER | Language levels (e.g. CEFR) the owner confirms |

## 16. Desktop app: Terminal

Terminal copy, help texts, simulated filesystem and portfolio commands.

**File:** `src/messages/apps/terminal/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-473 | `outputLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: output (Terminal app). Now (de): «Terminalausgabe» |
| CR-474 | `inputLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: input (Terminal app). Now (de): «Befehl eingeben» |
| CR-475 | `inputHint` | short text | de / en / fa | PLACEHOLDER | Wording for "inputHint" (Terminal app). Now (de): «Eingabetaste führt den Befehl aus, Tab ergänzt, …» |
| CR-476 | `tryLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: try (Terminal app). Now (de): «Zum Ausprobieren:» |
| CR-477 | `motd` | other | de / en / fa | PLACEHOLDER | Message of the day shown when the terminal opens (Terminal app). Now (de): «Willkommen auf Amonel OS. Tippen Sie help für al…» |
| CR-478 | `help.portfolio` | other | de / en / fa | PLACEHOLDER | Wording for "portfolio" (Terminal app). Now (de): «Über Ahmadreza» |
| CR-479 | `help.shell` | other | de / en / fa | PLACEHOLDER | Wording for "shell" (Terminal app). Now (de): «Shell» |
| CR-480 | `help.commands.about` | other | de / en / fa | PLACEHOLDER | One-line help for command: about (Terminal app). Now (de): «wer Ahmadreza ist» |
| CR-481 | `help.commands.skills` | other | de / en / fa | PLACEHOLDER | One-line help for command: skills (Terminal app). Now (de): «womit er arbeitet» |
| CR-482 | `help.commands.projects` | other | de / en / fa | PLACEHOLDER | One-line help for command: projects (Terminal app). Now (de): «woran er arbeitet» |
| CR-483 | `help.commands.cv` | other | de / en / fa | PLACEHOLDER | One-line help for command: cv (Terminal app). Now (de): «der Lebenslauf» |
| CR-484 | `help.commands.contact` | other | de / en / fa | PLACEHOLDER | One-line help for command: contact (Terminal app). Now (de): «so erreichen Sie ihn» |
| CR-485 | `help.commands.ls` | other | de / en / fa | PLACEHOLDER | One-line help for command: ls (Terminal app). Now (de): «Dateien auflisten, ls -a zeigt auch versteckte» |
| CR-486 | `help.commands.cd` | other | de / en / fa | PLACEHOLDER | One-line help for command: cd (Terminal app). Now (de): «Verzeichnis wechseln, cd .. geht eine Ebene hoch» |
| CR-487 | `help.commands.cat` | other | de / en / fa | PLACEHOLDER | One-line help for command: cat (Terminal app). Now (de): «Datei anzeigen» |
| CR-488 | `help.commands.pwd` | other | de / en / fa | PLACEHOLDER | One-line help for command: pwd (Terminal app). Now (de): «aktuelles Verzeichnis» |
| CR-489 | `help.commands.whoami` | other | de / en / fa | PLACEHOLDER | One-line help for command: whoami (Terminal app). Now (de): «wer Sie hier sind» |
| CR-490 | `help.commands.echo` | other | de / en / fa | PLACEHOLDER | One-line help for command: echo (Terminal app). Now (de): «Text ausgeben» |
| CR-491 | `help.commands.history` | other | de / en / fa | PLACEHOLDER | One-line help for command: history (Terminal app). Now (de): «bisherige Befehle» |
| CR-492 | `help.commands.uname` | other | de / en / fa | PLACEHOLDER | One-line help for command: uname (Terminal app). Now (de): «Name des Systems» |
| CR-493 | `help.commands.clear` | button | de / en / fa | PLACEHOLDER | One-line help for command: clear (Terminal app). Now (de): «Bildschirm leeren» |
| CR-494 | `help.commands.exit` | other | de / en / fa | PLACEHOLDER | One-line help for command: exit (Terminal app). Now (de): «Terminal schließen» |
| CR-495 | `help.keys` | other | de / en / fa | PLACEHOLDER | Wording for "keys" (Terminal app). Now (de): «Tab ergänzt Befehle und Pfade, Pfeil hoch und ru…» |
| CR-496 | `projects.more` | short text | de / en / fa | PLACEHOLDER | Wording for "more" (Terminal app). Now (de): «Weitere Projekte folgen.» |
| CR-497 | `projects.site` | single word / label | de / en / fa | PLACEHOLDER | Short label: site (Terminal app). Now (de): «Website» |
| CR-498 | `projects.source` | single word / label | de / en / fa | PLACEHOLDER | Short label: source (Terminal app). Now (de): «Quellcode» |
| CR-499 | `projects.stack` | single word / label | de / en / fa | PLACEHOLDER | Short label: stack (Terminal app). Now (de): «Technik» |
| CR-500 | `projects.items.amonel.name` | short text | de / en / fa | PLACEHOLDER | Display name (Terminal app). Now (de): «Amonel – diese Website» |
| CR-501 | `projects.items.amonel.text` | long text | de / en / fa | PLACEHOLDER | Body text (Terminal app). Now (de): «80 Jahre Computergeschichte in sieben Epochen, j…» |
| CR-502 | `cv.text` | short text | de / en / fa | PLACEHOLDER | Body text (Terminal app). Now (de): «Der Lebenslauf als PDF:» |
| CR-503 | `cv.download` | button | de / en / fa | PLACEHOLDER | Button label: download (Terminal app). Now (de): «Lebenslauf herunterladen» |
| CR-504 | `cv.pending` | short text | de / en / fa | PLACEHOLDER | Wording for "pending" (Terminal app). Now (de): «Der Lebenslauf folgt in Kürze. Bis dahin: Werdeg…» |
| CR-505 | `contact.text` | short text | de / en / fa | PLACEHOLDER | Body text (Terminal app). Now (de): «Am schnellsten erreichen Sie Ahmadreza per E-Mai…» |

**File:** `src/components/apps/terminal/shell.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-506 | `USER, HOST (prompt guest@amonel)` | other | all (machine text) | PLACEHOLDER | Prompt user and host name |
| CR-507 | `ROOT filesystem (os-release, hostname, .bash_history, file names)` | other | all (machine text) | PLACEHOLDER | File names and machine text inside the simulated home directory, including the fake shell history |
| CR-508 | `HIDDEN_COMMANDS (easter eggs, empty until Phase 9D-3)` | other | de / en / fa | PLACEHOLDER | Future easter-egg commands and their outputs |

**File:** `src/components/apps/terminal/TerminalApp.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-509 | `STARTERS and HELP_SHELL (command suggestions)` | button | all (machine text) | PLACEHOLDER | Which commands are suggested as starter chips and listed in help |

**File:** `src/content/projects.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-510 | `projects (Amonel: URL, source repository, stack)` | other | de / en / fa | PLACEHOLDER | The real project list: which projects, their links and stacks (descriptions are in `terminal` messages `projects.items.*`) |

## 17. Desktop app: Ticket System (Helpdesk)

Fictional helpdesk cases. Messages hold the prose; `src/content/tickets.ts` holds the console blocks (commands and their output).

**File:** `src/messages/apps/tickets/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-511 | `heading` | single word / label | de / en / fa | PLACEHOLDER | Short label: heading (Ticket System). Now (de): «Helpdesk» |
| CR-512 | `organisation` | single word / label | de / en / fa | PLACEHOLDER | Short label: organisation (Ticket System). Now (de): «Talweber Logistik» |
| CR-513 | `simulation` | long text | de / en / fa | PLACEHOLDER | Disclaimer that this is a simulation (Ticket System). Now (de): «Simulation: Firma, Personen und Fälle sind erfun…» |
| CR-514 | `filterLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: filter (Ticket System). Now (de): «Nach Status filtern» |
| CR-515 | `all` | single word / label | de / en / fa | PLACEHOLDER | Short label: all (Ticket System). Now (de): «Alle» |
| CR-516 | `sortLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: sort (Ticket System). Now (de): «Sortieren» |
| CR-517 | `sort.priority` | single word / label | de / en / fa | PLACEHOLDER | sort label: priority (Ticket System). Now (de): «Priorität» |
| CR-518 | `sort.number` | single word / label | de / en / fa | PLACEHOLDER | sort label: number (Ticket System). Now (de): «Nummer» |
| CR-519 | `count` | short text | de / en / fa | PLACEHOLDER | Wording for "count" (Ticket System). Now (de): «{count, plural, =0 {Keine Tickets} one {# Ticket…» |
| CR-520 | `empty` | short text | de / en / fa | PLACEHOLDER | Wording for "empty" (Ticket System). Now (de): «Keine Tickets mit diesem Status.» |
| CR-521 | `listLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: list (Ticket System). Now (de): «Tickets» |
| CR-522 | `back` | button | de / en / fa | PLACEHOLDER | Button label: back (Ticket System). Now (de): «Alle Tickets» |
| CR-523 | `status.inProgress` | single word / label | de / en / fa | PLACEHOLDER | status label: inProgress (Ticket System). Now (de): «In Arbeit» |
| CR-524 | `status.waiting` | single word / label | de / en / fa | PLACEHOLDER | status label: waiting (Ticket System). Now (de): «Wartet» |
| CR-525 | `status.resolved` | single word / label | de / en / fa | PLACEHOLDER | status label: resolved (Ticket System). Now (de): «Gelöst» |
| CR-526 | `priority.high` | single word / label | de / en / fa | PLACEHOLDER | priority label: high (Ticket System). Now (de): «Hoch» |
| CR-527 | `priority.normal` | single word / label | de / en / fa | PLACEHOLDER | priority label: normal (Ticket System). Now (de): «Normal» |
| CR-528 | `priority.low` | single word / label | de / en / fa | PLACEHOLDER | priority label: low (Ticket System). Now (de): «Niedrig» |
| CR-529 | `priorityLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: priority (Ticket System). Now (de): «Priorität {priority}» |
| CR-530 | `category.network` | single word / label | de / en / fa | PLACEHOLDER | category label: network (Ticket System). Now (de): «Netzwerk» |
| CR-531 | `category.printer` | single word / label | de / en / fa | PLACEHOLDER | category label: printer (Ticket System). Now (de): «Drucker» |
| CR-532 | `category.client` | single word / label | de / en / fa | PLACEHOLDER | category label: client (Ticket System). Now (de): «Arbeitsplatz» |
| CR-533 | `category.account` | single word / label | de / en / fa | PLACEHOLDER | category label: account (Ticket System). Now (de): «Konto» |
| CR-534 | `category.hardware` | single word / label | de / en / fa | PLACEHOLDER | category label: hardware (Ticket System). Now (de): «Hardware» |
| CR-535 | `sections.reported` | single word / label | de / en / fa | PLACEHOLDER | sections label: reported (Ticket System). Now (de): «Gemeldet» |
| CR-536 | `sections.diagnosis` | single word / label | de / en / fa | PLACEHOLDER | sections label: diagnosis (Ticket System). Now (de): «Diagnose» |
| CR-537 | `sections.solution` | single word / label | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Lösung» |
| CR-538 | `sections.plannedSolution` | single word / label | de / en / fa | PLACEHOLDER | sections label: plannedSolution (Ticket System). Now (de): «Lösungsweg» |
| CR-539 | `sections.lesson` | short text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Was man daraus lernt» |
| CR-540 | `stepLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: step (Ticket System). Now (de): «Schritt {step}» |
| CR-541 | `noOutput` | single word / label | de / en / fa | PLACEHOLDER | Short label: noOutput (Ticket System). Now (de): «(keine Ausgabe)» |
| CR-542 | `select` | short text | de / en / fa | PLACEHOLDER | Wording for "select" (Ticket System). Now (de): «Wählen Sie ein Ticket aus der Liste.» |
| CR-543 | `tickets.no-network.title` | short text | de / en / fa | PLACEHOLDER | Title (Ticket System). Now (de): «Kein Netzwerk an Platz 14» |
| CR-544 | `tickets.no-network.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Buchhaltung, Platz 14» |
| CR-545 | `tickets.no-network.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Seit heute Morgen gehen weder Internet noch Netz…» |
| CR-546 | `tickets.no-network.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Zuerst die Adresse des Rechners: Sie beginnt m…» |
| CR-547 | `tickets.no-network.solution` | long text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Das Gäste-WLAN bekam einen eigenen Adressbereich…» |
| CR-548 | `tickets.no-network.lesson` | long text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Eine Adresse, die mit 169.254 beginnt, bedeutet:…» |
| CR-549 | `tickets.intranet-dns.title` | short text | de / en / fa | PLACEHOLDER | Title (Ticket System). Now (de): «Intranet nicht erreichbar, Internet geht» |
| CR-550 | `tickets.intranet-dns.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Vertrieb, Laptop» |
| CR-551 | `tickets.intranet-dns.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Externe Webseiten laden, aber intranet.talweber.…» |
| CR-552 | `tickets.intranet-dns.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Der Intranet-Server antwortet auf seine IP-Adr…» |
| CR-553 | `tickets.intranet-dns.solution` | long text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «DNS am Netzwerkadapter wieder auf „automatisch b…» |
| CR-554 | `tickets.intranet-dns.lesson` | long text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Name und Adresse sind zwei getrennte Schichten. …» |
| CR-555 | `tickets.printer-postscript.title` | short text | de / en / fa | PLACEHOLDER | Title (Ticket System). Now (de): «Drucker druckt seitenweise Code» |
| CR-556 | `tickets.printer-postscript.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Einkauf, 1. OG» |
| CR-557 | `tickets.printer-postscript.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Statt der Rechnung kommen dutzende Seiten, die m…» |
| CR-558 | `tickets.printer-postscript.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Die Konfigurationsseite direkt am Bedienfeld d…» |
| CR-559 | `tickets.printer-postscript.solution` | long text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Den passenden PCL-6-Treiber des Herstellers inst…» |
| CR-560 | `tickets.printer-postscript.lesson` | long text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Jedes Glied der Kette einzeln testen – Gerät, Ne…» |
| CR-561 | `tickets.print-queue.title` | short text | de / en / fa | PLACEHOLDER | Title (Ticket System). Now (de): «Niemand im Erdgeschoss kann drucken» |
| CR-562 | `tickets.print-queue.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Lager, Erdgeschoss» |
| CR-563 | `tickets.print-queue.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Alle Druckaufträge bleiben in der Warteschlange …» |
| CR-564 | `tickets.print-queue.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Die Warteschlange auf dem Druckserver: Der ers…» |
| CR-565 | `tickets.print-queue.solution` | long text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Hängenden Auftrag entfernt, Druckwarteschlange (…» |
| CR-566 | `tickets.print-queue.lesson` | long text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Eine Warteschlange arbeitet der Reihe nach. Ein …» |
| CR-567 | `tickets.account-lockout.title` | short text | de / en / fa | PLACEHOLDER | Title (Ticket System). Now (de): «Konto jeden Morgen gesperrt» |
| CR-568 | `tickets.account-lockout.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Versand, a.neumann» |
| CR-569 | `tickets.account-lockout.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Das Konto ist jeden Morgen gesperrt, obwohl das …» |
| CR-570 | `tickets.account-lockout.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Auf dem Domänencontroller hält das Ereignis 47…» |
| CR-571 | `tickets.account-lockout.solution` | short text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Konto entsperrt, veraltete Anmeldedaten auf PC-L…» |
| CR-572 | `tickets.account-lockout.lesson` | long text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Eine Kontosperre kommt oft von einem vergessenen…» |
| CR-573 | `tickets.slow-pc.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (Ticket System). Now (de): «PC extrem langsam» |
| CR-574 | `tickets.slow-pc.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Büro, PC-BUERO-09» |
| CR-575 | `tickets.slow-pc.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Seit Montag brauchen Programme Minuten zum Start…» |
| CR-576 | `tickets.slow-pc.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Erst messen: Der Prozessor ist kaum ausgelaste…» |
| CR-577 | `tickets.slow-pc.solution` | long text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Kurzfristig: große Videoaufnahmen aus dem Profil…» |
| CR-578 | `tickets.slow-pc.lesson` | short text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Erst messen, dann handeln: Prozessor, Arbeitsspe…» |
| CR-579 | `tickets.dock-display.title` | short text | de / en / fa | PLACEHOLDER | Title (Ticket System). Now (de): «Zweiter Monitor bleibt schwarz» |
| CR-580 | `tickets.dock-display.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Controlling, Platz 3» |
| CR-581 | `tickets.dock-display.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Nach dem Umzug an einen anderen Platz bleibt der…» |
| CR-582 | `tickets.dock-display.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Die Lampe am Monitor leuchtet orange: Er hat S…» |
| CR-583 | `tickets.dock-display.solution` | long text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Firmware der Dockingstation aktualisiert, danach…» |
| CR-584 | `tickets.dock-display.lesson` | short text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Tauschen Sie ein Teil gegen eines, das sicher fu…» |
| CR-585 | `tickets.meeting-wifi.title` | short text | de / en / fa | PLACEHOLDER | Title (Ticket System). Now (de): «WLAN bricht im Besprechungsraum ab» |
| CR-586 | `tickets.meeting-wifi.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Geschäftsführung, Besprechungsraum 2» |
| CR-587 | `tickets.meeting-wifi.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «In Videokonferenzen reißt die Verbindung immer w…» |
| CR-588 | `tickets.meeting-wifi.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Der Laptop hängt im 2,4-GHz-Band auf Kanal 3, …» |
| CR-589 | `tickets.meeting-wifi.solution` | long text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Access Point auf Kanal 11 gestellt und 5 GHz mit…» |
| CR-590 | `tickets.meeting-wifi.lesson` | long text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Funk ist ein geteiltes Medium. Wer im 2,4-GHz-Ba…» |
| CR-591 | `tickets.share-access.title` | single word / label | de / en / fa | PLACEHOLDER | Short label: title (Ticket System). Now (de): «Abteilungsordner nicht sichtbar» |
| CR-592 | `tickets.share-access.reporter` | single word / label | de / en / fa | PLACEHOLDER | Short label: reporter (Ticket System). Now (de): «Einkauf, l.krause» |
| CR-593 | `tickets.share-access.symptom` | short text | de / en / fa | PLACEHOLDER | Symptom as reported (Ticket System). Now (de): «Die neue Kollegin sieht den Abteilungsordner nic…» |
| CR-594 | `tickets.share-access.steps` | long text | de / en / fa | PLACEHOLDER | Diagnosis steps, one sentence each (Ticket System). Now (de): «["Im Verzeichnis ist sie Mitglied der Gruppe Ein…» |
| CR-595 | `tickets.share-access.solution` | short text | de / en / fa | PLACEHOLDER | Solution text (Ticket System). Now (de): «Einmal ab- und wieder angemeldet – der Ordner is…» |
| CR-596 | `tickets.share-access.lesson` | long text | de / en / fa | PLACEHOLDER | Lesson learned (Ticket System). Now (de): «Gruppenmitgliedschaften wirken erst ab der nächs…» |

**File:** `src/content/tickets.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-597 | `ticket "no-network": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket no-network: commands and console output; must be technically real and match the prose steps |
| CR-598 | `ticket "intranet-dns": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket intranet-dns: commands and console output; must be technically real and match the prose steps |
| CR-599 | `ticket "printer-postscript": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket printer-postscript: commands and console output; must be technically real and match the prose steps |
| CR-600 | `ticket "print-queue": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket print-queue: commands and console output; must be technically real and match the prose steps |
| CR-601 | `ticket "account-lockout": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket account-lockout: commands and console output; must be technically real and match the prose steps |
| CR-602 | `ticket "slow-pc": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket slow-pc: commands and console output; must be technically real and match the prose steps |
| CR-603 | `ticket "dock-display": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket dock-display: commands and console output; must be technically real and match the prose steps |
| CR-604 | `ticket "meeting-wifi": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket meeting-wifi: commands and console output; must be technically real and match the prose steps |
| CR-605 | `ticket "share-access": number, category, priority, status and every command/output block` | other | all (machine text) | PLACEHOLDER | Machine text of ticket share-access: commands and console output; must be technically real and match the prose steps |

## 18. Desktop app: Traceroute

A simulated traceroute. Routes and hostnames are machine text from reserved example ranges.

**File:** `src/messages/apps/traceroute/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-606 | `simulation` | long text | de / en / fa | PLACEHOLDER | Disclaimer that this is a simulation (Traceroute app). Now (de): «Simulation: Ein Browser kann kein echtes tracero…» |
| CR-607 | `intro` | long text | de / en / fa | PLACEHOLDER | Introductory text (Traceroute app). Now (de): «Eine Verbindung ist eine Kette von Maschinen, un…» |
| CR-608 | `formLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: form (Traceroute app). Now (de): «Traceroute starten» |
| CR-609 | `targetLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: target (Traceroute app). Now (de): «Ziel» |
| CR-610 | `targetPlaceholder` | single word / label | de / en / fa | PLACEHOLDER | Short label: targetPlaceholder (Traceroute app). Now (de): «z. B. ahmadreza.de» |
| CR-611 | `run` | button | de / en / fa | PLACEHOLDER | Button label: run (Traceroute app). Now (de): «Starten» |
| CR-612 | `prepared` | single word / label | de / en / fa | PLACEHOLDER | Short label: prepared (Traceroute app). Now (de): «Vorbereitete Ziele» |
| CR-613 | `targets.router` | single word / label | de / en / fa | PLACEHOLDER | Prepared target label: router (Traceroute app). Now (de): «Ihr Router» |
| CR-614 | `targets.ahmadreza` | single word / label | de / en / fa | PLACEHOLDER | Prepared target label: ahmadreza (Traceroute app). Now (de): «Diese Website» |
| CR-615 | `targets.newyork` | single word / label | de / en / fa | PLACEHOLDER | Prepared target label: newyork (Traceroute app). Now (de): «New York» |
| CR-616 | `targets.tokyo` | single word / label | de / en / fa | PLACEHOLDER | Prepared target label: tokyo (Traceroute app). Now (de): «Tokio» |
| CR-617 | `mapped` | long text | de / en / fa | PLACEHOLDER | Wording for "mapped" (Traceroute app). Now (de): «Für „{host}“ gibt es keine eigene Route. Die Sim…» |
| CR-618 | `unknownHost` | short text | de / en / fa | PLACEHOLDER | Wording for "unknownHost" (Traceroute app). Now (de): «„{host}“ ist kein gültiger Rechnername und keine…» |
| CR-619 | `hopsLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: hops (Traceroute app). Now (de): «Stationen auf dem Weg» |
| CR-620 | `roles.homeRouter` | short text | de / en / fa | PLACEHOLDER | Role label of a route hop: homeRouter (Traceroute app). Now (de): «Ihr Router zu Hause» |
| CR-621 | `roles.ispAccess` | single word / label | de / en / fa | PLACEHOLDER | Role label of a route hop: ispAccess (Traceroute app). Now (de): «Zugangsknoten Ihres Providers» |
| CR-622 | `roles.ispCore` | single word / label | de / en / fa | PLACEHOLDER | Role label of a route hop: ispCore (Traceroute app). Now (de): «Kernnetz des Providers» |
| CR-623 | `roles.exchange` | single word / label | de / en / fa | PLACEHOLDER | Role label of a route hop: exchange (Traceroute app). Now (de): «Internetknoten Frankfurt» |
| CR-624 | `roles.carrier` | single word / label | de / en / fa | PLACEHOLDER | Role label of a route hop: carrier (Traceroute app). Now (de): «Netz eines Transitanbieters» |
| CR-625 | `roles.subsea` | short text | de / en / fa | PLACEHOLDER | Role label of a route hop: subsea (Traceroute app). Now (de): «Am anderen Ende eines Seekabels» |
| CR-626 | `roles.hosting` | single word / label | de / en / fa | PLACEHOLDER | Role label of a route hop: hosting (Traceroute app). Now (de): «Rechenzentrum am Ziel» |
| CR-627 | `roles.edge` | single word / label | de / en / fa | PLACEHOLDER | Role label of a route hop: edge (Traceroute app). Now (de): «Auslieferungsserver in Frankfurt» |
| CR-628 | `roles.destination` | single word / label | de / en / fa | PLACEHOLDER | Role label of a route hop: destination (Traceroute app). Now (de): «Ziel» |
| CR-629 | `roles.silent` | short text | de / en / fa | PLACEHOLDER | Role label of a route hop: silent (Traceroute app). Now (de): «Ein Router, der nicht antwortet» |
| CR-630 | `silentNote` | short text | de / en / fa | PLACEHOLDER | Wording for "silentNote" (Traceroute app). Now (de): «Viele Netzbetreiber schalten die Antwort auf tra…» |
| CR-631 | `jumpBadge` | single word / label | de / en / fa | PLACEHOLDER | Short label: jumpBadge (Traceroute app). Now (de): «größter Sprung» |
| CR-632 | `status.idle` | short text | de / en / fa | PLACEHOLDER | status label: idle (Traceroute app). Now (de): «Wählen Sie ein Ziel.» |
| CR-633 | `status.running` | single word / label | de / en / fa | PLACEHOLDER | status label: running (Traceroute app). Now (de): «Paket unterwegs …» |
| CR-634 | `status.done` | short text | de / en / fa | PLACEHOLDER | status label: done (Traceroute app). Now (de): «Ziel erreicht.» |
| CR-635 | `summary` | short text | de / en / fa | PLACEHOLDER | Wording for "summary" (Traceroute app). Now (de): «{hops, plural, one {# Station} other {# Statione…» |
| CR-636 | `jump` | long text | de / en / fa | PLACEHOLDER | Wording for "jump" (Traceroute app). Now (de): «Den größten Sprung macht die Zeit zwischen Stati…» |
| CR-637 | `why.lan` | short text | de / en / fa | PLACEHOLDER | "Why this takes time" explanation: lan (Traceroute app). Now (de): «Im eigenen Netz ist der Weg eine einzige Station…» |
| CR-638 | `why.ispAccess` | long text | de / en / fa | PLACEHOLDER | "Why this takes time" explanation: ispAccess (Traceroute app). Now (de): «Die meiste Zeit kostet das erste Stück: die Leit…» |
| CR-639 | `why.subsea` | long text | de / en / fa | PLACEHOLDER | "Why this takes time" explanation: subsea (Traceroute app). Now (de): «Hier überquert das Paket einen Ozean durch ein S…» |
| CR-640 | `why.carrier` | long text | de / en / fa | PLACEHOLDER | "Why this takes time" explanation: carrier (Traceroute app). Now (de): «Hier legt das Paket eine lange Strecke über Land…» |
| CR-641 | `raw` | short text | de / en / fa | PLACEHOLDER | Wording for "raw" (Traceroute app). Now (de): «Ausgabe wie im Terminal» |

**File:** `src/content/routes.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-642 | `route "router": target, hops, hostnames, addresses, round-trip times` | other | all (machine text) | PLACEHOLDER | Hops of the "router" route; only reserved example names and ranges (RFC 2606, 5737, 8375) |
| CR-643 | `route "ahmadreza": target, hops, hostnames, addresses, round-trip times` | other | all (machine text) | PLACEHOLDER | Hops of the "ahmadreza" route; only reserved example names and ranges (RFC 2606, 5737, 8375) |
| CR-644 | `route "newyork": target, hops, hostnames, addresses, round-trip times` | other | all (machine text) | PLACEHOLDER | Hops of the "newyork" route; only reserved example names and ranges (RFC 2606, 5737, 8375) |
| CR-645 | `route "tokyo": target, hops, hostnames, addresses, round-trip times` | other | all (machine text) | PLACEHOLDER | Hops of the "tokyo" route; only reserved example names and ranges (RFC 2606, 5737, 8375) |

**File:** `src/components/apps/traceroute/trace.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-646 | `formatHeader (the "traceroute to ..." header line)` | other | all (machine text) | PLACEHOLDER | Header line copied from the real tool |

## 19. Desktop app: Assistant (local search)

Search over the site's own content; the keywords decide what it finds. No AI service is involved.

**File:** `src/messages/apps/assistant/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-647 | `intro` | long text | de / en / fa | PLACEHOLDER | Introductory text (Assistant app). Now (de): «Fragen Sie diese Suche nach Ahmadrezas Werdegang…» |
| CR-648 | `log` | short text | de / en / fa | PLACEHOLDER | Wording for "log" (Assistant app). Now (de): «Suche über die Inhalte dieser Website» |
| CR-649 | `you` | single word / label | de / en / fa | PLACEHOLDER | Short label: you (Assistant app). Now (de): «Sie» |
| CR-650 | `badge` | single word / label | de / en / fa | PLACEHOLDER | Short label: badge (Assistant app). Now (de): «Suche» |
| CR-651 | `banner` | long text | de / en / fa | PLACEHOLDER | Banner notice (Assistant app). Now (de): «Das ist eine Suche über die Inhalte dieser Websi…» |
| CR-652 | `source.about` | single word / label | de / en / fa | PLACEHOLDER | Short label: about (Assistant app). Now (de): «Über Ahmadreza» |
| CR-653 | `source.now` | short text | de / en / fa | PLACEHOLDER | Source label of a search hit: now (Assistant app). Now (de): «Was er heute macht» |
| CR-654 | `source.station` | single word / label | de / en / fa | PLACEHOLDER | Short label: station (Assistant app). Now (de): «Werdegang» |
| CR-655 | `source.skillArea` | single word / label | de / en / fa | PLACEHOLDER | Short label: skillArea (Assistant app). Now (de): «Fähigkeiten» |
| CR-656 | `source.language` | single word / label | de / en / fa | PLACEHOLDER | Short label: language (Assistant app). Now (de): «Sprachen» |
| CR-657 | `source.project` | single word / label | de / en / fa | PLACEHOLDER | Short label: project (Assistant app). Now (de): «Projekt» |
| CR-658 | `source.era` | single word / label | de / en / fa | PLACEHOLDER | Short label: era (Assistant app). Now (de): «Epoche {year}» |
| CR-659 | `source.ticket` | single word / label | de / en / fa | PLACEHOLDER | Short label: ticket (Assistant app). Now (de): «Ticket {number}» |
| CR-660 | `source.contact` | single word / label | de / en / fa | PLACEHOLDER | Short label: contact (Assistant app). Now (de): «Kontakt» |
| CR-661 | `status.idle` | short text | de / en / fa | PLACEHOLDER | status label: idle (Assistant app). Now (de): «Bereit. Stellen Sie eine Frage oder wählen Sie e…» |
| CR-662 | `status.searching` | short text | de / en / fa | PLACEHOLDER | status label: searching (Assistant app). Now (de): «Die Website wird durchsucht …» |
| CR-663 | `status.answered` | short text | de / en / fa | PLACEHOLDER | status label: answered (Assistant app). Now (de): «Passende Stellen gefunden.» |
| CR-664 | `status.noMatch` | short text | de / en / fa | PLACEHOLDER | status label: noMatch (Assistant app). Now (de): «Dazu steht nichts auf dieser Website.» |
| CR-665 | `noMatchIntro` | short text | de / en / fa | PLACEHOLDER | Wording for "noMatchIntro" (Assistant app). Now (de): «Dazu finde ich nichts auf dieser Website. Das ka…» |
| CR-666 | `suggestions` | single word / label | de / en / fa | PLACEHOLDER | Short label: suggestions (Assistant app). Now (de): «Beispiele zum Ausprobieren» |
| CR-667 | `examples` | other | de / en / fa | PLACEHOLDER | Example questions offered to the visitor (Assistant app). Now (de): «["Wer ist Ahmadreza?","Welche Fähigkeiten hat er…» |
| CR-668 | `form.label` | short text | de / en / fa | PLACEHOLDER | Accessible (screen-reader) label (Assistant app). Now (de): «Ihre Frage an die Suche» |
| CR-669 | `form.placeholder` | single word / label | de / en / fa | PLACEHOLDER | Short label: placeholder (Assistant app). Now (de): «Ihre Frage …» |
| CR-670 | `form.send` | button | de / en / fa | PLACEHOLDER | Button label: send (Assistant app). Now (de): «Suchen» |
| CR-671 | `form.count` | short text | de / en / fa | PLACEHOLDER | Wording for "count" (Assistant app). Now (de): «{count} von {max} Zeichen» |
| CR-672 | `form.hint` | short text | de / en / fa | PLACEHOLDER | Puzzle hint (must not give the answer away) (Assistant app). Now (de): «Mit Enter senden. Pfeil nach oben holt die letzt…» |
| CR-673 | `privacy` | long text | de / en / fa | PLACEHOLDER | Privacy notice (Assistant app). Now (de): «Datenschutz: Diese Suche läuft vollständig in Ih…» |
| CR-674 | `contactSentence` | short text | de / en / fa | PLACEHOLDER | Wording for "contactSentence" (Assistant app). Now (de): «Am schnellsten per E-Mail an {email}.» |
| CR-675 | `keywords.about.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["wer ist","wer bist","vorstellung","uber ihn","…» |
| CR-676 | `keywords.now.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["heute","aktuell","zurzeit","gerade"]» |
| CR-677 | `keywords.station.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["werdegang","ausbildung","berufsschule","lebens…» |
| CR-678 | `keywords.skills.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["fahigkeit","fahigkeiten","kenntnisse","kann er…» |
| CR-679 | `keywords.language.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["sprachen","sprache","deutsch","englisch","pers…» |
| CR-680 | `keywords.project.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["projekt","projekte","arbeitet er an","woran ar…» |
| CR-681 | `keywords.era.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["epoche","epochen","reise","ratsel","website","…» |
| CR-682 | `keywords.ticket.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["ticket","tickets","helpdesk","fehler","problem…» |
| CR-683 | `keywords.contact.keywords` | other | de / en / fa | PLACEHOLDER | Search keywords the local search matches on (Assistant app). Now (de): «["kontakt","erreichen","erreiche","e-mail","emai…» |
| CR-684 | `eras.eniac.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (Assistant app). Now (de): «ENIAC und Lochkarten» |
| CR-685 | `eras.eniac.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (Assistant app). Now (de): «Text ist Zahlen. Jedes Zeichen ist ein Muster au…» |
| CR-686 | `eras.batch.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (Assistant app). Now (de): «Großrechner und Stapel­verarbeitung» |
| CR-687 | `eras.batch.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (Assistant app). Now (de): «Ein Computer hasst Warten. Genau dafür gibt es B…» |
| CR-688 | `eras.unix.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (Assistant app). Now (de): «UNIX» |
| CR-689 | `eras.unix.description` | long text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (Assistant app). Now (de): «Ein Dateisystem ist ein Baum. Jede Datei hat ein…» |
| CR-690 | `eras.dos.name` | short text | de / en / fa | PLACEHOLDER | Display name (Assistant app). Now (de): «IBM PC und MS-DOS» |
| CR-691 | `eras.dos.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (Assistant app). Now (de): «Speicher ist endlich. Diese Grenze bestimmt, was…» |
| CR-692 | `eras.macintosh.name` | single word / label | de / en / fa | PLACEHOLDER | Short label: name (Assistant app). Now (de): «Macintosh» |
| CR-693 | `eras.macintosh.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (Assistant app). Now (de): «Zeigen ist leichter als Erinnern. Auf dieser Ide…» |
| CR-694 | `eras.win95.name` | short text | de / en / fa | PLACEHOLDER | Display name (Assistant app). Now (de): «Windows 95 und Einwahl» |
| CR-695 | `eras.win95.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (Assistant app). Now (de): «Ein Netzwerk braucht Adressen. Ohne sie findet e…» |
| CR-696 | `eras.cloud.name` | short text | de / en / fa | PLACEHOLDER | Display name (Assistant app). Now (de): «Cloud, Container und KI» |
| CR-697 | `eras.cloud.description` | short text | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (Assistant app). Now (de): «Programme laufen voneinander isoliert, an vielen…» |

## 20. Desktop app: Computer-Quiz

31 questions across the seven eras. The answer key lives in `src/content/quiz.ts`, all wording in messages.

**File:** `src/messages/apps/quiz/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-698 | `heading` | single word / label | de / en / fa | PLACEHOLDER | Short label: heading (Computer-Quiz). Now (de): «Computer-Quiz» |
| CR-699 | `intro` | long text | de / en / fa | PLACEHOLDER | Introductory text (Computer-Quiz). Now (de): «Zehn Fragen zu Geschichte und Grundlagen des Com…» |
| CR-700 | `scope` | short text | de / en / fa | PLACEHOLDER | Wording for "scope" (Computer-Quiz). Now (de): «Ein Quiz über Computerwissen – keine Prüfung, ke…» |
| CR-701 | `start` | button | de / en / fa | PLACEHOLDER | Button label: start (Computer-Quiz). Now (de): «Runde starten» |
| CR-702 | `best` | short text | de / en / fa | PLACEHOLDER | Wording for "best" (Computer-Quiz). Now (de): «Ihr Bestwert: {best, number} von {total, number}» |
| CR-703 | `progress` | short text | de / en / fa | PLACEHOLDER | Wording for "progress" (Computer-Quiz). Now (de): «Frage {current, number} von {total, number}» |
| CR-704 | `scoreSoFar` | single word / label | de / en / fa | PLACEHOLDER | Short label: scoreSoFar (Computer-Quiz). Now (de): «{score, number} richtig» |
| CR-705 | `optionsLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: options (Computer-Quiz). Now (de): «Antworten» |
| CR-706 | `correct` | short text | de / en / fa | PLACEHOLDER | Wording for "correct" (Computer-Quiz). Now (de): «Richtig.» |
| CR-707 | `wrong` | short text | de / en / fa | PLACEHOLDER | Wording for "wrong" (Computer-Quiz). Now (de): «Leider nicht.» |
| CR-708 | `rightAnswerIs` | single word / label | de / en / fa | PLACEHOLDER | Short label: rightAnswerIs (Computer-Quiz). Now (de): «Richtig ist: {answer}» |
| CR-709 | `yourAnswer` | single word / label | de / en / fa | PLACEHOLDER | Short label: yourAnswer (Computer-Quiz). Now (de): «Ihre Antwort» |
| CR-710 | `rightAnswer` | single word / label | de / en / fa | PLACEHOLDER | Short label: rightAnswer (Computer-Quiz). Now (de): «Richtige Antwort» |
| CR-711 | `era` | single word / label | de / en / fa | PLACEHOLDER | Short label: era (Computer-Quiz). Now (de): «Epoche: {era}» |
| CR-712 | `next` | button | de / en / fa | PLACEHOLDER | Button label: next (Computer-Quiz). Now (de): «Nächste Frage» |
| CR-713 | `finish` | button | de / en / fa | PLACEHOLDER | Button label: finish (Computer-Quiz). Now (de): «Zum Ergebnis» |
| CR-714 | `result.heading` | single word / label | de / en / fa | PLACEHOLDER | Short label: heading (Computer-Quiz). Now (de): «Ihr Ergebnis» |
| CR-715 | `result.score` | short text | de / en / fa | PLACEHOLDER | Wording for "score" (Computer-Quiz). Now (de): «{score, number} von {total, number} richtig» |
| CR-716 | `result.bands.all` | short text | de / en / fa | PLACEHOLDER | Result message for band "all" (Computer-Quiz). Now (de): «Alle richtig. Jede Epoche sitzt – von der Lochka…» |
| CR-717 | `result.bands.most` | short text | de / en / fa | PLACEHOLDER | Result message for band "most" (Computer-Quiz). Now (de): «Stark. Nur wenige Fragen hatten es in sich.» |
| CR-718 | `result.bands.half` | short text | de / en / fa | PLACEHOLDER | Result message for band "half" (Computer-Quiz). Now (de): «Ein guter Anfang. Die Erklärungen zeigen, was hi…» |
| CR-719 | `result.bands.start` | long text | de / en / fa | PLACEHOLDER | Result message for band "start" (Computer-Quiz). Now (de): «Diese Runde war knifflig. Jede neue Runde mischt…» |
| CR-720 | `result.newBest` | short text | de / en / fa | PLACEHOLDER | Wording for "newBest" (Computer-Quiz). Now (de): «Neuer Bestwert.» |
| CR-721 | `result.revisit` | short text | de / en / fa | PLACEHOLDER | Wording for "revisit" (Computer-Quiz). Now (de): «Diese Epochen lohnen einen zweiten Blick:» |
| CR-722 | `result.again` | button | de / en / fa | PLACEHOLDER | Button label: again (Computer-Quiz). Now (de): «Neue Runde» |
| CR-723 | `result.rounds` | short text | de / en / fa | PLACEHOLDER | Wording for "rounds" (Computer-Quiz). Now (de): «Bisher wurden hier {count, number} Runden zu End…» |
| CR-724 | `eras.eniac` | short text | de / en / fa | PLACEHOLDER | Era label: eniac (Computer-Quiz). Now (de): «1946 · ENIAC und Lochkarten» |
| CR-725 | `eras.batch` | short text | de / en / fa | PLACEHOLDER | Era label: batch (Computer-Quiz). Now (de): «1956 · Großrechner und Stapelverarbeitung» |
| CR-726 | `eras.unix` | single word / label | de / en / fa | PLACEHOLDER | Era label: unix (Computer-Quiz). Now (de): «1971 · UNIX» |
| CR-727 | `eras.dos` | short text | de / en / fa | PLACEHOLDER | Era label: dos (Computer-Quiz). Now (de): «1981 · IBM PC und MS-DOS» |
| CR-728 | `eras.macintosh` | single word / label | de / en / fa | PLACEHOLDER | Era label: macintosh (Computer-Quiz). Now (de): «1984 · Macintosh» |
| CR-729 | `eras.win95` | short text | de / en / fa | PLACEHOLDER | Era label: win95 (Computer-Quiz). Now (de): «1995 · Windows 95 und Einwahl» |
| CR-730 | `eras.cloud` | short text | de / en / fa | PLACEHOLDER | Era label: cloud (Computer-Quiz). Now (de): «Heute · Cloud, Container und KI» |
| CR-731 | `questions.byte-bits.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Aus wie vielen Bits besteht ein Byte heute prakt…» |
| CR-732 | `questions.byte-bits.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «4» |
| CR-733 | `questions.byte-bits.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «8» |
| CR-734 | `questions.byte-bits.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «10» |
| CR-735 | `questions.byte-bits.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «16» |
| CR-736 | `questions.byte-bits.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Acht Bits ergeben 256 Muster aus An und Aus – ge…» |
| CR-737 | `questions.ascii-a.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welche Zahl steht im ASCII-Code für den Großbuch…» |
| CR-738 | `questions.ascii-a.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «1» |
| CR-739 | `questions.ascii-a.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «97» |
| CR-740 | `questions.ascii-a.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «65» |
| CR-741 | `questions.ascii-a.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «128» |
| CR-742 | `questions.ascii-a.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «„A“ ist 65, binär 01000001; das kleine „a“ ist 9…» |
| CR-743 | `questions.three-bits.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wie viele verschiedene Muster lassen sich mit 3 …» |
| CR-744 | `questions.three-bits.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «8» |
| CR-745 | `questions.three-bits.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «3» |
| CR-746 | `questions.three-bits.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «6» |
| CR-747 | `questions.three-bits.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «9» |
| CR-748 | `questions.three-bits.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Jedes Bit verdoppelt die Möglichkeiten: 2 × 2 × …» |
| CR-749 | `questions.binary-five.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welche Binärzahl steht für die Dezimalzahl 5?» |
| CR-750 | `questions.binary-five.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «110» |
| CR-751 | `questions.binary-five.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «111» |
| CR-752 | `questions.binary-five.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «011» |
| CR-753 | `questions.binary-five.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «101» |
| CR-754 | `questions.binary-five.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «101 bedeutet 1 × 4 + 0 × 2 + 1 × 1 = 5: Jede Ste…» |
| CR-755 | `questions.shortest-first.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Drei Jobs warten auf einen Rechner. Sie dauern 1…» |
| CR-756 | `questions.shortest-first.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «2, 5, 10» |
| CR-757 | `questions.shortest-first.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «10, 5, 2» |
| CR-758 | `questions.shortest-first.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «5, 2, 10» |
| CR-759 | `questions.shortest-first.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «10, 2, 5» |
| CR-760 | `questions.shortest-first.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Kurze Jobs zuerst: Dann warten sie zusammen 0 + …» |
| CR-761 | `questions.first-os.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wofür sorgten die ersten Betriebssysteme Mitte d…» |
| CR-762 | `questions.first-os.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Für farbige Grafik auf dem Bildschirm» |
| CR-763 | `questions.first-os.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Für Verbindungen zwischen Rechnern» |
| CR-764 | `questions.first-os.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Dass der Rechner einen Job nach dem anderen ohne…» |
| CR-765 | `questions.first-os.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Für die Bedienung mit einer Maus» |
| CR-766 | `questions.first-os.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Ein Großrechner war teuer, und jede Minute Leerl…» |
| CR-767 | `questions.batch-meaning.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Was bedeutet Stapelverarbeitung?» |
| CR-768 | `questions.batch-meaning.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Der Rechner reagiert sofort auf jeden Tastendruc…» |
| CR-769 | `questions.batch-meaning.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Jobs werden gesammelt und nacheinander ohne Eing…» |
| CR-770 | `questions.batch-meaning.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Mehrere Rechner teilen sich eine Datei» |
| CR-771 | `questions.batch-meaning.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Daten werden in Stapeln auf Festplatten gesicher…» |
| CR-772 | `questions.batch-meaning.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Im Stapelbetrieb der Epoche 1956 gab man einen S…» |
| CR-773 | `questions.scheduler.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welcher Teil eines Betriebssystems entscheidet, …» |
| CR-774 | `questions.scheduler.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Das Dateisystem» |
| CR-775 | `questions.scheduler.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Der Bootloader» |
| CR-776 | `questions.scheduler.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Der Tastaturtreiber» |
| CR-777 | `questions.scheduler.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Der Scheduler» |
| CR-778 | `questions.scheduler.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Der Scheduler verteilt die Rechenzeit – heute vi…» |
| CR-779 | `questions.root.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wie heißt das oberste Verzeichnis eines UNIX-Dat…» |
| CR-780 | `questions.root.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «/» |
| CR-781 | `questions.root.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «~» |
| CR-782 | `questions.root.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «C:\» |
| CR-783 | `questions.root.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «..» |
| CR-784 | `questions.root.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Alles hängt an der Wurzel „/“, auch jede weitere…» |
| CR-785 | `questions.dot-dot.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wohin führt der Befehl „cd ..“?» |
| CR-786 | `questions.dot-dot.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Ins Home-Verzeichnis» |
| CR-787 | `questions.dot-dot.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Ins Wurzelverzeichnis /» |
| CR-788 | `questions.dot-dot.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Ins übergeordnete Verzeichnis» |
| CR-789 | `questions.dot-dot.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Ins zuletzt besuchte Verzeichnis» |
| CR-790 | `questions.dot-dot.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «„..“ ist in jedem Verzeichnis der Name für die E…» |
| CR-791 | `questions.absolute-path.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welcher dieser Pfade ist absolut?» |
| CR-792 | `questions.absolute-path.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «docs/notes.txt» |
| CR-793 | `questions.absolute-path.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «/home/ada/notes.txt» |
| CR-794 | `questions.absolute-path.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «../notes.txt» |
| CR-795 | `questions.absolute-path.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «notes.txt» |
| CR-796 | `questions.absolute-path.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Ein absoluter Pfad beginnt an der Wurzel „/“ und…» |
| CR-797 | `questions.pwd.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Was zeigt der Befehl „pwd“ an?» |
| CR-798 | `questions.pwd.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Das Passwort des Benutzers» |
| CR-799 | `questions.pwd.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Den Inhalt einer Datei» |
| CR-800 | `questions.pwd.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Die Dateien im Verzeichnis» |
| CR-801 | `questions.pwd.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Den Pfad des aktuellen Verzeichnisses» |
| CR-802 | `questions.pwd.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «pwd steht für „print working directory“ und zeig…» |
| CR-803 | `questions.conventional-memory.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wie viel Arbeitsspeicher konnten Programme unter…» |
| CR-804 | `questions.conventional-memory.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «64 KB» |
| CR-805 | `questions.conventional-memory.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «16 MB» |
| CR-806 | `questions.conventional-memory.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «640 KB» |
| CR-807 | `questions.conventional-memory.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «1 GB» |
| CR-808 | `questions.conventional-memory.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Die berühmten 640 KB „konventioneller Speicher“:…» |
| CR-809 | `questions.kibibyte.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wie viele Bytes hat ein Kibibyte (KiB)?» |
| CR-810 | `questions.kibibyte.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «1024» |
| CR-811 | `questions.kibibyte.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «1000» |
| CR-812 | `questions.kibibyte.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «512» |
| CR-813 | `questions.kibibyte.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «In der DOS-Welt der Epoche 1981 sagte man „Kilob…» |
| CR-814 | `questions.ram-power.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Was passiert mit dem Inhalt des Arbeitsspeichers…» |
| CR-815 | `questions.ram-power.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Er wird automatisch gesichert» |
| CR-816 | `questions.ram-power.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Er geht verloren» |
| CR-817 | `questions.ram-power.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Er bleibt bis zum nächsten Start erhalten» |
| CR-818 | `questions.ram-power.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «RAM hält Daten nur, solange Strom fließt. Deshal…» |
| CR-819 | `questions.free-memory.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Ein Programm meldet unter MS-DOS: zu wenig Speic…» |
| CR-820 | `questions.free-memory.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Die Festplatte defragmentieren» |
| CR-821 | `questions.free-memory.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Den Bildschirm heller stellen» |
| CR-822 | `questions.free-memory.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Eine zweite Diskette einlegen» |
| CR-823 | `questions.free-memory.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Treiber weglassen oder in den oberen Speicher la…» |
| CR-824 | `questions.free-memory.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Jeder Treiber aus CONFIG.SYS und AUTOEXEC.BAT be…» |
| CR-825 | `questions.wimp.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wofür steht die Abkürzung WIMP?» |
| CR-826 | `questions.wimp.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Windows, Icons, Menus, Pointer» |
| CR-827 | `questions.wimp.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Wireless Internet Mail Protocol» |
| CR-828 | `questions.wimp.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Word, Image, Media, Print» |
| CR-829 | `questions.wimp.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Windows Internal Memory Page» |
| CR-830 | `questions.wimp.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Fenster, Symbole, Menüs und Zeiger: die vier Bau…» |
| CR-831 | `questions.macintosh-1984.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Was brachte der Macintosh 1984 einem breiten Pub…» |
| CR-832 | `questions.macintosh-1984.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Den ersten Internetbrowser» |
| CR-833 | `questions.macintosh-1984.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Eine grafische Oberfläche mit Maus» |
| CR-834 | `questions.macintosh-1984.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Einen Touchscreen in Farbe» |
| CR-835 | `questions.macintosh-1984.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Die erste Festplatte» |
| CR-836 | `questions.macintosh-1984.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Grafische Oberflächen gab es schon vorher in For…» |
| CR-837 | `questions.point-and-choose.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welche Idee steckt hinter einer grafischen Oberf…» |
| CR-838 | `questions.point-and-choose.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Befehle schneller tippen» |
| CR-839 | `questions.point-and-choose.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Programme ohne Arbeitsspeicher ausführen» |
| CR-840 | `questions.point-and-choose.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Zeigen und auswählen statt Befehle auswendig ler…» |
| CR-841 | `questions.point-and-choose.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Was man sieht, muss man sich nicht merken: Ein M…» |
| CR-842 | `questions.copy-shortcut.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welche Tastenkombination kopiert auf dem Mac die…» |
| CR-843 | `questions.copy-shortcut.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Befehlstaste + V» |
| CR-844 | `questions.copy-shortcut.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Befehlstaste + C» |
| CR-845 | `questions.copy-shortcut.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Befehlstaste + X» |
| CR-846 | `questions.copy-shortcut.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Befehlstaste + Z» |
| CR-847 | `questions.copy-shortcut.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «C wie „copy“; V fügt ein, X schneidet aus, Z mac…» |
| CR-848 | `questions.ip-address.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wozu dient eine IP-Adresse?» |
| CR-849 | `questions.ip-address.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Sie verschlüsselt die Verbindung» |
| CR-850 | `questions.ip-address.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Sie legt die Geschwindigkeit fest» |
| CR-851 | `questions.ip-address.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Sie speichert Webseiten zwischen» |
| CR-852 | `questions.ip-address.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Sie kennzeichnet ein Gerät im Netz, damit Pakete…» |
| CR-853 | `questions.ip-address.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Ohne Adresse kein Ziel: Jedes Paket trägt die IP…» |
| CR-854 | `questions.ipv4-bits.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wie viele Bits hat eine IPv4-Adresse?» |
| CR-855 | `questions.ipv4-bits.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «8» |
| CR-856 | `questions.ipv4-bits.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «64» |
| CR-857 | `questions.ipv4-bits.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «32» |
| CR-858 | `questions.ipv4-bits.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «128» |
| CR-859 | `questions.ipv4-bits.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «32 Bits, geschrieben als vier Zahlen von 0 bis 2…» |
| CR-860 | `questions.gateway.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welche Aufgabe hat das Standardgateway?» |
| CR-861 | `questions.gateway.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Es leitet Pakete an Ziele außerhalb des eigenen …» |
| CR-862 | `questions.gateway.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Es übersetzt Domainnamen in Adressen» |
| CR-863 | `questions.gateway.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Es vergibt Passwörter» |
| CR-864 | `questions.gateway.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Es verbindet Drucker per USB» |
| CR-865 | `questions.gateway.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Alles, was nicht im eigenen Netz liegt, geht an …» |
| CR-866 | `questions.same-network.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Subnetzmaske 255.255.255.0: Welche Adresse liegt…» |
| CR-867 | `questions.same-network.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «192.168.2.20» |
| CR-868 | `questions.same-network.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «192.168.1.200» |
| CR-869 | `questions.same-network.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «10.168.1.20» |
| CR-870 | `questions.same-network.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «192.168.10.1» |
| CR-871 | `questions.same-network.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Diese Maske sagt: Die ersten drei Zahlen bilden …» |
| CR-872 | `questions.prefix-24.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welche Subnetzmaske entspricht der Schreibweise …» |
| CR-873 | `questions.prefix-24.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «255.0.0.0» |
| CR-874 | `questions.prefix-24.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «255.255.0.0» |
| CR-875 | `questions.prefix-24.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «255.255.255.255» |
| CR-876 | `questions.prefix-24.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «255.255.255.0» |
| CR-877 | `questions.prefix-24.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «/24 heißt: Die ersten 24 der 32 Bits sind das Ne…» |
| CR-878 | `questions.https-port.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Auf welchem Port nimmt ein Webserver HTTPS-Verbi…» |
| CR-879 | `questions.https-port.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «80» |
| CR-880 | `questions.https-port.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «443» |
| CR-881 | `questions.https-port.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «22» |
| CR-882 | `questions.https-port.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «25» |
| CR-883 | `questions.https-port.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «443 für HTTPS, 80 für unverschlüsseltes HTTP. Ei…» |
| CR-884 | `questions.ssh-port.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Welcher Dienst nutzt standardmäßig Port 22?» |
| CR-885 | `questions.ssh-port.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «SSH» |
| CR-886 | `questions.ssh-port.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «HTTP» |
| CR-887 | `questions.ssh-port.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «DNS» |
| CR-888 | `questions.ssh-port.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «SMTP» |
| CR-889 | `questions.ssh-port.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Über SSH verwalten Admins heute Server und Conta…» |
| CR-890 | `questions.port-purpose.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Wozu dienen Ports?» |
| CR-891 | `questions.port-purpose.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Sie geben die Adresse eines Rechners im Netz an» |
| CR-892 | `questions.port-purpose.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Sie messen die Bandbreite» |
| CR-893 | `questions.port-purpose.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Sie ordnen eine Verbindung dem richtigen Program…» |
| CR-894 | `questions.port-purpose.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Sie verschlüsseln die Daten» |
| CR-895 | `questions.port-purpose.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Die IP-Adresse findet den Rechner, der Port das …» |
| CR-896 | `questions.first-match.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Eine Firewall prüft ihre Regeln von oben nach un…» |
| CR-897 | `questions.first-match.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Sie wird blockiert» |
| CR-898 | `questions.first-match.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Sie wird erlaubt» |
| CR-899 | `questions.first-match.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Sie wird auf Port 80 umgeleitet» |
| CR-900 | `questions.first-match.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Regel 1 passt auf alles und gilt zuerst; Regel 2…» |
| CR-901 | `questions.container.question` | puzzle / game | de / en / fa | PLACEHOLDER | Question text (Computer-Quiz). Now (de): «Was ist ein Container, etwa mit Docker?» |
| CR-902 | `questions.container.options.a` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option A (Computer-Quiz). Now (de): «Ein physischer Server im Rechenzentrum» |
| CR-903 | `questions.container.options.b` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option B (Computer-Quiz). Now (de): «Ein verschlüsselter Ordner für Passwörter» |
| CR-904 | `questions.container.options.c` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option C (Computer-Quiz). Now (de): «Ein anderes Wort für eine Festplatte» |
| CR-905 | `questions.container.options.d` | puzzle / game | de / en / fa | PLACEHOLDER | Answer option D (Computer-Quiz). Now (de): «Ein Programm mit allem, was es braucht, isoliert…» |
| CR-906 | `questions.container.explanation` | puzzle / game | de / en / fa | PLACEHOLDER | Explanation shown after answering (Computer-Quiz). Now (de): «Ein Container bringt sein Programm samt Biblioth…» |

**File:** `src/content/quiz.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-907 | `quizQuestions (question ids, era assignment, option order, correct answers)` | puzzle / game | all (machine text) | PLACEHOLDER | Answer key of all 31 questions; must be re-checked whenever any question or option is reworded |

## 21. Desktop app: Binary & Morse (bonus, unlocked by era 1)

**File:** `src/messages/apps/binary/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-908 | `intro` | long text | de / en / fa | PLACEHOLDER | Introductory text (Binary & Morse app). Now (de): «Für einen Computer ist Text eine Folge von Zahle…» |
| CR-909 | `tabsLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: tabs (Binary & Morse app). Now (de): «Umwandlung wählen» |
| CR-910 | `tabs.bytes` | single word / label | de / en / fa | PLACEHOLDER | Label: bytes (Binary & Morse app). Now (de): «Text & Bytes» |
| CR-911 | `tabs.morse` | single word / label | de / en / fa | PLACEHOLDER | Label: morse (Binary & Morse app). Now (de): «Morse» |
| CR-912 | `bytes.sourceLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: source (Binary & Morse app). Now (de): «Eingabe als» |
| CR-913 | `bytes.formats.text` | single word / label | de / en / fa | PLACEHOLDER | Body text (Binary & Morse app). Now (de): «Text» |
| CR-914 | `bytes.formats.binary` | single word / label | de / en / fa | PLACEHOLDER | Label: binary (Binary & Morse app). Now (de): «Binär» |
| CR-915 | `bytes.formats.hex` | single word / label | de / en / fa | PLACEHOLDER | Label: hex (Binary & Morse app). Now (de): «Hex» |
| CR-916 | `bytes.formats.decimal` | single word / label | de / en / fa | PLACEHOLDER | Label: decimal (Binary & Morse app). Now (de): «Dezimal» |
| CR-917 | `bytes.inputLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: input (Binary & Morse app). Now (de): «Eingabe: {format}» |
| CR-918 | `bytes.placeholders.text` | single word / label | de / en / fa | PLACEHOLDER | Short label: text (Binary & Morse app). Now (de): «Text eingeben» |
| CR-919 | `bytes.placeholders.binary` | short text | de / en / fa | PLACEHOLDER | Input placeholder: binary (Binary & Morse app). Now (de): «z. B. 01001000 01101001» |
| CR-920 | `bytes.placeholders.hex` | short text | de / en / fa | PLACEHOLDER | Input placeholder: hex (Binary & Morse app). Now (de): «z. B. 48 69» |
| CR-921 | `bytes.placeholders.decimal` | short text | de / en / fa | PLACEHOLDER | Input placeholder: decimal (Binary & Morse app). Now (de): «z. B. 72 105» |
| CR-922 | `bytes.summary` | long text | de / en / fa | PLACEHOLDER | Wording for "summary" (Binary & Morse app). Now (de): «{chars, plural, one {# Zeichen} other {# Zeichen…» |
| CR-923 | `bytes.errors.empty` | short text | de / en / fa | PLACEHOLDER | Error message: empty (Binary & Morse app). Now (de): «Geben Sie etwas ein.» |
| CR-924 | `bytes.errors.invalidDigit` | short text | de / en / fa | PLACEHOLDER | Error message: invalidDigit (Binary & Morse app). Now (de): «Hier steht ein Zeichen, das in diesem Format kei…» |
| CR-925 | `bytes.errors.incompleteByte` | short text | de / en / fa | PLACEHOLDER | Error message: incompleteByte (Binary & Morse app). Now (de): «Die Ziffern ergeben keine ganzen Bytes: Binär br…» |
| CR-926 | `bytes.errors.outOfRange` | short text | de / en / fa | PLACEHOLDER | Error message: outOfRange (Binary & Morse app). Now (de): «Ein Byte reicht von 0 bis 255.» |
| CR-927 | `bytes.errors.invalidUtf8` | short text | de / en / fa | PLACEHOLDER | Error message: invalidUtf8 (Binary & Morse app). Now (de): «Diese Bytes sind kein gültiges UTF-8 – vermutlic…» |
| CR-928 | `bytes.errors.tooLong` | short text | de / en / fa | PLACEHOLDER | Error message: tooLong (Binary & Morse app). Now (de): «Das ist zu lang für diese Umwandlung. Bitte kürz…» |
| CR-929 | `bytes.utf8Title` | short text | de / en / fa | PLACEHOLDER | Wording for "utf8Title" (Binary & Morse app). Now (de): «Wie viele Bytes braucht ein Zeichen?» |
| CR-930 | `bytes.utf8Explain` | long text | de / en / fa | PLACEHOLDER | Wording for "utf8Explain" (Binary & Morse app). Now (de): «UTF-8 speichert jedes Zeichen in 1 bis 4 Bytes: …» |
| CR-931 | `bytes.tableCaption` | short text | de / en / fa | PLACEHOLDER | Wording for "tableCaption" (Binary & Morse app). Now (de): «Jedes Zeichen mit seinem Unicode-Codepunkt und s…» |
| CR-932 | `bytes.table.char` | single word / label | de / en / fa | PLACEHOLDER | Short label: char (Binary & Morse app). Now (de): «Zeichen» |
| CR-933 | `bytes.table.codePoint` | single word / label | de / en / fa | PLACEHOLDER | Short label: codePoint (Binary & Morse app). Now (de): «Codepunkt» |
| CR-934 | `bytes.table.bytes` | single word / label | de / en / fa | PLACEHOLDER | Short label: bytes (Binary & Morse app). Now (de): «Bytes» |
| CR-935 | `bytes.table.bits` | single word / label | de / en / fa | PLACEHOLDER | Short label: bits (Binary & Morse app). Now (de): «Bits» |
| CR-936 | `bytes.byteCount` | short text | de / en / fa | PLACEHOLDER | Wording for "byteCount" (Binary & Morse app). Now (de): «{count, plural, one {# Byte} other {# Bytes}}» |
| CR-937 | `bytes.truncated` | short text | de / en / fa | PLACEHOLDER | Wording for "truncated" (Binary & Morse app). Now (de): «Gezeigt sind die ersten {count, number} Zeichen.» |
| CR-938 | `bytes.bitsLegend` | short text | de / en / fa | PLACEHOLDER | Wording for "bitsLegend" (Binary & Morse app). Now (de): «Jedes Kästchen ist ein Bit: gefüllt bedeutet 1, …» |
| CR-939 | `morse.directionLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: direction (Binary & Morse app). Now (de): «Richtung» |
| CR-940 | `morse.directions.toMorse` | single word / label | de / en / fa | PLACEHOLDER | Label: toMorse (Binary & Morse app). Now (de): «Text → Morse» |
| CR-941 | `morse.directions.toText` | single word / label | de / en / fa | PLACEHOLDER | Label: toText (Binary & Morse app). Now (de): «Morse → Text» |
| CR-942 | `morse.inputLabel.toMorse` | single word / label | de / en / fa | PLACEHOLDER | Short label: toMorse (Binary & Morse app). Now (de): «Text» |
| CR-943 | `morse.inputLabel.toText` | single word / label | de / en / fa | PLACEHOLDER | Short label: toText (Binary & Morse app). Now (de): «Morsezeichen» |
| CR-944 | `morse.placeholders.toMorse` | single word / label | de / en / fa | PLACEHOLDER | Short label: toMorse (Binary & Morse app). Now (de): «Text eingeben» |
| CR-945 | `morse.placeholders.toText` | short text | de / en / fa | PLACEHOLDER | Input placeholder: toText (Binary & Morse app). Now (de): «z. B. ... --- ... (Wörter mit / trennen)» |
| CR-946 | `morse.output.toMorse` | single word / label | de / en / fa | PLACEHOLDER | Short label: toMorse (Binary & Morse app). Now (de): «Morsezeichen» |
| CR-947 | `morse.output.toText` | single word / label | de / en / fa | PLACEHOLDER | Short label: toText (Binary & Morse app). Now (de): «Text» |
| CR-948 | `morse.unsupported` | short text | de / en / fa | PLACEHOLDER | Wording for "unsupported" (Binary & Morse app). Now (de): «Dafür gibt es kein Morsezeichen:» |
| CR-949 | `morse.unsupportedNote` | long text | de / en / fa | PLACEHOLDER | Wording for "unsupportedNote" (Binary & Morse app). Now (de): «Das internationale Morsealphabet kennt nur die 2…» |
| CR-950 | `morse.unknown` | short text | de / en / fa | PLACEHOLDER | Wording for "unknown" (Binary & Morse app). Now (de): «Diese Folge ist kein Morsezeichen:» |
| CR-951 | `morse.signalTitle` | single word / label | de / en / fa | PLACEHOLDER | Short label: signalTitle (Binary & Morse app). Now (de): «Als Signal» |
| CR-952 | `morse.play` | button | de / en / fa | PLACEHOLDER | Button label: play (Binary & Morse app). Now (de): «Abspielen» |
| CR-953 | `morse.playSound` | button | de / en / fa | PLACEHOLDER | Button label: playSound (Binary & Morse app). Now (de): «Ton abspielen» |
| CR-954 | `morse.stop` | button | de / en / fa | PLACEHOLDER | Button label: stop (Binary & Morse app). Now (de): «Stopp» |
| CR-955 | `morse.volume` | single word / label | de / en / fa | PLACEHOLDER | Short label: volume (Binary & Morse app). Now (de): «Lautstärke» |
| CR-956 | `morse.volumeValue` | single word / label | de / en / fa | PLACEHOLDER | Short label: volumeValue (Binary & Morse app). Now (de): «{percent, number} Prozent» |
| CR-957 | `morse.playing` | short text | de / en / fa | PLACEHOLDER | Wording for "playing" (Binary & Morse app). Now (de): «Das Signal wird abgespielt.» |
| CR-958 | `morse.finished` | short text | de / en / fa | PLACEHOLDER | Wording for "finished" (Binary & Morse app). Now (de): «Das Signal ist zu Ende.» |
| CR-959 | `morse.stopped` | short text | de / en / fa | PLACEHOLDER | Wording for "stopped" (Binary & Morse app). Now (de): «Das Signal wurde gestoppt.» |
| CR-960 | `morse.speed` | short text | de / en / fa | PLACEHOLDER | Wording for "speed" (Binary & Morse app). Now (de): «Langsames Tempo, fünf Wörter pro Minute: etwa {s…» |
| CR-961 | `morse.noAudio` | short text | de / en / fa | PLACEHOLDER | Wording for "noAudio" (Binary & Morse app). Now (de): «Dieser Browser kann keinen Ton erzeugen; das Lic…» |
| CR-962 | `morse.timelineLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: timeline (Binary & Morse app). Now (de): «Das Signal als Zeitleiste: {code}» |
| CR-963 | `morse.timelineNote` | short text | de / en / fa | PLACEHOLDER | Wording for "timelineNote" (Binary & Morse app). Now (de): «Ein Punkt dauert eine Einheit, ein Strich drei. …» |
| CR-964 | `morse.truth` | long text | de / en / fa | PLACEHOLDER | The era's one mechanical truth in this app's own words (Binary & Morse app). Now (de): «Auch Morse ist eine Codierung: Jedes Zeichen wir…» |

**File:** `src/components/apps/binary/BinaryApp.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-965 | `SAMPLE_TEXT and SAMPLE_MORSE_TEXT (prefilled examples)` | short text | all (machine text) | PLACEHOLDER | Prefilled sample inputs ("Hi سلام 👋", "SOS") |

## 22. Desktop app: Snake (bonus, unlocked by era 4)

**File:** `src/messages/apps/snake/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-966 | `score` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "score" (Snake app). Now (de): «Punkte» |
| CR-967 | `best` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "best" (Snake app). Now (de): «Bestwert» |
| CR-968 | `boardRole` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "boardRole" (Snake app). Now (de): «Spielfeld» |
| CR-969 | `boardLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: board (Snake app). Now (de): «Snake-Spielfeld» |
| CR-970 | `overlay.ready` | puzzle / game | de / en / fa | PLACEHOLDER | Game overlay message: ready (Snake app). Now (de): «Starten Sie mit „Start“, einer Pfeiltaste oder e…» |
| CR-971 | `overlay.paused` | puzzle / game | de / en / fa | PLACEHOLDER | Game overlay message: paused (Snake app). Now (de): «Pause. Weiter mit der Leertaste oder „Weiter“.» |
| CR-972 | `overlay.over` | puzzle / game | de / en / fa | PLACEHOLDER | Game overlay message: over (Snake app). Now (de): «Vorbei – {score, plural, one {# Punkt} other {# …» |
| CR-973 | `overlay.won` | puzzle / game | de / en / fa | PLACEHOLDER | Game overlay message: won (Snake app). Now (de): «Das ganze Feld ist gefüllt. Mehr Platz gibt es n…» |
| CR-974 | `start` | button | de / en / fa | PLACEHOLDER | Button label: start (Snake app). Now (de): «Start» |
| CR-975 | `pause` | button | de / en / fa | PLACEHOLDER | Button label: pause (Snake app). Now (de): «Pause» |
| CR-976 | `resume` | button | de / en / fa | PLACEHOLDER | Button label: resume (Snake app). Now (de): «Weiter» |
| CR-977 | `again` | button | de / en / fa | PLACEHOLDER | Button label: again (Snake app). Now (de): «Noch einmal» |
| CR-978 | `restart` | button | de / en / fa | PLACEHOLDER | Button label: restart (Snake app). Now (de): «Neu beginnen» |
| CR-979 | `padLabel` | puzzle / game | de / en / fa | PLACEHOLDER | Accessible label: pad (Snake app). Now (de): «Steuerkreuz» |
| CR-980 | `directions.up` | puzzle / game | de / en / fa | PLACEHOLDER | Label: up (Snake app). Now (de): «Nach oben» |
| CR-981 | `directions.down` | puzzle / game | de / en / fa | PLACEHOLDER | Label: down (Snake app). Now (de): «Nach unten» |
| CR-982 | `directions.left` | puzzle / game | de / en / fa | PLACEHOLDER | Label: left (Snake app). Now (de): «Nach links» |
| CR-983 | `directions.right` | puzzle / game | de / en / fa | PLACEHOLDER | Label: right (Snake app). Now (de): «Nach rechts» |
| CR-984 | `helpKeys` | long text | de / en / fa | PLACEHOLDER | Wording for "helpKeys" (Snake app). Now (de): «Steuern mit den Pfeiltasten oder W, A, S, D. Lee…» |
| CR-985 | `helpTouch` | long text | de / en / fa | PLACEHOLDER | Wording for "helpTouch" (Snake app). Now (de): «Wischen Sie auf dem Spielfeld oder nutzen Sie da…» |
| CR-986 | `truth` | long text | de / en / fa | PLACEHOLDER | The era's one mechanical truth in this app's own words (Snake app). Now (de): «Das Feld hat genau 400 Kästchen, und jeder Happe…» |
| CR-987 | `played` | puzzle / game | de / en / fa | PLACEHOLDER | Wording for "played" (Snake app). Now (de): «{count, plural, one {# Spiel gespielt} other {# …» |
| CR-988 | `announce.started` | puzzle / game | de / en / fa | PLACEHOLDER | Screen-reader announcement: started (Snake app). Now (de): «Das Spiel läuft.» |
| CR-989 | `announce.paused` | puzzle / game | de / en / fa | PLACEHOLDER | Screen-reader announcement: paused (Snake app). Now (de): «Pause.» |
| CR-990 | `announce.resumed` | puzzle / game | de / en / fa | PLACEHOLDER | Screen-reader announcement: resumed (Snake app). Now (de): «Das Spiel läuft weiter.» |
| CR-991 | `announce.over` | puzzle / game | de / en / fa | PLACEHOLDER | Screen-reader announcement: over (Snake app). Now (de): «Spiel vorbei mit {score, plural, one {# Punkt} o…» |
| CR-992 | `announce.won` | puzzle / game | de / en / fa | PLACEHOLDER | Screen-reader announcement: won (Snake app). Now (de): «Das Feld ist voll: {score, number} Punkte.» |

## 23. Desktop app: Pixel Paint (bonus, unlocked by era 5)

**File:** `src/messages/apps/paint/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-993 | `canvasRole` | single word / label | de / en / fa | PLACEHOLDER | Short label: canvasRole (Pixel Paint app). Now (de): «Zeichenfläche» |
| CR-994 | `canvasLabel` | short text | de / en / fa | PLACEHOLDER | Accessible label: canvas (Pixel Paint app). Now (de): «Zeichenfläche {size, number} × {size, number} Pi…» |
| CR-995 | `canvasHelp` | long text | de / en / fa | PLACEHOLDER | Wording for "canvasHelp" (Pixel Paint app). Now (de): «Mit Maus, Finger oder Stift malen. Mit der Tasta…» |
| CR-996 | `toolsLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: tools (Pixel Paint app). Now (de): «Werkzeuge» |
| CR-997 | `tools.pencil` | single word / label | de / en / fa | PLACEHOLDER | Label: pencil (Pixel Paint app). Now (de): «Stift» |
| CR-998 | `tools.eraser` | single word / label | de / en / fa | PLACEHOLDER | Label: eraser (Pixel Paint app). Now (de): «Radierer» |
| CR-999 | `tools.fill` | single word / label | de / en / fa | PLACEHOLDER | Label: fill (Pixel Paint app). Now (de): «Füllen» |
| CR-1000 | `tools.picker` | single word / label | de / en / fa | PLACEHOLDER | Label: picker (Pixel Paint app). Now (de): «Farbe aufnehmen» |
| CR-1001 | `undo` | button | de / en / fa | PLACEHOLDER | Button label: undo (Pixel Paint app). Now (de): «Rückgängig» |
| CR-1002 | `redo` | button | de / en / fa | PLACEHOLDER | Button label: redo (Pixel Paint app). Now (de): «Wiederholen» |
| CR-1003 | `clear` | button | de / en / fa | PLACEHOLDER | Button label: clear (Pixel Paint app). Now (de): «Leeren» |
| CR-1004 | `grid` | single word / label | de / en / fa | PLACEHOLDER | Short label: grid (Pixel Paint app). Now (de): «Raster» |
| CR-1005 | `sizeLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: size (Pixel Paint app). Now (de): «Größe» |
| CR-1006 | `sizeConfirm` | long text | de / en / fa | PLACEHOLDER | Wording for "sizeConfirm" (Pixel Paint app). Now (de): «Eine neue Größe beginnt ein leeres Bild mit {siz…» |
| CR-1007 | `sizeConfirmYes` | button | de / en / fa | PLACEHOLDER | Button label: sizeConfirmYes (Pixel Paint app). Now (de): «Neues Bild beginnen» |
| CR-1008 | `sizeConfirmNo` | button | de / en / fa | PLACEHOLDER | Button label: sizeConfirmNo (Pixel Paint app). Now (de): «Abbrechen» |
| CR-1009 | `paletteLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: palette (Pixel Paint app). Now (de): «Palette» |
| CR-1010 | `palettes.bit1.name` | short text | de / en / fa | PLACEHOLDER | Display name (Pixel Paint app). Now (de): «1 Bit · 2 Farben» |
| CR-1011 | `palettes.bit1.note` | long text | de / en / fa | PLACEHOLDER | Explanatory note (Pixel Paint app). Now (de): «1 Bit pro Pixel: Jeder Bildpunkt ist an oder aus…» |
| CR-1012 | `palettes.ega16.name` | short text | de / en / fa | PLACEHOLDER | Display name (Pixel Paint app). Now (de): «4 Bit · 16 Farben» |
| CR-1013 | `palettes.ega16.note` | long text | de / en / fa | PLACEHOLDER | Explanatory note (Pixel Paint app). Now (de): «4 Bit pro Pixel ergeben 16 Farben: die Palette v…» |
| CR-1014 | `palettes.vga256.name` | short text | de / en / fa | PLACEHOLDER | Display name (Pixel Paint app). Now (de): «8 Bit · 256 Farben» |
| CR-1015 | `palettes.vga256.note` | long text | de / en / fa | PLACEHOLDER | Explanatory note (Pixel Paint app). Now (de): «8 Bit pro Pixel ergeben 256 Farben gleichzeitig,…» |
| CR-1016 | `memory` | short text | de / en / fa | PLACEHOLDER | Wording for "memory" (Pixel Paint app). Now (de): «Dieses Bild braucht so {bytes} Bytes Speicher ({…» |
| CR-1017 | `colorLabel` | single word / label | de / en / fa | PLACEHOLDER | Accessible label: color (Pixel Paint app). Now (de): «Farbe» |
| CR-1018 | `swatch` | short text | de / en / fa | PLACEHOLDER | Wording for "swatch" (Pixel Paint app). Now (de): «Farbe {index, number} von {count, number}: {hex}» |
| CR-1019 | `download` | button | de / en / fa | PLACEHOLDER | Button label: download (Pixel Paint app). Now (de): «Als PNG herunterladen» |
| CR-1020 | `saveNote` | long text | de / en / fa | PLACEHOLDER | Wording for "saveNote" (Pixel Paint app). Now (de): «Das Bild wird nur in diesem Browser gespeichert …» |
| CR-1021 | `saveFailed` | short text | de / en / fa | PLACEHOLDER | Wording for "saveFailed" (Pixel Paint app). Now (de): «Automatisches Speichern ist in diesem Browser ge…» |
| CR-1022 | `announce.picked` | short text | de / en / fa | PLACEHOLDER | Screen-reader announcement: picked (Pixel Paint app). Now (de): «Farbe {color} aufgenommen, zurück zum Stift.» |
| CR-1023 | `announce.undone` | short text | de / en / fa | PLACEHOLDER | Screen-reader announcement: undone (Pixel Paint app). Now (de): «Rückgängig gemacht.» |
| CR-1024 | `announce.redone` | short text | de / en / fa | PLACEHOLDER | Screen-reader announcement: redone (Pixel Paint app). Now (de): «Wiederholt.» |
| CR-1025 | `announce.cleared` | short text | de / en / fa | PLACEHOLDER | Screen-reader announcement: cleared (Pixel Paint app). Now (de): «Bild geleert.» |
| CR-1026 | `announce.palette` | short text | de / en / fa | PLACEHOLDER | Screen-reader announcement: palette (Pixel Paint app). Now (de): «Palette gewechselt: {name}. Jede Farbe wurde dur…» |
| CR-1027 | `announce.size` | short text | de / en / fa | PLACEHOLDER | Screen-reader announcement: size (Pixel Paint app). Now (de): «Neues Bild, {size, number} × {size, number} Pixe…» |
| CR-1028 | `announce.downloaded` | short text | de / en / fa | PLACEHOLDER | Screen-reader announcement: downloaded (Pixel Paint app). Now (de): «Das PNG wurde erstellt.» |

## 24. Pages and assets that do not exist yet

Nothing to mark in code yet. Registered so they are not forgotten; each gets real content in its phase.

**File:** not built yet

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1031 | 404 page: `notFound.*` in `src/messages/{de,en,fa}.json` + the title pattern in `src/app/not-found.tsx` (built 2026-09-23) | short text | de / en / fa | PLACEHOLDER | One page in all three languages (a stray URL has no locale): title, one sentence, links home, journey, desktop; noindex. Now (de): «Seite nicht gefunden» |
| CR-1032 | Timeline app content (`os.apps.timeline.*` is a placeholder, app is not built) | long text | de / en / fa | BUILT 2026-09-23 - see section 29 | Real timeline entries of the career path |
| CR-1033 | Résumé PDF (`/files/ahmadreza-taheri-lebenslauf.pdf`) - file itself | other | de / en / fa | PLACEHOLDER | The actual CV document, in which languages |
| CR-1034 | Portrait photo (`/images/portrait.jpg`) - file itself | other | de / en / fa | PLACEHOLDER | Real photo, rights and consent, final alt text |
| CR-1035 | Network-tools app (bonus, era 6, Phase 9D-2): all copy | long text | de / en / fa | PLACEHOLDER | Title, description and content of the tool |
| CR-1036 | Time Machine app (bonus, era 7, Phase 9D-2): all copy | long text | de / en / fa | PLACEHOLDER | Title, description and content of the theme switcher |
| CR-1037 | Scheduler and Filesystem bonus apps (eras 2 and 3): all copy | long text | de / en / fa | PLACEHOLDER | Slots are registered (`os.apps.scheduler`, `os.apps.filesystem`) but the apps do not exist yet |

## 25. SEO and metadata

Titles, descriptions, Open Graph, manifest and everything search engines and link previews read.

**File:** `src/messages/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1038 | `site.title` | SEO / meta | de / en / fa | PLACEHOLDER | Title (site-wide metadata). Now (de): «Ahmadreza Taheri – Fachinformatiker für Systemin…» |
| CR-1039 | `site.brand` | SEO / meta | de / en / fa | PLACEHOLDER | Wording for "brand" (site-wide metadata). Now (de): «Amonel» |
| CR-1040 | `site.tagline` | SEO / meta | de / en / fa | PLACEHOLDER | Wording for "tagline" (site-wide metadata). Now (de): «80 Jahre Computergeschichte in 90 Sekunden» |
| CR-1041 | `site.description` | SEO / meta | de / en / fa | PLACEHOLDER | One-sentence summary (also usable as SEO snippet) (site-wide metadata). Now (de): «Portfolio von Ahmadreza Taheri, Auszubildender F…» |
| CR-1042 | `site.author` | SEO / meta | de / en / fa | PLACEHOLDER | Wording for "author" (site-wide metadata). Now (de): «Ahmadreza Taheri» |

**File:** `src/app/[[...locale]]/layout.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1043 | `viewTitle (title format: "page - name \| Brand")` | SEO / meta | de / en / fa | PLACEHOLDER | Title pattern per view; final wording decides how the name ranks |
| CR-1044 | `generateMetadata (description, Open Graph type/locale/siteName)` | SEO / meta | de / en / fa | PLACEHOLDER | Meta description and Open Graph fields per view (all views share `site.description` today) |

**File:** `public/manifest.webmanifest`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1045 | `name, short_name, description (German only)` | SEO / meta | de | PLACEHOLDER | Web-app manifest text; JSON, so tracked only here: name "Amonel – Ahmadreza Taheri", description in German |

**File:** not built yet

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1046 | JSON-LD (Person, WebSite, ProfilePage): `src/lib/structured-data.ts` + `site.persianName`, `site.jobTitle`, `site.knowsAbout` in `src/messages/{de,en,fa}.json` (built 2026-09-23) | SEO / meta | de / en / fa | PLACEHOLDER | Job title, knowsAbout list per language; `image` and `sameAs` wait for the portrait and the profiles (ROADMAP OWN-01, OWN-03) |
| CR-1047 | `public/robots.txt` - bot policy (built 2026-09-23) | SEO / meta | all (machine text) | PLACEHOLDER | Allows every crawler and names the AI answering and training bots, by the owner’s decision; confirm the list is still wanted |
| CR-1048 | `src/app/sitemap.ts` - `out/sitemap.xml` (built 2026-09-23) | SEO / meta | de / en / fa | PLACEHOLDER | Nine URLs with hreflang alternates and x-default; legal pages left out (noindex); priorities 1 landing, 0.8 others |
| CR-1049 | `public/llms.txt` - summary for AI crawlers (built 2026-09-23); the static text fallback for crawlers is ROADMAP SEO-10 | SEO / meta | en (with the Persian name) | PLACEHOLDER | Who he is, role, employer, focus, languages, contact e-mail, the three parts of the site, links. Only facts the site already states; confirm each, and whether the employer may be named (ROADMAP LEG-08) |
| CR-1050 | Open Graph images `public/og/og-{de,en,fa}.png` (made by `scripts/og-image.mjs` from `site.author`, `site.persianName`, `site.jobTitle`, `site.tagline`) and their alt text `site.ogAlt` (built 2026-09-23) | SEO / meta | de / en / fa | PLACEHOLDER | Share image per language: name (Persian first in fa), job, tagline, ahmadreza.de, the interim Amonel mark; regenerate after the copy review and once the final logo exists (ROADMAP BR-01) |
| CR-1051 | `site.journeyDescription`, `site.desktopDescription` in `src/messages/{de,en,fa}.json`, used in `generateMetadata` (built 2026-09-23) | SEO / meta | de / en / fa | PLACEHOLDER | Distinct snippets for /amonel/ and /desktop/; drafts run 140-190 characters, Google shows about 155 - shorten in the review |

## 26. Legal pages, legal links and the coming-soon page

The Impressum and the Datenschutzerklärung are **not placeholders**: they were written from an audit of the real data flows (2026-09-23) and are legal text. Their status is **LEGAL – owner must verify** until Ahmadreza has read and approved them (ideally with a lawyer or the Verbraucherzentrale). German is binding; en and fa say so and link to it. The postal address and e-mail live only in `src/content/legal.ts`.

**Files:** `src/messages/legal/{de,en,fa}.json`, `src/content/legal.ts`, `src/components/legal/LegalPage.tsx`, `scripts/build-soon.mjs`, `soon/index.html`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1029 | Impressum: `imprint.*` in `messages/legal/*.json` + `LEGAL_CONTACT` (`/impressum/`, `/en/impressum/`, `/fa/impressum/`) | legal | de / en / fa | LEGAL – owner must verify | § 5 DDG and § 18 Abs. 2 MStV: legal name Ahmadreza Taheri Momrabadi, address, e-mail; private, non-commercial site; no phone number - decided by the owner (2026-09-23, confirmed 2026-09-24, ROADMAP LEG-13) |
| CR-1030 | Datenschutzerklärung: `privacy.*` in `messages/legal/*.json` (`/datenschutz/`, en, fa) | legal | de / en / fa | LEGAL – owner must verify | Cloudflare hosting (Art. 6(1)(f), DPF + SCC), no cookies or external requests, the six storage keys (§ 25(2) Nr. 2 TDDDG; `amonel.theme.v1` added 2026-09-24 with the Time Machine), anonymous counters, the local Assistant, e-mail via Gmail (Google), rights, LfDI RLP |
| CR-1052 | `nav.legal` (`src/messages/{de,en,fa}.json`), the accessible name of the legal-link group on every page | single word / label | de / en / fa | PLACEHOLDER | Now (de): «Rechtliches». The link labels themselves are CR-007 and CR-008 («Impressum», «Datenschutz» - keep those two exactly) |
| CR-1053 | `soon/index.html` - the whole live coming-soon page (tag, status, role, lede, facts, terminal lines, footer, legal links) | long text | de / en / fa | PLACEHOLDER | Rebranded to «Amonel» on 2026-09-24 (ROADMAP BR-02), progress now generated (CR-1066); the role line still names the employer (LEG-08) |
| CR-1054 | Legal page chrome: `updated`, `bindingNote`, `bindingLink`, `backHome`, `country`, `emailLabel` in `messages/legal/*.json` | legal | de / en / fa | LEGAL – owner must verify | «Stand: 23. September 2026», the note that only German is binding, the back link |
| CR-1055 | Coming-soon legal pages (`soon/dist/` `impressum/` and `datenschutz/` in de, en, fa, built by `scripts/build-soon.mjs` from the same JSON with scope `soon`) | legal | de / en / fa | LEGAL – owner must verify | Same text as CR-1029 and CR-1030 minus the counters, the Assistant and the site's storage table; plus the `ao-lang` storage entry and system fonts |

## 27. Static About page and the footer link

The About app’s own text (section 15) renders server-side as a page at `/about/`, `/en/about/`, `/fa/about/` (ROADMAP SEO-09); only these are new.

**Files:** `src/messages/{de,en,fa}.json`, `src/components/about/AboutPage.tsx`, `src/components/ui/SiteFooter.tsx`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1056 | `site.aboutDescription` - the About page’s meta description | SEO / meta | de / en / fa | PLACEHOLDER | Snippet for /about/ (134-153 characters). Now (de): «Über Ahmadreza Taheri: Ausbildung zum Fachinformatiker…» |
| CR-1057 | The About page’s URL `/about/` (one slug in all three languages) and its title «Über mich – Ahmadreza Taheri \| Amonel» (from `nav.about`, CR-003) | SEO / meta | de / en / fa | PLACEHOLDER | Confirm the slug (e.g. `/ueber-mich/` would suit German search but not en/fa) and the title |

## 28. Desktop app: Contact

The full Contact app (ROADMAP APP-02). `mailto:` and a copy button only - never a form.

**File:** `src/messages/apps/contact/{de,en,fa}.json`, `src/content/profiles.ts`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1058 | `title`, `intro` | short text | de / en / fa | PLACEHOLDER | Now (de): «Am besten erreichen Sie mich per E-Mail – auf Deutsch, Englisch oder Persisch.» Say only what is true: which languages, whether he wants a reply promise |
| CR-1059 | `email.label`, `email.write`, `email.copy`, `email.copied`, `email.pending` | button | de / en / fa | PLACEHOLDER | Labels of the e-mail row and the copy button |
| CR-1060 | `resume.label`, `resume.download`, `resume.pending` | button | de / en / fa | PLACEHOLDER | Résumé row; the PDF itself is CR-1033 |
| CR-1061 | `location.label`, `location.value` | short text | de / en / fa | PLACEHOLDER | Now (de): «Trier, Deutschland» - confirm he wants the city shown |
| CR-1062 | `profiles.label`, `profiles.pending`, `legal.label` | short text | de / en / fa | PLACEHOLDER | Shown until OWN-03 supplies the profile URLs |
| CR-1063 | `PROFILES` in `src/content/profiles.ts` (LinkedIn, GitHub, XING, all `url: null`) | other | all (machine text) | PLACEHOLDER | The real profile URLs; each appears once it has one, and feeds JSON-LD `sameAs` |

## 29. Desktop app: Timeline

The Timeline app (ROADMAP APP-01): the seven eras with their year, name and truth (the journey’s own `eras` copy, not repeated) and a link into the journey, ending with Ahmadreza’s current station (About’s copy).

**File:** `src/messages/apps/timeline/{de,en,fa}.json`

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1064 | `title`, `intro`, `erasLabel` | short text | de / en / fa | PLACEHOLDER | Now (de): «Achtzig Jahre Computergeschichte in sieben Stationen – und am Ende, wo Ahmadreza heute steht.» |
| CR-1065 | `open`, `now`, `since` | single word / label | de / en / fa | PLACEHOLDER | «In der Reise ansehen», «Ahmadreza heute», «seit {date}»; the start date itself is owed (OWN-05) |
| CR-1066 | `soon/index.html` - the rebrand to «Amonel» and the progress block in the terminal (`t1`, `t2`, `t3`, the date stamp; figures filled from ROADMAP.md by `build-soon.mjs`) | short text | de / en / fa | PLACEHOLDER | Now (de): «roadmap: 21 von 71 punkten erledigt», «aktuelle phase 9D-2 / 9D-3: 1 von 14 erledigt», «nächster schritt: die letzten apps, dann feinschliff und start», «stand: 2026-09-24». en and fa use the English terminal lines. Decide whether a percentage of roadmap items is what visitors should see, and the Persian wording |

## 30. Desktop app: Network tools (1995 bonus)

Copy in `src/messages/apps/network/{de,en,fa}.json`; data in `src/content/network.ts`.

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1067 | `dnsZones` in `src/content/network.ts` - the prepared DNS world (names under `.example`, the hidden TXT greeting on `amonel.example`) | other | all (machine text) | PLACEHOLDER | Now: `hello=curious-visitor; you-read-dns-records-for-fun; ask-ahmadreza-about-networks`. Decide whether the greeting stays and its wording |
| CR-1068 | `wellKnownPorts` and `portStories` in `src/content/network.ts`, with `ports.services.*` and `ports.stories.elite` | short text | de / en / fa | PLACEHOLDER | 25 common ports and one story (31337, Back Orifice). Which ports a recruiter should see |
| CR-1069 | `SUBNET_EXAMPLES`, `pingExamples`, `dnsExamples` - the one-click examples | other | all (machine text) | PLACEHOLDER | Now: 192.168.1.10/24, 10.20.30.40/8, 172.16.5.4 255.255.240.0, 192.168.178.23/26, 169.254.12.7/16 |
| CR-1070 | `intro`, `tabs.*`, `subnet.*` (explanations, errors, the ten address kinds, gateway verdicts, splitting, the 1995 truth) | long text | de / en / fa | PLACEHOLDER | Now (de): «Ein Netz braucht Adressen: Ohne sie findet keine Maschine die andere. …» Native-speaker check of the technical German and Persian |
| CR-1071 | `ping.*` (the simulation note, the notes for route, loopback, silent and unknown, the TTL line) | long text | de / en / fa | PLACEHOLDER | Now (de): «Es gibt keinen Ort wie 127.0.0.1 …». The command output itself is Windows 95 machine text |
| CR-1072 | `dns.*` (simulation note, record types, the five servers, answers, cache notes) | long text | de / en / fa | PLACEHOLDER | Now (de): «Diesmal kam die Antwort aus dem Cache: 0 ms statt einer Reise um die Welt.» |
| CR-1073 | `ports.*` (explain, the three IANA ranges, search messages, table, the link to the firewall era) | short text | de / en / fa | PLACEHOLDER | Now (de): «Eine Adresse findet die Maschine, ein Port das Programm darauf.» |

## 31. Desktop app: Time Machine (today bonus)

Copy in `src/messages/apps/time-machine/{de,en,fa}.json`; logic in `src/components/apps/time-machine/`.

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1074 | `intro`, `current`, `jumping`, `arrived`, `backHome`, `backButton`, `present`, `today`, `capsules`, `here`, `travel`, `storage`, `truth` | long text | de / en / fa | PLACEHOLDER | Now (de): «Steigen Sie ein: Ein Klick, und der ganze Desktop sieht aus wie in einer anderen Epoche …» and the lesson «Ein Theme ist nur Daten …» |
| CR-1075 | `themes.<id>.name`, `themes.<id>.look`, `effects.*` - the eight capsules | short text | de / en / fa | PLACEHOLDER | One name and one line per era look («Grüner Phosphor, Scanlines, ein blinkender Cursor.») |
| CR-1076 | `destination.*` - enter a year, and the answers for too early, the future and invalid input; `ERA_STARTS` (the cloud era from 2006) | short text | de / en / fa | PLACEHOLDER | Now (de): «… ist noch nicht gebaut. Die Maschine fährt nur in die Vergangenheit.» Confirm 2006 as the start of the cloud look |
| CR-1077 | Datenschutzerklärung: the storage-table row for `amonel.theme.v1` (`messages/legal/*.json`) | legal | de / en / fa | LEGAL – owner must verify | «Die Epoche, in die Sie den Desktop mit der Zeitmaschine versetzt haben …; wird erst geschrieben, wenn Sie reisen, und gelöscht, wenn Sie in die Gegenwart zurückkehren.» |

## 32. Terminal easter eggs (hidden commands)

Copy under `eggs` in `src/messages/apps/terminal/{de,en,fa}.json`; commands and drawings in `src/components/apps/terminal/shell.ts` (`HIDDEN_COMMANDS`).

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1078 | `eggs.moth`, `eggs.sl`, `eggs.coffee`, `eggs.rm`, `eggs.editor`, `eggs.hire`, `eggs.uptime`, `eggs.ping`, `eggs.fortune.0`..`6`; the ASCII moth and train (machine text) | short text | de / en / fa | PLACEHOLDER | Now (de): «Der erste „Bug" war echt: Am 9. September 1947 …», «Ausgezeichnete Idee. Der Befehl contact zeigt …». Seven sourced computing facts as fortunes; check each is how the owner wants to sound |

## 33. Role line without the employer (LEG-08)

The employer is never named (owner, 2026-09-24). The new role line replaces the old one everywhere it appeared.

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1079 | `landing.role`, the Trier fact in `landing.facts`, `site.description`, About `intro.0` and `path.stations.apprenticeship.place`, `public/llms.txt`, the role line and meta description of `soon/index.html` | short text | de / en / fa | PLACEHOLDER | Now: de «Fachinformatiker für Systemintegration in Ausbildung · Trier», en «IT specialist for system integration in training · Trier», fa «کارآموز متخصص فناوری اطلاعات (یکپارچه‌سازی سیستم‌ها) · تریر» (wording given by the owner; confirm in the final review) |

## 34. Coming-soon page, rewritten (BR-02)

`soon/index.html` (the static German HTML and the `T` dictionary for de/en/fa). The progress figures are not copy: they come from ROADMAP.md at build time.

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1080 | `status`, `intro`, `write`, the three lines in `ALT` (the page in the other two languages) and `FA_NAME` | short text | de / en / fa | PLACEHOLDER | Who and what in ten seconds. Now (de): «Hier entsteht mein persönliches Portfolio. Noch ist es nicht fertig – auf dieser Seite sehen Sie, was kommt und wie weit ich schon bin.» |
| CR-1081 | `whatTitle`, `whatLead`, the four cards `c1t`..`c4` | long text | de / en / fa | PLACEHOLDER | What the site will be: the journey through ~80 years, the puzzles, Amonel OS with working apps, the path Tehran → Trier, CV and contact, three languages. Confirm naming Tehran publicly |
| CR-1082 | `progressTitle`, `overall`, `note`, the seven area names and one-line descriptions, `counts`, `stamp` | short text | de / en / fa | PLACEHOLDER | Plain words, no internal codes. Now (de): «So weit bin ich», «Reise durch die Computergeschichte», «{d} fertig · {p} in Arbeit · {m} offen» |
| CR-1083 | `nextTitle`, `next`, `contact` | short text | de / en / fa | PLACEHOLDER | What's next, and an invitation to write. Now (de): «Als Nächstes: die letzten Apps, Tests auf echten Handys und Tablets, Foto und Lebenslauf. …» |
| CR-1084 | `<title>`, meta description, `og:title`, `og:description`, the `title` per language | SEO / meta | de / en / fa | PLACEHOLDER | Name, role and city first, «Amonel» second. The titles run over 60 characters (de 77) - report, never shorten the name |

## 35. Coming-soon page: search-engine text (Part 4, 2026-09-24)

`soon/index.html` head and `scripts/soon-seo.mjs`. The JSON-LD facts come from `messages/de.json` `site` and `EMAIL`/`PROFILES`, so they are copy of the main site, not new copy.

| ID | Location | Type | Languages | Status | What the real text should cover |
|---|---|---|---|---|---|
| CR-1086 | Coming-soon pages in English and Persian (`/en/`, `/fa/`, SEO-15): all page text in `soon/copy.mjs`, plus the English and Persian titles, descriptions, share texts and image alt texts | SEO / page copy | en, fa | PLACEHOLDER | en title «Ahmadreza Taheri – IT System Integration Apprentice, Trier»; fa title «احمدرضا طاهری – کارآموز فناوری اطلاعات، تریر» (44 characters, must keep the Persian name). Descriptions and share texts are new, written 2026-09-24 in the style of the German ones. Native-speaker proofreading needed |
| CR-1085 | `og:title`, `og:description`, `og:image:alt`, `twitter:title`, `twitter:description`, `twitter:image:alt`, `og:site_name` (Amonel) | SEO / meta | de | PLACEHOLDER | Now (de): «Das Portfolio Amonel entsteht gerade: 80 Jahre Computergeschichte, die zu einem eigenen Betriebssystem im Browser werden.» The share image itself is the existing `public/og/ahmadreza-taheri-de.png`; regenerate it for the final logo (BR-01) |
| CR-1084 | `<title>` and `<meta name="description">` (updated) | SEO / meta | de | PLACEHOLDER | Title (55 characters, shortened 2026-09-24 to fit the 60 a result page shows; the role is "Fachinformatiker (Ausbildung)"): «Ahmadreza Taheri – Fachinformatiker (Ausbildung), Trier». Description (159 characters): «Ahmadreza Taheri, Fachinformatiker für Systemintegration in Ausbildung in Trier. Sein Portfolio Amonel: 80 Jahre Computergeschichte als eigenes Betriebssystem.» Decide the wording with SEO-14 |
| CR-1087 | `knowsAbout` (added Computerreparatur / Handyreparatur / Endpoint-Management and translations, incl. the Persian کامپیوتر and تعمیر موبایل و کامپیوتر) in `src/messages/{de,en,fa}.json`, and `NAME_VARIANTS` in `src/lib/structured-data.ts` | SEO / meta | de / en / fa | PLACEHOLDER | Confirm the repair background may be stated publicly, the skill wording, and the name spellings (Ahmadreza, Taheri, Ahmad Reza Taheri, Persian forms) |
| CR-1088 | `landing.background` (new line under the role on the landing page) and `background` on the three coming-soon pages (`soon/copy.mjs`) | short text | de / en / fa | PLACEHOLDER | de «Mit Hintergrund in Computer- und Handyreparatur», en «With a background in computer and mobile phone repair», fa «با پیشینهٔ تعمیر کامپیوتر و موبایل». Added 2026-09-24 (queue 2b): the repair background helps the name rank for those searches. Check that the owner wants it named this prominently |
| CR-1089 | Meta descriptions rewritten to carry the background (`site.description` in `src/messages/*.json`, `SEO.*.description` in `soon/copy.mjs` and the template default) and `knowsAbout` retranslated to the same seven concepts in every language | SEO / meta | de / en / fa | PLACEHOLDER | Coming-soon de (147 characters): «Ahmadreza Taheri, Fachinformatiker für Systemintegration in Ausbildung in Trier, mit Hintergrund in Computer- und Handyreparatur. Portfolio Amonel.» The main site description is longer (it keeps the operating-system hook; see the file). Replaces the wording of CR-1084 for the description. knowsAbout: IT support, system integration, computer networks, Linux, computer repair, mobile phone repair, endpoint management (Persian: تعمیر کامپیوتر / تعمیر موبایل as two concepts, replacing the earlier «کامپیوتر») |
| CR-1090 | `description`, `name` in `public/manifest.webmanifest`, `manifest.en.webmanifest`, `manifest.fa.webmanifest` (SEO-13) | short text | de / en / fa | PLACEHOLDER | de «Portfolio von Ahmadreza Taheri, Fachinformatiker für Systemintegration in Ausbildung.», en «Portfolio of Ahmadreza Taheri, IT specialist for system integration in training.», fa «نمونه‌کار احمدرضا طاهری، کارآموز متخصص فناوری اطلاعات (یکپارچه‌سازی سیستم).». Shown only when the site is installed or added to a home screen |
| CR-1091 | `result.toEra` in `src/messages/apps/quiz/{de,en,fa}.json` (APP-11): the link label after each missed era in the Computer-Quiz result | UI label | de / en / fa | PLACEHOLDER | de «Zur Epoche in der Reise», en «To this era in the journey», fa «به این دوران در سفر» |
