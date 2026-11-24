// node --test scripts/features.test.mjs
// The feature pages are generated from data, so the data is where a mistake hides: a slug that
// is not a file, a related card that points nowhere, a title that Google would cut.
import test from 'node:test';
import assert from 'node:assert/strict';
import { FEATURES, UI } from './features-data.mjs';
import { buildAll } from './build-features.mjs';

const slugs = new Set(FEATURES.map((f) => f.slug));

test('every feature is complete in both languages', () => {
  assert.equal(slugs.size, FEATURES.length, 'duplicate slug');
  for (const f of FEATURES) {
    for (const lang of ['ar', 'en']) {
      const c = f[lang];
      assert.ok(c.points.length >= 4, `${f.slug} ${lang}: points`);
      assert.ok(c.faq.length >= 3, `${f.slug} ${lang}: faq`);
      assert.ok([...c.title].length <= 60, `${f.slug} ${lang}: title ${[...c.title].length}`);
      assert.ok(c.description.length >= 110 && c.description.length <= 160, `${f.slug} ${lang}: description ${c.description.length}`);
    }
    for (const r of f.related) assert.ok(slugs.has(r) && r !== f.slug, `${f.slug}: related ${r}`);
    if (f.shot) assert.ok(UI.en.shotAlt[f.shot] && UI.ar.shotAlt[f.shot], `${f.slug}: shot alt`);
  }
});

test('one page per feature per language, plus both hubs', () => {
  const files = [...buildAll().keys()];
  assert.equal(files.length, FEATURES.length * 2 + 2);
  assert.ok(files.includes('features/index.html') && files.includes('features/en/index.html'));
});

test('a page with an FAQ says so in JSON-LD, with the same questions it shows', () => {
  const html = buildAll().get('features/en/price-alerts.html');
  assert.match(html, /"@type":"FAQPage"/);
  for (const [q] of FEATURES.find((f) => f.slug === 'price-alerts').en.faq) assert.ok(html.includes(`<summary>${q}</summary>`));
  assert.match(html, /"applicationCategory":"FinanceApplication"/);
});
