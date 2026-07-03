import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function runCheck(dataDir) {
  const result = spawnSync(process.execPath, ['src/server/scripts/check.js'], {
    cwd: repoRoot,
    env: { ...process.env, NOTE_DATA_DIR: dataDir },
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function runRestore(dataDir, backupPath, extraArgs = []) {
  return spawnSync(process.execPath, ['src/server/scripts/restore-database-backup.js', '--backup', backupPath, ...extraArgs], {
    cwd: repoRoot,
    env: { ...process.env, NOTE_DATA_DIR: dataDir },
    encoding: 'utf8'
  });
}

function firstNoteId(db) {
  const existing = db.prepare('SELECT id FROM notes ORDER BY created_at, id LIMIT 1').get();
  if (existing?.id) return existing.id;

  const id = 'restore-test-note';
  const now = new Date().toISOString();
  const sql = 'INSERT INTO notes (' +
    'id, title, content, content_text, summary, category_id, member_id, note_type, source_type, save_status, visibility, created_at, updated_at' +
    ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.prepare(sql).run(
    id,
    '恢复测试记录',
    '恢复测试内容',
    '恢复测试内容',
    '恢复测试内容',
    'family',
    'self',
    'normal',
    'manual',
    'saved',
    'family',
    now,
    now
  );
  return id;
}

function setMarker(dbPath, marker) {
  const db = new DatabaseSync(dbPath);
  try {
    db.prepare('UPDATE notes SET title = ? WHERE id = ?').run(marker, firstNoteId(db));
  } finally {
    db.close();
  }
}

function getMarker(dbPath) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    return db.prepare('SELECT title FROM notes WHERE id = ?').get(firstNoteId(db)).title;
  } finally {
    db.close();
  }
}

function parseLastJson(text) {
  const start = text.lastIndexOf('{');
  assert.ok(start >= 0, text);
  return JSON.parse(text.slice(start));
}

describe('Database restore script', () => {
  test('dry-runs a healthy backup without replacing the current database', () => {
    const tempDataDir = mkdtempSync(path.join(tmpdir(), 'note-restore-test-'));

    try {
      const check = runCheck(tempDataDir);
      const dbPath = check.dbPath;
      const backupPath = path.join(tempDataDir, 'backups', 'healthy.db');
      copyFileSync(dbPath, backupPath);
      setMarker(dbPath, '当前正式库标记');

      const result = runRestore(tempDataDir, backupPath);
      assert.equal(result.status, 0, result.stderr);

      const payload = JSON.parse(result.stdout);
      assert.equal(payload.ok, true);
      assert.equal(payload.dryRun, true);
      assert.equal(payload.restored, false);
      assert.equal(getMarker(dbPath), '当前正式库标记');
    } finally {
      rmSync(tempDataDir, { recursive: true, force: true });
    }
  });

  test('restores only after --confirm and preserves the previous database copy', () => {
    const tempDataDir = mkdtempSync(path.join(tmpdir(), 'note-restore-test-'));

    try {
      const check = runCheck(tempDataDir);
      const dbPath = check.dbPath;
      const backupPath = path.join(tempDataDir, 'backups', 'healthy.db');
      setMarker(dbPath, '备份里的记录');
      copyFileSync(dbPath, backupPath);
      setMarker(dbPath, '恢复前当前库');

      const result = runRestore(tempDataDir, backupPath, ['--confirm']);
      assert.equal(result.status, 0, result.stderr);

      const payload = JSON.parse(result.stdout);
      assert.equal(payload.ok, true);
      assert.equal(payload.dryRun, false);
      assert.equal(payload.restored, true);
      assert.ok(payload.currentDatabaseBackupPath);
      assert.ok(existsSync(payload.currentDatabaseBackupPath));
      assert.equal(getMarker(dbPath), '备份里的记录');
      assert.equal(getMarker(payload.currentDatabaseBackupPath), '恢复前当前库');
    } finally {
      rmSync(tempDataDir, { recursive: true, force: true });
    }
  });

  test('rejects a non-database backup before restore', () => {
    const tempDataDir = mkdtempSync(path.join(tmpdir(), 'note-restore-test-'));

    try {
      runCheck(tempDataDir);
      const backupPath = path.join(tempDataDir, 'backups', 'bad.db');
      copyFileSync(new URL('../README.md', import.meta.url), backupPath);

      const result = runRestore(tempDataDir, backupPath, ['--confirm']);
      assert.notEqual(result.status, 0);
      const payload = parseLastJson(result.stderr);
      assert.equal(payload.ok, false);
      assert.match(payload.error, /Backup integrity_check failed|file is not a database|database disk image is malformed/);
    } finally {
      rmSync(tempDataDir, { recursive: true, force: true });
    }
  });
});
