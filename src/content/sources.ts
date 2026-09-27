import type { EraId } from './eras';

/**
 * The source registry (queue 2026-09-28 A2 item 1, ROADMAP LEG-20): one entry
 * per historical fact used anywhere on the site - every era's "insider"
 * detail (`puzzles.<eraId>.insider`) and every era's second fact, the
 * "Legende" (`puzzles.<eraId>.legend`, item 2), plus the Terminal's `LO`
 * command (item 2). A test (`sources.test.mjs`) fails if any of those is
 * missing an entry here.
 *
 * Preference order, per CLAUDE.md: a primary source (the original paper, a
 * manual, an archived standard) or an institutional one (a museum, a
 * standards body, the company itself) over a magazine or encyclopedia;
 * accepted only where nothing better could be found, noted in `checked`.
 * Claims avoid absolute wording ("the first computer") on purpose - these
 * are facts about ENIAC, Unix, MS-DOS &c., not superlatives about them.
 */

export type SourceKind = 'insider' | 'legend' | 'other';

export interface Source {
  /** `<eraId>-insider`, `<eraId>-legend`, or a standalone id for non-era facts (e.g. `terminal-lo`). */
  id: string;
  era: EraId | null;
  kind: SourceKind;
  /** One sentence: what this source backs, not the full copy text. */
  claim: string;
  url: string;
  title: string;
  publisher: string;
  /** YYYY-MM-DD, the day the link was last confirmed to work and to say this. */
  checked: string;
}

