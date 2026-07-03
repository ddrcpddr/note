import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

describe('Check script', () => {
  test('reports SQLite integrity for a healthy data directory', () => {
    const tempDataDir = mkdtempSync(path.join(tmpdir(), 'note-check-test-'));

    try {
      const result = spawnSync(process.execPath, ['src/server/scripts/check.js'], {
        cwd: repoRoot,
        env: {
          ...process.env,
          NOTE_DATA_DIR: tempDataDir
        },
        encoding: 'utf8'
      });

      assert.equal(result.status, 0, result.stderr);

      const payload = JSON.parse(result.stdout);
      assert.equal(payload.ok, true);
      assert.equal(payload.integrityCheck, 'ok');
      assert.equal(payload.categoryCount, 11);
      assert.equal(payload.noteCount, 0);
      assert.equal(path.resolve(payload.dbPath), path.join(path.resolve(tempDataDir), 'database', 'app.db'));
    } finally {
      rmSync(tempDataDir, { recursive: true, force: true });
    }
  });
});
