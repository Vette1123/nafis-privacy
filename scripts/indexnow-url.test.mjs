// node --test scripts/indexnow-url.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { pageUrl } from './indexnow-url.mjs';

const B = 'https://www.mohamedgado.com/projects/nafis';
test('each changed file maps to the URL the proxy serves it at', () => {
  assert.equal(pageUrl('index.html', B), `${B}/privacy`);
  assert.equal(pageUrl('go-ar.html', B), `${B}/go-ar`);
  assert.equal(pageUrl('features/index.html', B), `${B}/features`);
  assert.equal(pageUrl('features/en/index.html', B), `${B}/features/en`);
  assert.equal(pageUrl('features/gold-news.html', B), `${B}/features/gold-news`);
  assert.equal(pageUrl('features/en/gold-news.html', B), `${B}/features/en/gold-news`);
  assert.equal(pageUrl('features/en/price-alerts.html', B), `${B}/features/en/price-alerts`);
  assert.equal(pageUrl('delete-account.html', B), `${B}/delete-account`);
});
