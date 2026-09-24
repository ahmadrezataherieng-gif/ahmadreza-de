// The employer is never named on the site (owner, 2026-09-24, ROADMAP LEG-08).
// One pattern for every test that guards it, written so that this file - and
// any file that imports it - never matches the pattern itself.
export const EMPLOYER = new RegExp(
  ['Stadt' + '\\s*' + 'verwaltung', 'Stadt' + ' Trier', 'city ' + 'administration', 'شهر' + 'داری'].join('|'),
  'i',
);
