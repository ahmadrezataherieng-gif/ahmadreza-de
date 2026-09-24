// The coming-soon page's figures, from ROADMAP.md at build time: the weighted
// progress overall (`all.*`) and per area (`journey.*`, ...), each with
// `percent`, `done`, `partial` and `missing`, plus the date of the build
// (`DATE` as ISO, `DATE_DE` as the German page shows it without script).
// Separate from build-soon.mjs so the tests can check the filled page without
// the legal address that build needs.

import { areaProgress, roadmapItems, roadmapProgress } from './roadmap.mjs';

export function progressValues(items = roadmapItems(), now = new Date()) {
  const values = {};
  const add = (prefix, progress) => {
    for (const key of ['percent', 'done', 'partial', 'missing']) values[`${prefix}.${key}`] = progress[key];
  };
  add('all', roadmapProgress(items));
  for (const area of areaProgress(items)) add(area.area, area);
  values.DATE = now.toISOString().slice(0, 10);
  values.DATE_DE = new Intl.DateTimeFormat('de', { dateStyle: 'long', timeZone: 'UTC' }).format(now);
  return values;
}

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

/** Every `{{key}}` must be a known value: a typo fails the build, never ships. */
export function fillPlaceholders(html, values) {
  return html.replace(/\{\{([A-Za-z_]+(?:\.[a-z]+)?)\}\}/g, (match, key) => {
    if (!(key in values)) throw new Error(`soon/index.html: unknown placeholder ${match}`);
    return escape(values[key]);
  });
}
