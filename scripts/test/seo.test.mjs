import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

import { structuredData, serialiseJsonLd } from '../../src/lib/structured-data.ts';
import { leaksAddress } from './private-address.mjs';
import { EMAIL } from '../../src/content/profile.ts';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

test('robots.txt: allows everything, names every AI bot the owner chose, points at the sitemap', () => {
  const robots = read('public/robots.txt');
  const lines = robots.split(/\r?\n/).filter((line) => line && !line.startsWith('#'));
  assert.ok(!lines.some((line) => /^Disallow:\s*\S/i.test(line)), 'nothing disallowed');
  assert.ok(!lines.some((line) => /^crawl-delay/i.test(line)), 'no crawl-delay');
  for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'GPTBot', 'ClaudeBot', 'anthropic-ai', 'CCBot', 'Google-Extended', 'meta-externalagent']) {
    assert.ok(lines.includes(`User-agent: ${bot}`), bot);
  }
  assert.ok(lines.includes('Sitemap: https://ahmadreza.de/sitemap.xml'));
});

test('sitemap: built from the views, the noindex legal pages left out', () => {
  const source = read('src/app/sitemap.ts');
  assert.match(source, /view !== 'imprint' && view !== 'privacy'/);
  assert.match(source, /'x-default'/);
});

test('llms.txt: names the person in both spellings, links the site, never the address or the legal name', () => {
  const llms = read('public/llms.txt');
  assert.match(llms, /^# Ahmadreza Taheri/);
  assert.ok(llms.includes('احمدرضا طاهری'));
  assert.ok(llms.includes('https://ahmadreza.de/amonel/'));
  assert.doesNotMatch(llms, /Momrabadi/);
  assert.ok(!leaksAddress(llms));
});

test('JSON-LD: one Person and one WebSite by @id, a ProfilePage only on the landing page, never the legal name or address', () => {
  const copy = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: ['Linux'], inLanguage: 'de-DE', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-de.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };
  const landing = structuredData(copy);
  const types = landing['@graph'].map((node) => node['@type']);
  assert.deepEqual(types, ['Person', 'WebSite', 'CreativeWork', 'ImageObject', 'ProfilePage']);
  assert.ok(landing['@graph'][0].alternateName.includes('احمدرضا طاهری'));
  assert.equal(landing['@graph'][4].mainEntity['@id'], landing['@graph'][0]['@id']);
  assert.deepEqual(structuredData({ ...copy, isProfilePage: false })['@graph'].map((node) => node['@type']), ['Person', 'WebSite', 'CreativeWork']);
  const json = serialiseJsonLd(landing);
  assert.doesNotMatch(json, /Momrabadi|streetAddress/);
  assert.ok(!leaksAddress(json));
  assert.ok(!serialiseJsonLd({ x: '</script>' }).includes('</script>'));
});

test('e-mail: one address on the whole site, from EMAIL in content/profile.ts (llms.txt, legal pages, JSON-LD)', () => {
  assert.ok(read('public/llms.txt').includes(`Contact: ${EMAIL.address}`));
  assert.match(read('src/content/legal.ts'), /email: EMAIL\.address/);
  const copy = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: [], inLanguage: 'de-DE', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-de.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };
  assert.equal(structuredData(copy)['@graph'][0].email, `mailto:${EMAIL.address}`);
  // The retired domain address appears nowhere a visitor or crawler can read it.
  for (const file of ['public/llms.txt', 'soon/index.html', 'src/content/profile.ts', ...['de', 'en', 'fa'].map((locale) => `src/messages/${locale}.json`)]) {
    assert.doesNotMatch(read(file), /kontakt@ahmadreza/, file);
  }
});

const entity = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: ['IT support'], inLanguage: 'de-DE', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-de.png', width: 1200, height: 630, alt: 'Ahmadreza Taheri' }, description: 'd', pageUrl: 'https://ahmadreza.de/', isProfilePage: true };

test('entity JSON-LD: round-trips as JSON, Person and WebSite carry the name, the name variants are spellings only', () => {
  const graph = JSON.parse(serialiseJsonLd(structuredData(entity)))['@graph'];
  const person = graph.find((node) => node['@type'] === 'Person');
  const website = graph.find((node) => node['@type'] === 'WebSite');
  assert.equal(person.name, 'Ahmadreza Taheri');
  assert.equal(website.name, 'Ahmadreza Taheri');
  assert.equal(website.url, 'https://ahmadreza.de/');
  assert.deepEqual(person.alternateName, ['Ahmadreza', 'Taheri', 'Ahmad Reza Taheri', 'احمدرضا', 'احمدرضا طاهری']);
  assert.ok(Array.isArray(person.sameAs ?? []));
});

