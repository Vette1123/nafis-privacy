// Which mohamedgado.com URL serves a changed file of this site, for the IndexNow workflow.
//   git diff --name-only A B -- '*.html' | node scripts/indexnow-url.mjs <base>
// prints "<file> <url>" per line. The proxy maps a directory's index.html to the directory
// (features/en/index.html → /features/en): mapped as a file, the index pages 404'd and were never sent.
export function pageUrl(file, base) {
  const map = { 'index.html': 'privacy', 'go.html': 'go', 'go-ar.html': 'go-ar' };
  if (map[file]) return `${base}/${map[file]}`;
  if (file.endsWith('/index.html')) return `${base}/${file.slice(0, -'/index.html'.length)}`;
  return `${base}/${file.replace(/\.html$/, '')}`;
}

if (process.argv[1]?.endsWith('indexnow-url.mjs')) {
  const base = process.argv[2];
  if (!base) throw new Error('usage: node scripts/indexnow-url.mjs <base> < files');
  const files = (await new Promise((r) => { let s = ''; process.stdin.on('data', (d) => (s += d)).on('end', () => r(s)); })).split('\n').filter(Boolean);
  for (const f of files) console.log(`${f} ${pageUrl(f, base)}`);
}
