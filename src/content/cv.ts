/**
 * The résumé's structure, as typed data: which entries stand in which section.
 *
 * Structure only. The words live in `messages/apps/cv/<locale>.json` under the
 * same ids; the apprenticeship reuses About's copy so the two never tell
 * different stories, and skills and languages come from `content/about.ts`.
 *
 * Nothing here is guessed. An entry whose facts Ahmadreza has not supplied is
 * a `placeholder` and renders visibly marked (OWN-05); a date that is owed is
 * `null`. CONTENT-TODO CR-1096
 */

export interface CvEntry {
  id: 'apprenticeship' | 'repair' | 'earlier' | 'school' | 'studies' | 'certificates';
  /** `YYYY-MM`, or null while the date is still owed. */
  start: string | null;
  /** `YYYY-MM`, or null: still running when `current`, otherwise owed. */
  end: string | null;
  current: boolean;
  /** The whole entry stands for facts still to come. */
  placeholder: boolean;
}

/** Work and training, newest first. The repair background is Ahmadreza's own statement; its dates and details are owed. */
export const cvExperience: readonly CvEntry[] = [
  { id: 'apprenticeship', start: null, end: null, current: true, placeholder: false },
  { id: 'repair', start: null, end: null, current: false, placeholder: false },
  { id: 'earlier', start: null, end: null, current: false, placeholder: true },
];

export const cvEducation: readonly CvEntry[] = [
  { id: 'school', start: null, end: null, current: false, placeholder: true },
  { id: 'studies', start: null, end: null, current: false, placeholder: true },
];

export const cvCertificates: readonly CvEntry[] = [{ id: 'certificates', start: null, end: null, current: false, placeholder: true }];
