// The SEO gate. Fails (exit 1) on: a duplicate title, description or canonical; a title over 60
// characters; a description outside 70-170; a missing canonical, og:image or twitter card; a
// JSON-LD block that does not parse; hreflang that is not reciprocal; an internal link that
// goes nowhere; a page missing from sitemap.xml; an indexable 404; a wrong contact email.
//   node scripts/check-site.mjs
import fs from 'node:fs';
import path from 'node:path';
import { htmlFiles, readPage, repo } from './site-pages.mjs';

const BASE = 'https://www.mohamedgado.com/projects/nafis';
const PAGES = 'https://vette1123.github.io/nafis-privacy';
const problems = new Set();
const bad = (file, msg) => problems.add(`${file}: ${msg}`);

const pages = htmlFiles().map(readPage);
const indexable = pages.filter((p) => !p.noindex);

// Where each canonical URL is served from, so a link can be followed to a file.
const byCanon = new Map(pages.filter((p) => p.canonical && !p.noindex).map((p) => [p.canonical, p]));
const fileFor = (url) => {
  if (byCanon.has(url)) return true;
  if (url.startsWith(`${PAGES}/`)) return fs.existsSync(path.join(repo, url.slice(PAGES.length + 1).split(/[?#]/)[0] || 'index.html'));
  return url.startsWith(BASE) ? false : null; // other hosts are not checked offline
};

const seen = { title: new Map(), description: new Map(), canonical: new Map() };
for (const p of indexable) {
  const f = p.file;
  if (!p.title) bad(f, 'no <title>');
  else if ([...p.title].length > 60) bad(f, `title is ${[...p.title].length} chars (max 60)`);
  if (!p.description) bad(f, 'no meta description');
  else if (p.description.length < 70 || p.description.length > 170) bad(f, `description is ${p.description.length} chars (70-170)`);
  if (!p.canonical) bad(f, 'no canonical');
  for (const k of ['title', 'description', 'canonical']) {
    if (!p[k]) continue;
    if (seen[k].has(p[k])) bad(f, `duplicate ${k} with ${seen[k].get(p[k])}`);
    else seen[k].set(p[k], f);
  }
  if (!/<html lang="(ar|en)" dir="(rtl|ltr)"/.test(p.html)) bad(f, 'html lang/dir missing');
  for (const tag of ['og:title', 'og:description', 'og:url', 'og:image']) if (!p.html.includes(`property="${tag}"`)) bad(f, `no ${tag}`);
  if (!p.html.includes('name="twitter:card"')) bad(f, 'no twitter:card');
  const img = p.html.match(/property="og:image" content="([^"]+)"/)?.[1];
  if (img?.startsWith(PAGES) && !fs.existsSync(path.join(repo, img.slice(PAGES.length + 1).split('?')[0]))) bad(f, `og:image file missing: ${img}`);
  for (const m of p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      bad(f, `JSON-LD does not parse: ${e.message}`);
    }
  }
  // FAQPage only for a FAQ the reader can see.
  if (p.html.includes('"FAQPage"') && !p.html.includes('<details')) bad(f, 'FAQPage without a visible FAQ');
  // hreflang: every alternate must exist and name this page back.
  for (const m of p.html.matchAll(/<link rel="alternate" hreflang="([\w-]+)" href="([^"]+)"/g)) {
    const [, , href] = m;
    const other = byCanon.get(href);
    if (!other) {
      bad(f, `hreflang target not a page: ${href}`);
      continue;
    }
    const back = [...other.html.matchAll(/<link rel="alternate" hreflang="[\w-]+" href="([^"]+)"/g)].map((x) => x[1]);
    if (!back.includes(p.canonical)) bad(f, `hreflang ${href} does not name this page back`);
  }
  if (/@yahoo\.com|@mohamedgado\.com\b/.test(p.html)) bad(f, 'old contact email');
}

// Internal links: every link into this site must land on a real page.
for (const p of pages) {
  for (const m of p.html.matchAll(/href="((?:https:\/\/(?:www\.mohamedgado\.com\/projects\/nafis|vette1123\.github\.io\/nafis-privacy))[^"]*)"/g)) {
    const url = m[1].replace(/&amp;/g, '&').split('#')[0];
    if (url === BASE || url === `${BASE}/` || url === `${PAGES}/`) continue; // the about page lives in the portfolio
    if (/\/(go-img|og\.jpg|icon\.png)/.test(url) || /\.(png|webp|avif|svg|jpg)(\?|$)/.test(url)) {
      if (!fileFor(url)) bad(p.file, `missing asset ${url}`);
      continue;
    }
    if (fileFor(url) === false) bad(p.file, `broken link ${url}`);
  }
}

const sitemap = fs.readFileSync(path.join(repo, 'sitemap.xml'), 'utf8');
for (const p of indexable) if (p.canonical && !sitemap.includes(`<loc>${p.canonical.replaceAll('&', '&amp;')}</loc>`)) bad(p.file, 'not in sitemap.xml');
const e404 = pages.find((p) => p.file === '404.html');
if (!e404?.noindex) bad('404.html', 'must be noindex');
if (!/Sitemap: \S+sitemap\.xml/.test(fs.readFileSync(path.join(repo, 'robots.txt'), 'utf8'))) bad('robots.txt', 'no Sitemap line');
if (!fs.existsSync(path.join(repo, 'lastmod.json'))) bad('lastmod.json', 'missing');

if (problems.size) {
  console.error(['SITE CHECK FAILED (' + problems.size + '):', ...problems].join('\n'));
  process.exit(1);
}
console.log(`site check ok: ${indexable.length} indexable pages, titles/descriptions/canonicals unique, hreflang reciprocal, links resolve`);
