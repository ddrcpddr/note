import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

const repoRoot = process.cwd();
const tempDataDir = path.join(tmpdir(), 'note-auto-backup-' + Date.now() + '-' + Math.random().toString(36).slice(2));
const port = 6510 + Math.floor(Math.random() * 1000);
const baseUrl = 'http://127.0.0.1:' + port;

let serverProcess;
let serverStdout = '';
let serverStderr = '';

async function requestJson(route) {
  const response = await fetch(baseUrl + route);
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(route + ' returned ' + response.status + ': ' + text);
  return data;
}

async function waitFor(predicate, label) {
  const startedAt = Date.now();
  let lastValue;
  while (Date.now() - startedAt < 10_000) {
    if (serverProcess.exitCode !== null) {
      throw new Error('Server exited early. stdout: ' + serverStdout + ' stderr: ' + serverStderr);
    }
    lastValue = await predicate();
    if (lastValue) return lastValue;
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error('Timed out waiting for ' + label + '. Last value: ' + JSON.stringify(lastValue) + ' stdout: ' + serverStdout + ' stderr: ' + serverStderr);
}

before(async () => {
  serverProcess = spawn(process.execPath, ['src/server/index.js'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
      NOTE_DATA_DIR: tempDataDir,
      NOTE_AUTO_BACKUP_INTERVAL_MS: '200'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (chunk) => {
    serverStdout += chunk.toString();
  });
  serverProcess.stderr.on('data', (chunk) => {
    serverStderr += chunk.toString();
  });

  await waitFor(async () => {
    try {
      const health = await requestJson('/api/health');
      return health.ok;
    } catch {
      return false;
    }
  }, 'health');
});

after(async () => {
  if (serverProcess && !serverProcess.killed) {
    const closed = new Promise((resolve) => serverProcess.once('close', resolve));
    serverProcess.kill();
    await closed;
  }

  rmSync(tempDataDir, { recursive: true, force: true });
});

describe('Automatic backups', () => {
  test('creates a scheduled database backup when enabled by env', async () => {
    const status = await waitFor(async () => {
      const storage = await requestJson('/api/storage/status');
      return storage.latestBackup?.status === 'completed' ? storage : null;
    }, 'scheduled backup');

    assert.ok(status.latestBackup.filePath.includes('backups'));
    assert.ok(status.latestBackup.fileSize > 0);
    assert.equal(existsSync(status.latestBackup.filePath), true);
  });
});