export const sources: readonly Source[] = [
  {
    id: 'eniac-insider',
    era: 'eniac',
    kind: 'insider',
    claim: 'Punch-card operators drew a diagonal pencil or felt-pen line across the top edge of a card deck, so a dropped deck could be sorted back into order.',
    url: 'https://en.wikipedia.org/wiki/Computer_programming_in_the_punched_card_era',
    title: 'Computer programming in the punched card era',
    publisher: 'Wikipedia (no primary manual found for this specific trick; corroborated by multiple period accounts)',
    checked: '2026-09-28',
  },
  {
    id: 'eniac-legend',
    era: 'eniac',
    kind: 'legend',
    claim: 'ENIAC computed in decimal (not binary), was reprogrammed by plugging cables and setting switches (rewiring a new problem could take days), and had roughly 17,000-18,000 vacuum tubes that failed mostly during power-on and power-off, so it was rarely switched off.',
    url: 'https://www.computerhistory.org/revolution/birth-of-the-computer/4/78',
    title: 'ENIAC',
    publisher: 'Computer History Museum',
    checked: '2026-09-28',
  },
  {
    id: 'batch-insider',
    era: 'batch',
    kind: 'insider',
    claim: 'The IBM 704 had sense switches on its console; a running FORTRAN program could test one with IF (SENSE SWITCH i), letting an operator steer it without stopping it.',
    url: 'https://bitsavers.org/pdf/ibm/704/24-6661-2_704_Manual_1955.pdf',
    title: '704 Electronic Data-Processing Machine: Manual of Operation',
    publisher: 'IBM (1955 manual, scanned by bitsavers.org)',
    checked: '2026-09-28',
  },
  {
    id: 'batch-legend',
    era: 'batch',
    kind: 'legend',
    claim: '"Chad" is the term for the small paper bits punched out of a card; a mispunched hole meant wrong data or a jammed card reader.',
    url: 'http://homepage.divms.uiowa.edu/~jones/cards/chad.html',
    title: "Chad, from Douglas W. Jones's punched card index",
    publisher: 'University of Iowa (Douglas W. Jones)',
    checked: '2026-09-28',
  },
  {
    id: 'unix-insider',
    era: 'unix',
    kind: 'insider',
    claim: "Up to the Sixth Edition, Unix's directory-change command was called chdir; the short cd came with the Seventh Edition in 1979.",
    url: 'https://archive.org/details/bitsavers_attunix7thersManualSeventhEditionJanuary1979Volume_30031831',
    title: "UNIX Programmer's Manual, Seventh Edition, January 1979",
    publisher: 'Bell Laboratories (scanned copy, Internet Archive / bitsavers.org)',
    checked: '2026-09-28',
  },
  {
    id: 'unix-legend',
    era: 'unix',
    kind: 'legend',
    claim: 'Unix time counts seconds since 1970-01-01 00:00 UTC; stored in a signed 32-bit counter, it overflows on 2038-01-19 03:14:07 UTC.',
    url: 'https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap04.html',
    title: 'The Open Group Base Specifications Issue 7: 4. General Concepts ("Seconds Since the Epoch")',
    publisher: 'The Open Group (POSIX.1-2017)',
    checked: '2026-09-28',
  },
  {
    id: 'dos-insider',
    era: 'dos',
    kind: 'insider',
    claim: 'In MS-DOS, pressing F3 retypes the previously entered command line.',
    url: 'https://www.computerhope.com/jargon/f/f3.htm',
    title: 'What is the F3 key?',
    publisher: 'Computer Hope (no Microsoft manual excerpt found for this specific key; a widely corroborated DOS behaviour)',
    checked: '2026-09-28',
  },
  {
    id: 'dos-legend',
    era: 'dos',
    kind: 'legend',
    claim: "The 640 KB limit came from the IBM PC's memory map (the upper 384 KB of the 1 MB address space was reserved for video memory and ROM), not from a lack of imagination; people tuned CONFIG.SYS and AUTOEXEC.BAT to reclaim what they could.",
    url: 'https://en.wikipedia.org/wiki/Upper_memory_area',
    title: 'Upper memory area',
    publisher: 'Wikipedia (memory-map facts corroborated by the IBM PC Technical Reference; no single primary source found for this exact phrasing)',
    checked: '2026-09-28',
  },
  {
    id: 'dos-legend-quote',
    era: 'dos',
    kind: 'legend',
    claim: '"640K ought to be enough for anybody" is not a verified Bill Gates quote; Gates has denied ever saying it.',
    url: 'https://www.computerworld.com/article/1563853/the-640k-quote-won-t-go-away-but-did-gates-really-say-it.html',
    title: "The '640K' quote won't go away - but did Gates really say it?",
    publisher: 'Computerworld',
    checked: '2026-09-28',
  },
  {
    id: 'macintosh-insider',
    era: 'macintosh',
    kind: 'insider',
    claim: 'Susan Kare found the symbol now on the Command key in an international symbol dictionary; in Sweden it marks a place of interest, for example on campground signs.',
    url: 'https://www.folklore.org/Swedish_Campground.html',
    title: 'Swedish Campground',
    publisher: 'Folklore.org (Andy Hertzfeld, on the original Macintosh team)',
    checked: '2026-09-28',
  },
  {
    id: 'macintosh-legend',
    era: 'macintosh',
    kind: 'legend',
    claim: 'Susan Kare drew the first Macintosh icons on graph paper, one square per pixel, before digitizing them. (Do not reproduce any of her icons.)',
    url: 'https://www.moma.org/collection/works/188382',
    title: 'Susan Kare. Apple Macintosh OS icon sketchbook. 1982',
    publisher: 'Museum of Modern Art (MoMA)',
    checked: '2026-09-28',
  },
  {
    id: 'win95-insider',
    era: 'win95',
    kind: 'insider',
    claim: "Windows 95 users checked their IP configuration by typing winipcfg after Start › Run; today's ipconfig did not exist yet.",
    url: 'https://www.computerhope.com/winipcfg.htm',
    title: 'Winipcfg command',
    publisher: 'Computer Hope',
    checked: '2026-09-28',
  },
  {
    id: 'win95-legend',
    era: 'win95',
    kind: 'legend',
    claim: "A PC had 16 IRQ lines; two devices sharing one IRQ could crash the system, and Windows 95's Plug and Play was nicknamed \"Plug and Pray\" for how unreliable it was.",
    url: 'https://en.wikipedia.org/wiki/Legacy_Plug_and_Play',
    title: 'Legacy Plug and Play',
    publisher: 'Wikipedia (the nickname is period slang; no single institutional source names its origin)',
    checked: '2026-09-28',
  },
  {
    id: 'cloud-insider',
    era: 'cloud',
    kind: 'insider',
    claim: 'On Linux, only root may bind a process to a TCP or UDP port below 1024.',
    url: 'https://www.w3.org/Daemon/User/Installation/PrivilegedPorts.html',
    title: 'Privileged Ports',
    publisher: 'World Wide Web Consortium (W3C)',
    checked: '2026-09-28',
  },
  {
    id: 'cloud-legend',
    era: 'cloud',
    kind: 'legend',
    claim: '"Works on my machine" is answered by containers: Docker, launched publicly in 2013, ships an app together with its whole runtime environment.',
    url: 'https://www.docker.com/blog/docker-nine-years-young/',
    title: 'Docker: Nine Years Young',
    publisher: 'Docker, Inc.',
    checked: '2026-09-28',
  },
  {
    id: 'terminal-lo',
    era: null,
    kind: 'other',
    claim: 'The first message sent over the ARPANET, on 1969-10-29 by Charley Kline (UCLA) toward the Stanford Research Institute, was meant to be "LOGIN" but the receiving system crashed after two letters, "LO".',
    url: 'https://www.lk.cs.ucla.edu/internet_first_words.html',
    title: "The Internet's First Words",
    publisher: 'UCLA (Leonard Kleinrock, who led the UCLA node)',
    checked: '2026-09-28',
  },
] as const;

export function getSource(id: string): Source | undefined {
  return sources.find((source) => source.id === id);
}
