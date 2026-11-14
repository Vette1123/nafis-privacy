// The one place that lists the site's pages: every built .html (not partials/, not the go
// template), its canonical URL, and whether it is indexable. build-sitemap.mjs and
// check-site.mjs both read through this, so a new page is in the sitemap and under the SEO
// rules the moment it exists.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['partials', 'node_modules', '.git', '.github', '.claude', 'lessons', 'scripts', 'go-img']);

export function htmlFiles(dir = repo, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) out.push(...htmlFiles(path.join(dir, e.name), `${base}${e.name}/`));
    } else if (e.name.endsWith('.html') && e.name !== 'go.template.html') out.push(`${base}${e.name}`);
  }
  return out.sort();
}

export function readPage(file) {
  // Whitespace collapsed: a formatter wraps long attributes onto their own lines.
  const html = fs.readFileSync(path.join(repo, file), 'utf8').replace(/\s+/g, ' ');
  const pick = (re) => html.match(re)?.[1];
  return {
    file,
    html,
    title: pick(/<title>([^<]*)<\/title>/),
    description: pick(/<meta name="description" content="([^"]*)"/),
    canonical: pick(/<link rel="canonical" href="([^"]+)"/),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
  };
}
