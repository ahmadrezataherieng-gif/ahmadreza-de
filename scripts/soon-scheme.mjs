// The light/dark toggle of the coming-soon pages (owner decision 2026-09-25, DECISIONS 74),
// shared by the landing page (scripts/soon-pages.mjs) and the legal pages (scripts/build-soon.mjs).
// Dark is the default always and the OS setting is never read: the choice is written to
// localStorage only after a click, applied before the first paint, and dark when storage fails.

// Inline in <head>, before the first paint.
export const SCHEME_HEAD = `<script>document.documentElement.classList.add('js');try{if(localStorage.getItem('ao-scheme')==='light')document.documentElement.dataset.scheme='light'}catch(e){}</script>`;

const ICONS = `<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;

const esc = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// `nav` is a locale's `nav` block of src/messages/<locale>.json. Invisible until the head script has marked the page as scripted (html.js).
export const schemeButton = (nav) =>
  `<button type="button" class="scheme" aria-label="${esc(nav.schemeToLight)}" title="${esc(nav.schemeToLight)}" data-to-light="${esc(nav.schemeToLight)}" data-to-dark="${esc(nav.schemeToDark)}">${ICONS}</button>`;

// At the end of <body>: keeps the button's label in step and stores the choice after a click.
export const SCHEME_CLICK = `<script>(function(){var b=document.querySelector('.scheme');if(!b)return;var d=document.documentElement;function sync(){var s=d.dataset.scheme==='light'?b.dataset.toDark:b.dataset.toLight;b.setAttribute('aria-label',s);b.title=s}sync();b.addEventListener('click',function(){var l=d.dataset.scheme!=='light';if(l)d.dataset.scheme='light';else delete d.dataset.scheme;try{localStorage.setItem('ao-scheme',l?'light':'dark')}catch(e){}sync()})})()</script>`;
