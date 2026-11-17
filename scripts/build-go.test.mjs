// node --test scripts/build-go.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// The script once read go.copy.json relative to the shell's folder: from anywhere but the repo
// root it died with ENOENT (17 Nov). Run it from a folder that is not the repo.
test('build-go --check works from any folder, not only the repo root', () => {
  const r = spawnSync(process.execPath, [fileURLToPath(new URL('./build-go.mjs', import.meta.url)), '--check'], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /go pages up to date/);
});