test('entity JSON-LD: Amonel is its own work with the Person as creator, never part of the Person', () => {
  const graph = structuredData(entity)['@graph'];
  const person = graph.find((node) => node['@type'] === 'Person');
  const brand = graph.find((node) => node.name === 'Amonel');
  assert.equal(brand['@type'], 'CreativeWork');
  assert.notEqual(brand['@id'], person['@id']);
  assert.equal(brand.creator['@id'], person['@id']);
  assert.doesNotMatch(JSON.stringify(person), /Amonel/i);
  assert.ok(![graph.find((node) => node['@type'] === 'WebSite')].some((node) => /Amonel/i.test(node.name)));
});

test('entity JSON-LD: the primary image is an ImageObject on the ProfilePage, named after the person', () => {
  const graph = structuredData(entity)['@graph'];
  const page = graph.find((node) => node['@type'] === 'ProfilePage');
  const image = graph.find((node) => node['@type'] === 'ImageObject');
  assert.equal(page.primaryImageOfPage['@id'], image['@id']);
  assert.match(image.url, /\/og\/ahmadreza-taheri-de\.png$/);
});

test('entity: every locale and the coming-soon pages keep Amonel out of the Person, and og:image / twitter:image use the renamed file', () => {
  const layout = read('src/app/[[...locale]]/layout.tsx');
  assert.equal([...layout.matchAll(/\/og\/ahmadreza-taheri-\$\{locale\}\.png/g)].length, 3, 'openGraph, twitter and JSON-LD');
  assert.doesNotMatch(layout, /\/og\/og-/);
  const soon = read('soon/index.html');
  assert.match(soon, /property="og:image" content="https:\/\/ahmadreza\.de\/og\/ahmadreza-taheri-de\.png"/);
  assert.match(soon, /name="twitter:image" content="https:\/\/ahmadreza\.de\/og\/ahmadreza-taheri-de\.png"/);
  for (const locale of ['de', 'en', 'fa']) {
    assert.ok(existsSync(`public/og/ahmadreza-taheri-${locale}.png`), locale);
    const site = JSON.parse(read(`src/messages/${locale}.json`)).site;
    assert.ok(site.landingTitle.length <= 60 && site.landingTitle.startsWith(site.author), `${locale} landing title: ${site.landingTitle.length} characters, the name first`);
    assert.equal(site.knowsAbout.length, 7, `${locale} knowsAbout: the same seven concepts in every language`);
    const messages = JSON.parse(read(`src/messages/${locale}.json`));
    assert.ok(messages.landing.background.length > 10, `${locale} landing.background (the repair background under the role)`);
  }
});

test('SEO-13: one web manifest per language, each starting in its own language', () => {
  const files = { de: 'manifest.webmanifest', en: 'manifest.en.webmanifest', fa: 'manifest.fa.webmanifest' };
  const start = { de: '/', en: '/en/', fa: '/fa/' };
  for (const locale of ['de', 'en', 'fa']) {
    const manifest = JSON.parse(read(`public/${files[locale]}`));
    assert.equal(manifest.lang, locale);
    assert.equal(manifest.start_url, start[locale]);
    assert.equal(manifest.scope, start[locale]);
    assert.equal(manifest.dir, locale === 'fa' ? 'rtl' : 'ltr');
    assert.ok(manifest.name.includes('Amonel') && manifest.description.length > 20, locale);
  }
  assert.match(read('src/app/[[...locale]]/layout.tsx'), /manifest\.\$\{locale\}\.webmanifest/);
});

// Queue 2026-09-27 item 4: the About pages carry an AboutPage about the Person.
test('JSON-LD: an AboutPage only when asked for, about the Person, with the page title and description', () => {
  const copy = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: [], inLanguage: 'en', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-en.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/en/about/', isProfilePage: false };
  assert.ok(!structuredData(copy)['@graph'].some((node) => node['@type'] === 'AboutPage'));
  const graph = structuredData({ ...copy, aboutPage: { name: 'About me – Ahmadreza Taheri | Amonel', description: 'About d' }, dateModified: '2026-09-27T00:00:00.000Z' })['@graph'];
  const page = graph.find((node) => node['@type'] === 'AboutPage');
  const person = graph.find((node) => node['@type'] === 'Person');
  const website = graph.find((node) => node['@type'] === 'WebSite');
  assert.equal(page['@id'], 'https://ahmadreza.de/en/about/#webpage');
  assert.equal(page.url, 'https://ahmadreza.de/en/about/');
  assert.equal(page.name, 'About me – Ahmadreza Taheri | Amonel');
  assert.equal(page.description, 'About d');
  assert.equal(page.inLanguage, 'en');
  assert.deepEqual(page.about, { '@id': person['@id'] });
  assert.deepEqual(page.mainEntity, { '@id': person['@id'] });
  assert.deepEqual(page.isPartOf, { '@id': website['@id'] });
  assert.equal(page.dateModified, '2026-09-27T00:00:00.000Z');
  assert.ok(!graph.some((node) => node['@type'] === 'ProfilePage'), 'the About page is no ProfilePage');
});

