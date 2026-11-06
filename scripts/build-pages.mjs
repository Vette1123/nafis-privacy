// The hand-written pages (the legal pages, the 404) carry the shared look from partials/
// between <!--partial:NAME--> markers. This fills them in place and minifies every inline
// <style>, as build-go.mjs does. Edit a partial, then run this and commit.
//
//   node scripts/build-pages.mjs           rewrite the pages
//   node scripts/build-pages.mjs --check   exit 1 naming pages that are stale, write nothing
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPartials, css, SITE } from './partials.mjs';

const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// Every two-language page: the show-one-language rules and both footers.
const bilingual = [...SITE, 'lang.css', 'doc.css', 'footer.en.html', 'footer.ar.html'];
const PAGES = {
  'index.html': bilingual,
  'terms.html': bilingual,
  'delete-account.html': bilingual,
  'delete-data.html': bilingual,
  '404.html': [...SITE, 'footer.en.html'],
};

const build = (html, require) =>
  applyPartials(html, { require }).replace(/<style>([\s\S]*?)<\/style>/g, (_, c) => `<style>${css(c)}</style>`);

const check = process.argv.includes('--check');
const stale = [];
for (const [file, require] of Object.entries(PAGES)) {
  const p = path.join(repo, file);
  const old = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const next = build(old, require);
  if (next === old) continue;
  stale.push(file);
  if (!check) fs.writeFileSync(p, next);
}
if (check && stale.length) {
  console.error('stale (run node scripts/build-pages.mjs): ' + stale.join(', '));
  process.exit(1);
}
console.log(check ? 'pages up to date' : stale.length ? 'rebuilt: ' + stale.join(', ') : 'nothing to rebuild');
