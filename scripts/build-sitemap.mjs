// sitemap.xml: every indexable page, at its canonical URL, dated from lastmod.json (the
// lastmod workflow writes that from git). A page the file does not know yet is dated today.
//   node scripts/build-sitemap.mjs           write it
//   node scripts/build-sitemap.mjs --check   exit 1 when it is stale
import fs from 'node:fs';
import path from 'node:path';
import { htmlFiles, readPage, repo } from './site-pages.mjs';

const lastmod = JSON.parse(fs.readFileSync(path.join(repo, 'lastmod.json'), 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const pages = htmlFiles().map(readPage).filter((p) => !p.noindex && p.canonical);
const x = (s) => s.replaceAll('&', '&amp;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .sort((a, b) => a.canonical.localeCompare(b.canonical))
  .map((p) => `  <url>\n    <loc>${x(p.canonical)}</loc>\n    <lastmod>${lastmod[p.file] ?? today}</lastmod>\n  </url>`)
  .join('\n')}
</urlset>
`;
const at = path.join(repo, 'sitemap.xml');
const have = fs.existsSync(at) ? fs.readFileSync(at, 'utf8').replace(/\r\n/g, '\n') : '';
if (process.argv.includes('--check')) {
  // Dates move with every page edit: only the URL set must match.
  const urls = (s) => [...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).join('\n');
  if (urls(have) !== urls(xml)) {
    console.error('sitemap.xml is stale (run node scripts/build-sitemap.mjs)');
    process.exit(1);
  }
  console.log(`sitemap lists ${pages.length} pages`);
} else {
  fs.writeFileSync(at, xml);
  console.log(`sitemap.xml: ${pages.length} pages`);
}
