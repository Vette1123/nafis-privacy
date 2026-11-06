// The hand-written pages (the legal pages, the 404) carry the shared look from partials/
// between <!--partial:NAME--> markers. This fills them in place and minifies every inline
// <style>, as build-go.mjs does. Edit a partial, then run this and commit.
//
//   node scripts/build-pages.mjs           rewrite the pages
//   node scripts/build-pages.mjs --check   exit 1 naming pages that are stale, write nothing
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPartials, css } from './partials.mjs';

const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = ['head.html', 'theme.css', 'switch.js'];
const PAGES = {
  'index.html': [...base, 'doc.css', 'footer.en.html', 'footer.ar.html', 'topnav.en.html', 'topnav.ar.html'],
  'terms.html': [...base, 'doc.css', 'footer.en.html', 'footer.ar.html', 'topnav.en.html', 'topnav.ar.html'],
  'delete-account.html': [...base, 'doc.css', 'footer.en.html', 'footer.ar.html', 'topnav.en.html', 'topnav.ar.html'],
  'delete-data.html': [...base, 'doc.css', 'footer.en.html', 'footer.ar.html', 'topnav.en.html', 'topnav.ar.html'],
  '404.html': [...base, 'footer.en.html', 'topnav.en.html'],
};

const build = (html, require) =>
  applyPartials(html, { require }).replace(/<style>([\s\S]*?)<\/style>/g, (_, c) => `<style>${css(c)}</style>`);

const check = process.argv.includes('--check');
const stale = [];
for (const [file, require] of Object.entries(PAGES)) {
  const p = path.join(repo, file);
  const old = fs.readFileSync(p, 'utf8');
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