// Queue 2026-09-28 A1 item 2: Amonel OS and the journey as hasPart of the Amonel brand.
test('JSON-LD: Amonel OS and the journey are hasPart of the Amonel CreativeWork, never a SoftwareApplication or rated', () => {
  const base = { name: 'Ahmadreza Taheri', jobTitle: 'Job', knowsAbout: [], inLanguage: 'en', siteName: 'Amonel', image: { url: 'https://ahmadreza.de/og/ahmadreza-taheri-en.png', width: 1200, height: 630, alt: 'alt' }, description: 'd', pageUrl: 'https://ahmadreza.de/en/', isProfilePage: false };
  const graphNoExtra = structuredData(base)['@graph'];
  assert.ok(!graphNoExtra.some((node) => node['@type'] === 'LearningResource'), 'nothing added without the data');
  const brandBare = graphNoExtra.find((node) => node['@type'] === 'CreativeWork' && node.name === 'Amonel');
  assert.ok(!('hasPart' in brandBare), 'no hasPart without amonelOs/journey');

  const copy = {
    ...base,
    amonelOs: { url: 'https://ahmadreza.de/en/desktop/', name: 'Amonel OS', description: 'Amonel OS desc' },
    journey: {
      url: 'https://ahmadreza.de/en/amonel/',
      name: 'The Journey – Ahmadreza Taheri | Amonel',
      description: 'Journey desc',
      inLanguage: 'en',
      eras: [
        { index: 1, name: 'ENIAC', about: 'Text is numbers.' },
        { index: 2, name: 'Batch', about: 'A computer hates waiting.' },
      ],
    },
  };
  const graph = structuredData(copy)['@graph'];
  const person = graph.find((node) => node['@type'] === 'Person');
  const brand = graph.find((node) => node['@type'] === 'CreativeWork' && node.name === 'Amonel');
  const amonelOs = graph.find((node) => node['@id'] === 'https://ahmadreza.de/en/desktop/#amonelos');
  const journey = graph.find((node) => node['@type'] === 'LearningResource');
  const eraNodes = graph.filter((node) => node['@type'] === 'CreativeWork' && node.about);

  assert.deepEqual(brand.hasPart, [{ '@id': amonelOs['@id'] }, { '@id': journey['@id'] }]);
  assert.equal(amonelOs.name, 'Amonel OS');
  assert.equal(amonelOs.url, 'https://ahmadreza.de/en/desktop/');
  assert.deepEqual(amonelOs.creator, { '@id': person['@id'] });
  assert.ok(!('aggregateRating' in amonelOs) && !('offers' in amonelOs), 'never rated or sold');

  assert.equal(journey['@id'], 'https://ahmadreza.de/en/amonel/#journey');
  assert.equal(journey.learningResourceType, 'interactive');
  assert.equal(journey.educationalLevel, 'beginner');
  assert.equal(journey.inLanguage, 'en');
  assert.deepEqual(journey.teaches, ['Text is numbers.', 'A computer hates waiting.']);
  assert.equal(eraNodes.length, 2);
  assert.equal(eraNodes[0]['@id'], 'https://ahmadreza.de/en/amonel/#era-1');
  assert.equal(eraNodes[0].url, 'https://ahmadreza.de/en/amonel/#era-1');
  assert.equal(eraNodes[0].name, 'ENIAC');
  assert.equal(eraNodes[0].about, 'Text is numbers.');
  assert.deepEqual(eraNodes[0].isPartOf, { '@id': journey['@id'] });
  assert.deepEqual(journey.hasPart, eraNodes.map((node) => ({ '@id': node['@id'] })));
  assert.ok(!graph.some((node) => ['SoftwareApplication', 'WebApplication', 'Course', 'EducationalOrganization'].includes(node['@type'])), 'never these types');
});

test('built About pages: one AboutPage each, with the page title and description, no sameAs yet', { skip: !existsSync(new URL('../../out/about/index.html', import.meta.url)) }, () => {
  for (const [folder, lang] of [['about', 'de-DE'], ['en/about', 'en'], ['fa/about', 'fa']]) {
    const html = read(`out/${folder}/index.html`);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1])['@graph'];
    const pages = graph.filter((node) => node['@type'] === 'AboutPage');
    assert.equal(pages.length, 1, `${folder}: one AboutPage`);
    const title = html.match(/<title>(.*?)<\/title>/)[1].replaceAll('&amp;', '&');
    const description = html.match(/<meta name="description" content="([^"]*)"/)[1].replaceAll('&amp;', '&');
    assert.equal(pages[0].name, title, `${folder}: name = <title>`);
    assert.equal(pages[0].description, description, `${folder}: description = meta description`);
    assert.equal(pages[0].inLanguage, lang);
    assert.equal(pages[0].url, `https://ahmadreza.de/${folder}/`);
    assert.equal(graph.find((node) => node['@type'] === 'Person').sameAs, undefined, `${folder}: sameAs waits for the profiles`);
  }
  for (const folder of ['', 'amonel/', 'desktop/']) {
    assert.ok(!read(`out/${folder}index.html`).includes('"AboutPage"'), `${folder || '/'}: no AboutPage`);
  }
});
