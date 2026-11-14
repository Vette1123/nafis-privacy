// The app reports freezes (ANRs) and Android's exit record through @vette1123/crash-kit;
// the policy only named crashes until 14 Nov 2026. Both languages must disclose it.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const html = fs.readFileSync(path.join(import.meta.dirname, '..', 'index.html'), 'utf8');

test('the policy discloses ANR reports in English and Arabic', () => {
  assert.match(html, /<li>Error, crash and freeze \(ANR\) reports:/);
  assert.match(html, /<li>تقارير الأخطاء والأعطال وتجمّد التطبيق \(ANR\):/);
});
