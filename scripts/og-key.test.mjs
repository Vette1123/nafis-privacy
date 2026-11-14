// node --test scripts/og-key.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { OG } from './components.mjs';

// The ?v= key is what makes crawlers and chat apps fetch a new og.jpg. It lived in
// components.mjs, go.copy.json and the hand-written pages; bumping one (14 Nov 2026,
// new icon) left the rest previewing the old card. Every page must carry OG's key.
const root = path.join(import.meta.dirname, '..');
const pages = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return ['go-img', 'node_modules', '.git', 'partials'].includes(e.name) ? [] : pages(p);
    return e.name.endsWith('.html') ? [p] : [];
  });

test('every og:image and twitter:image is the current OG', () => {
  const stale = [];
  for (const file of pages(root)) {
    const html = fs.readFileSync(file, 'utf8');
    for (const [, url] of html.matchAll(/(?:og|twitter):image" content="([^"]*og\.jpg[^"]*)"/g)) {
      if (url !== OG) stale.push(`${path.relative(root, file)}: ${url}`);
    }
  }
  assert.deepEqual(stale, []);
});
